"""
QemuManager — backend service for Raspberry Pi simulator emulation via QEMU.

Architecture
------------
Each Pi board instance gets:
  - qemu-system-aarch64 process (-M virt -cpu cortex-a53 for Pi 3, other
    cpu models for the rest of the family — see Phase 3 plan)
  - Velxio-built kernel + initramfs + rootfs (not the rpi-firmware kernel
    and not raspios; see ``project/pi-emulation/`` for why)
  - virtio-blk root from a qcow2 overlay over the cached rootfs ext4
  - virtio-console on chardev 0 (TCP socket) — the user shell at /dev/hvc0
  - virtio-serial port on chardev 1 (TCP socket) — multiplexed text
    protocol channel for GPIO/I2C/SPI/UART/PWM (Phase 2 wires it up)

We were on ``-M raspi3b`` previously but QEMU 10 + kernel 6.12 had a
pl011 RX bug that broke userspace tty open — see
``project/pi-emulation/decisions.md`` for the full debugging trail.
The ``raspberry-pi-3`` manifest entry remains around (marked deprecated)
to ease rollback; ``raspberry-pi-3-virt`` is the live one.

Boot files are resolved at runtime via BootImageProvider (downloads,
verifies, caches under /var/cache/velxio/boot-images/...). The lifespan
hook at the bottom pre-warms the cache so first-time user requests
don't pay the download latency.

Protocol channel (chardev 1) — wired by Phase 2's pi_protocol_mux
  Pi  → backend :  "GPIO <bcm> <0|1>\\n"   (also I2C/SPI/UART/PWM lines)
  backend → Pi  :  "SET <bcm> <0|1>\\n"    and reply frames
"""

import asyncio
import logging
import os
import socket
import subprocess
import tempfile
from pathlib import Path
from typing import Callable, Awaitable

from app.core.hooks import register_lifespan_startup
from app.services.boot_images import (
    BootImageError,
    BootImageProvider,
    get_default_provider,
)

logger = logging.getLogger(__name__)

# Image-set id (matches a key in `boot_images/manifest.json`).
PI3_IMAGE_SET = 'raspberry-pi-3-virt'

# Filenames the provider materialises (must match `name` fields in the
# manifest entry for PI3_IMAGE_SET).
PI3_KERNEL_NAME    = 'velxio-kernel-arm64'
PI3_INITRAMFS_NAME = 'velxio-initramfs-arm64.cpio.gz'
PI3_ROOTFS_NAME    = 'velxio-pi-rootfs-arm64.ext4'


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


EventCallback = Callable[[str, dict], Awaitable[None]]


class PiInstance:
    """State for one running Pi board."""

    def __init__(self, client_id: str, callback: EventCallback):
        self.client_id = client_id
        self.callback  = callback

        # Runtime state
        self.process:      subprocess.Popen | None = None
        self.overlay_path: str | None = None
        self.serial_port:  int = 0   # virtio-console TCP port (/dev/hvc0)
        self.gpio_port:    int = 0   # virtio-serial protocol TCP port (/dev/vport0p2)
        self._serial_writer: asyncio.StreamWriter | None = None
        self._gpio_writer:   asyncio.StreamWriter | None = None
        self._tasks: list[asyncio.Task] = []
        self.running = False

    async def emit(self, event_type: str, data: dict) -> None:
        try:
            await self.callback(event_type, data)
        except Exception as e:
            logger.error('emit(%s): %s', event_type, e)


class QemuManager:
    def __init__(self, provider: BootImageProvider | None = None):
        self._instances: dict[str, PiInstance] = {}
        # The provider is resolved lazily on first boot so importing
        # this module never triggers a download or even a manifest
        # parse. Injected via the constructor for tests; production
        # uses `get_default_provider()` on first use.
        self._provider = provider

    # ── Public API ────────────────────────────────────────────────────────────

    def start_instance(self, client_id: str, board_type: str,  # noqa: ARG002
                       callback: EventCallback) -> None:
        if client_id in self._instances:
            logger.warning('start_instance: %s already running', client_id)
            return
        inst = PiInstance(client_id, callback)
        self._instances[client_id] = inst
        asyncio.create_task(self._boot(inst))

    def stop_instance(self, client_id: str) -> None:
        inst = self._instances.pop(client_id, None)
        if inst:
            asyncio.create_task(self._shutdown(inst))

    def set_pin_state(self, client_id: str, pin: str | int, state: int) -> None:
        """Drive a GPIO pin from outside (e.g. connected Arduino)."""
        inst = self._instances.get(client_id)
        if inst and inst._gpio_writer:
            asyncio.create_task(self._send_gpio(inst, int(pin), bool(state)))

    async def send_serial_bytes(self, client_id: str, data: bytes) -> None:
        inst = self._instances.get(client_id)
        if not inst:
            logger.warning('send_serial_bytes: no instance for client_id=%s', client_id)
            return
        if not inst._serial_writer:
            logger.warning('send_serial_bytes: %s has no serial writer (qemu not connected yet?)', client_id)
            return
        logger.info('send_serial_bytes: %s sending %d bytes: %r',
                    client_id, len(data), bytes(data[:32]))
        inst._serial_writer.write(data)
        try:
            await inst._serial_writer.drain()
        except Exception as e:
            logger.warning('send_serial_bytes drain: %s', e)

    # ── Boot sequence ─────────────────────────────────────────────────────────

    async def _boot(self, inst: PiInstance) -> None:
        # Resolve boot files via the provider (downloads + verifies on
        # first call; cache hit on subsequent calls thanks to the
        # lifespan pre-warm at module load).
        try:
            images = await self._get_provider().get(PI3_IMAGE_SET)
        except BootImageError as exc:
            logger.error('[pi3] boot-image provisioning failed: %s', exc)
            await inst.emit('error', {
                'message': f'Raspberry Pi 3 boot files unavailable: {exc}',
            })
            self._instances.pop(inst.client_id, None)
            return
        kernel_path:    Path = images[PI3_KERNEL_NAME]
        initramfs_path: Path = images[PI3_INITRAMFS_NAME]
        rootfs_base:    Path = images[PI3_ROOTFS_NAME]

        # Allocate TCP ports for the two chardevs.
        inst.serial_port = _find_free_port()
        inst.gpio_port   = _find_free_port()

        # Create overlay qcow2 backed by the velxio rootfs ext4. Each
        # session gets its own writable layer; reads cascade down to
        # the shared base, writes go into the per-session overlay
        # which is deleted on stop.
        overlay = tempfile.NamedTemporaryFile(suffix='.qcow2', delete=False)
        overlay.close()
        inst.overlay_path = overlay.name
        try:
            subprocess.run(
                ['qemu-img', 'create', '-f', 'qcow2',
                 '-b', str(rootfs_base), '-F', 'raw',
                 inst.overlay_path],
                check=True, capture_output=True,
            )
        except subprocess.CalledProcessError as e:
            await inst.emit('error',
                            {'message': f'qemu-img create failed: '
                                        f'{e.stderr.decode()}'})
            self._instances.pop(inst.client_id, None)
            return

        # Build QEMU command for -M virt + virtio devices.
        #
        # Why virt: see project/pi-emulation/decisions.md (D1). Short
        # version: raspi3b pl011 RX is broken in QEMU 10 + kernel 6.12,
        # virtio-console isn't.
        #
        # Why no -dtb: virt machine generates its own DTB on the fly
        # from the runtime device list, so we don't ship one.
        cmd = [
            'qemu-system-aarch64',
            '-M',      'virt',
            '-cpu',    'cortex-a53',
            '-smp',    '4',
            '-m',      '1G',
            '-kernel', str(kernel_path),
            '-initrd', str(initramfs_path),
            # Root filesystem via virtio-blk over PCI. virt machine
            # uses PCI as the primary virtio transport, so we use
            # `virtio-blk-pci` (not `virtio-blk-device`, which is for
            # mmio and silently leaves /dev/vda unregistered).
            '-drive',  f'if=none,file={inst.overlay_path},format=qcow2,id=rootfs',
            '-device', 'virtio-blk-pci,drive=rootfs',
            # No default network / display / monitor / serial — we add
            # exactly the two chardev-backed virtio-serial ports we
            # need.  -nographic auto-binds -serial mon:stdio which
            # collides with our explicit -chardev IDs.
            '-nic',     'none',
            '-display', 'none',
            '-monitor', 'none',
            '-serial',  'none',
            # Console: TCP chardev → virtio-console → /dev/hvc0 inside
            # the guest. The frontend serial WebSocket connects to this
            # port (replaces the old ttyAMA0 path).
            '-chardev', f'socket,id=cons,host=127.0.0.1,port={inst.serial_port},'
                       f'server=on,wait=off',
            '-device', 'virtio-serial-pci,id=virtio-serial0',
            '-device', 'virtconsole,chardev=cons',
            # Protocol channel: second virtserialport on the SAME
            # virtio-serial controller. Inside the guest this is
            # /dev/vport0p2. Phase 2 hooks this up to pi_protocol_mux
            # for GPIO/I2C/SPI/UART/PWM.
            '-chardev', f'socket,id=proto,host=127.0.0.1,port={inst.gpio_port},'
                       f'server=on,wait=off',
            '-device', 'virtserialport,chardev=proto,name=velxio-protocol',
            # Kernel cmdline:
            #   console=hvc0 — the virtio-console is the user terminal.
            #   root=/dev/vda — the virtio-blk overlay is the rootfs.
            #   rw — userspace can write (overlay catches writes).
            #   quiet — suppress most printk so the user sees the shell
            #           banner cleanly.
            #   panic=10 — auto-reboot 10 s after a panic instead of
            #              hanging forever (defensive against bad user
            #              rootfs uploads in Phase 4).
            '-append', 'console=hvc0 root=/dev/vda rw quiet panic=10',
        ]

        logger.info('Launching QEMU for %s: %s',
                    inst.client_id, ' '.join(cmd))

        # Use subprocess.Popen via executor — asyncio.create_subprocess_exec
        # requires ProactorEventLoop on Windows but uvicorn may use
        # SelectorEventLoop.
        loop = asyncio.get_running_loop()
        try:
            inst.process = await loop.run_in_executor(
                None,
                lambda: subprocess.Popen(
                    cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.PIPE,
                    stdin=subprocess.DEVNULL,
                ),
            )
        except FileNotFoundError:
            await inst.emit('error',
                            {'message': 'qemu-system-aarch64 not found in PATH'})
            self._instances.pop(inst.client_id, None)
            return

        inst.running = True
        await inst.emit('system', {'event': 'booting'})

        # Give QEMU a moment to open its TCP sockets
        await asyncio.sleep(1.0)

        # Connect to the two chardev TCP ports.
        inst._tasks.append(asyncio.create_task(self._connect_serial(inst)))
        inst._tasks.append(asyncio.create_task(self._connect_gpio(inst)))
        inst._tasks.append(asyncio.create_task(self._watch_stderr(inst)))

    # ── Console (virtio-console / /dev/hvc0) ──────────────────────────────────

    async def _connect_serial(self, inst: PiInstance) -> None:
        for attempt in range(10):
            try:
                reader, writer = await asyncio.open_connection(
                    '127.0.0.1', inst.serial_port,
                )
                inst._serial_writer = writer
                logger.info('%s: serial connected on port %d',
                            inst.client_id, inst.serial_port)
                await inst.emit('system', {'event': 'booted'})
                await self._read_serial(inst, reader)
                return
            except (ConnectionRefusedError, OSError):
                await asyncio.sleep(1.0 * (attempt + 1))
        await inst.emit('error',
                        {'message': 'Could not connect to QEMU console port'})

    async def _read_serial(self, inst: PiInstance,
                            reader: asyncio.StreamReader) -> None:
        buf = bytearray()
        while inst.running:
            try:
                chunk = await asyncio.wait_for(reader.read(256), timeout=0.1)
                if not chunk:
                    break
                buf.extend(chunk)
                text = buf.decode('utf-8', errors='replace')
                buf.clear()
                await inst.emit('serial_output', {'data': text})
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.warning('%s serial read: %s', inst.client_id, e)
                break

    # ── Protocol channel (virtio-serial / /dev/vport0p2) ──────────────────────
    # Methods keep the historical "_gpio" naming so the rest of the
    # codebase (simulation route, GPIO event bus) doesn't have to
    # rename. Phase 2 swaps the line parser for the full multi-protocol
    # mux while keeping this connect/read/write plumbing identical.

    async def _connect_gpio(self, inst: PiInstance) -> None:
        for attempt in range(10):
            try:
                reader, writer = await asyncio.open_connection(
                    '127.0.0.1', inst.gpio_port,
                )
                inst._gpio_writer = writer
                logger.info('%s: protocol channel connected on port %d',
                            inst.client_id, inst.gpio_port)
                await self._read_gpio(inst, reader)
                return
            except (ConnectionRefusedError, OSError):
                await asyncio.sleep(1.0 * (attempt + 1))
        logger.warning('%s: protocol channel connection failed',
                       inst.client_id)

    async def _read_gpio(self, inst: PiInstance,
                          reader: asyncio.StreamReader) -> None:
        """Parse text-protocol lines from the Pi shim layer.

        Phase 1 understands GPIO only (existing protocol). Phase 2
        extends this to dispatch I2C/SPI/UART/PWM as well via
        pi_protocol_mux.
        """
        linebuf = b''
        while inst.running:
            try:
                chunk = await asyncio.wait_for(reader.read(256), timeout=0.1)
                if not chunk:
                    break
                linebuf += chunk
                while b'\n' in linebuf:
                    line, linebuf = linebuf.split(b'\n', 1)
                    await self._handle_gpio_line(
                        inst, line.decode('ascii', 'ignore').strip(),
                    )
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.warning('%s protocol read: %s', inst.client_id, e)
                break

    async def _handle_gpio_line(self, inst: PiInstance, line: str) -> None:
        # Expected: "GPIO <bcm_pin> <0|1>"
        parts = line.split()
        if len(parts) == 3 and parts[0] == 'GPIO':
            try:
                pin   = int(parts[1])
                state = int(parts[2])
                await inst.emit('gpio_change', {'pin': pin, 'state': state})
            except ValueError:
                pass

    async def _send_gpio(self, inst: PiInstance, pin: int, state: bool) -> None:
        if inst._gpio_writer:
            msg = f'SET {pin} {1 if state else 0}\n'.encode()
            inst._gpio_writer.write(msg)
            try:
                await inst._gpio_writer.drain()
            except Exception as e:
                logger.warning('%s protocol send: %s', inst.client_id, e)

    # ── QEMU stderr watcher ───────────────────────────────────────────────────

    async def _watch_stderr(self, inst: PiInstance) -> None:
        if not inst.process or not inst.process.stderr:
            return
        loop = asyncio.get_running_loop()
        try:
            while inst.running:
                line = await loop.run_in_executor(None, inst.process.stderr.readline)
                if not line:
                    break
                text = line.decode('utf-8', errors='replace').rstrip()
                if text:
                    logger.warning('QEMU[%s] %s', inst.client_id, text)
        except Exception:
            pass
        logger.info('QEMU[%s] process exited', inst.client_id)
        inst.running = False
        await inst.emit('system', {'event': 'exited'})

    # ── Shutdown ──────────────────────────────────────────────────────────────

    async def _shutdown(self, inst: PiInstance) -> None:
        inst.running = False

        for task in inst._tasks:
            task.cancel()
        inst._tasks.clear()

        if inst._gpio_writer:
            try:
                inst._gpio_writer.close()
            except Exception:
                pass
            inst._gpio_writer = None

        if inst._serial_writer:
            try:
                inst._serial_writer.close()
            except Exception:
                pass
            inst._serial_writer = None

        if inst.process:
            loop = asyncio.get_running_loop()
            try:
                inst.process.terminate()
                await asyncio.wait_for(
                    loop.run_in_executor(None, inst.process.wait),
                    timeout=5.0,
                )
            except Exception:
                try:
                    inst.process.kill()
                except Exception:
                    pass
            inst.process = None

        # Delete overlay
        if inst.overlay_path and os.path.exists(inst.overlay_path):
            try:
                os.unlink(inst.overlay_path)
            except Exception:
                pass
            inst.overlay_path = None

        logger.info('PiInstance %s shut down', inst.client_id)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _get_provider(self) -> BootImageProvider:
        """Lazily resolve the boot-image provider on first boot.

        Building the provider eagerly at module import would try to
        read the env vars at import time, which races with .env loading
        in some entrypoints. Lazy resolution keeps that hazard local
        to the boot path.
        """
        if self._provider is None:
            self._provider = get_default_provider()
        return self._provider


# ── Lifespan pre-warm ────────────────────────────────────────────────────────
async def _prewarm_pi3_boot_images() -> None:
    """Lifespan hook: download + cache the Pi 3 virt boot files in the
    background at process start.

    The cache check is cheap when files are already on disk (named
    docker volume), so this is a no-op for warm containers and a one-
    time pay-on-first-boot for fresh hosts. Failures are logged but
    never block startup — a missing licence key or a velxio.dev outage
    just means the first user request gets an error with a useful
    message, instead of the whole backend refusing to start.
    """
    try:
        provider = get_default_provider()
    except Exception as exc:  # noqa: BLE001 - log + continue at startup
        logger.warning(
            '[pi3] cannot build boot-image provider, skipping pre-warm: %s',
            exc,
        )
        return
    asyncio.create_task(provider.warmup(PI3_IMAGE_SET))


register_lifespan_startup(_prewarm_pi3_boot_images)


qemu_manager = QemuManager()
