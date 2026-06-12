import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BoardKind } from '../../types/board';
import { BOARD_KIND_LABELS } from '../../types/board';

const BOARD_DESCRIPTIONS: Record<BoardKind, string> = {
  'arduino-uno': '8-bit AVR, 32KB flash, 14 digital I/O',
  'arduino-nano': 'Compact 8-bit AVR, same as Uno',
  'arduino-mega': '8-bit AVR, 256KB flash, 54 digital I/O',
  'raspberry-pi-pico': 'RP2040 dual-core Cortex-M0+',
  'pi-pico-w': 'RP2040 + WiFi/BT, same emulator as Pico',
  'raspberry-pi-zero': 'ARM Cortex-A7 single-core (armhf), Linux/Python (QEMU)',
  'raspberry-pi-1': 'ARM Cortex-A7 single-core (armhf), Linux/Python (QEMU)',
  'raspberry-pi-2': 'ARM Cortex-A7 quad-core (armhf), Linux/Python (QEMU)',
  'raspberry-pi-3': 'ARM64 Cortex-A53 quad-core, Linux/Python (QEMU)',
  'raspberry-pi-4': 'ARM64 Cortex-A72 quad-core, Linux/Python (QEMU)',
  'raspberry-pi-5': 'ARM64 Cortex-A76 quad-core + RP1 I/O, Linux/Python (QEMU)',
  esp32: 'Xtensa LX6 dual-core, WiFi+BT, 38 GPIO (QEMU)',
  'esp32-devkit-c-v4': 'ESP32 DevKit C V4, official Espressif (QEMU)',
  'esp32-cam': 'ESP32 + 2MP camera, microSD (QEMU)',
  'wemos-lolin32-lite': 'Compact ESP32, LiPo battery support (QEMU)',
  'esp32-s3': 'Xtensa LX7 dual-core, WiFi+BT, AI accel (QEMU)',
  'xiao-esp32-s3': 'Seeed XIAO tiny form, 8MB flash+PSRAM (QEMU)',
  'arduino-nano-esp32': 'Nano form-factor, ESP32-S3, RGB LED (QEMU)',
  'esp32-c3': 'RISC-V single-core, WiFi+BLE, 22 GPIO (QEMU)',
  'xiao-esp32-c3': 'Seeed XIAO ESP32-C3 mini board (QEMU)',
  'aitewinrobot-esp32c3-supermini': 'ESP32-C3 SuperMini (QEMU)',
  'stm32-bluepill': 'STM32F103C8 Cortex-M3, 64KB flash, 37 GPIO (QEMU)',
  'stm32-blackpill': 'STM32F411CE Cortex-M4, 512KB flash, 50 GPIO (QEMU)',
  'stm32-bluepill-f103cb': 'STM32F103CB Cortex-M3, 128KB flash, 37 GPIO (QEMU)',
  'stm32-blackpill-f401': 'STM32F401CE Cortex-M4, 512KB flash, 50 GPIO (QEMU)',
  'stm32-f4-discovery': 'STM32F407VG Cortex-M4, 1MB flash, 4 onboard LEDs (QEMU)',
  'stm32-olimex-h405': 'Olimex STM32-H405, F405RG Cortex-M4, 1MB flash (QEMU)',
  'stm32-netduino-plus2': 'Netduino Plus 2, STM32F405 Cortex-M4 (QEMU)',
  'stm32-netduino2': 'Netduino 2, STM32F205 Cortex-M3 (QEMU, serial)',
  attiny85: '8-bit AVR, 8KB flash, 6 GPIO (browser)',
};

const BOARD_ICON: Record<BoardKind, string> = {
  'arduino-uno': '⬤',
  'arduino-nano': '▪',
  'arduino-mega': '▬',
  'raspberry-pi-pico': '◆',
  'pi-pico-w': '◆',
  'raspberry-pi-zero': '⬛',
  'raspberry-pi-1': '⬛',
  'raspberry-pi-2': '⬛',
  'raspberry-pi-3': '⬛',
  'raspberry-pi-4': '⬛',
  'raspberry-pi-5': '⬛',
  esp32: '⬡',
  'esp32-devkit-c-v4': '⬡',
  'esp32-cam': '⬡',
  'wemos-lolin32-lite': '⬡',
  'esp32-s3': '⬡',
  'xiao-esp32-s3': '⬡',
  'arduino-nano-esp32': '⬡',
  'esp32-c3': '⬡',
  'xiao-esp32-c3': '⬡',
  'aitewinrobot-esp32c3-supermini': '⬡',
  'stm32-bluepill': '◈',
  'stm32-blackpill': '◈',
  'stm32-bluepill-f103cb': '◈',
  'stm32-blackpill-f401': '◈',
  'stm32-f4-discovery': '◈',
  'stm32-olimex-h405': '◈',
  'stm32-netduino-plus2': '◈',
  'stm32-netduino2': '◈',
  attiny85: '⚫',
};

interface BoardPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBoard: (kind: BoardKind) => void;
}

const BOARDS: BoardKind[] = [
  'arduino-uno',
  'arduino-nano',
  'arduino-mega',
  'raspberry-pi-pico',
  'raspberry-pi-3',
  'raspberry-pi-4',
  'raspberry-pi-5',
  'esp32',
  'esp32-s3',
  'esp32-c3',
  'stm32-bluepill',
  'stm32-blackpill',
];

export const BoardPickerModal = ({ isOpen, onClose, onSelectBoard }: BoardPickerModalProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e1e1e',
          border: '1px solid #444',
          borderRadius: 8,
          padding: 24,
          minWidth: 380,
          maxWidth: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: '#ccc', margin: '0 0 16px 0', fontSize: 16 }}>
          {t('editor.boardPicker.title')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BOARDS.map((kind) => (
            <button
              key={kind}
              onClick={() => {
                onSelectBoard(kind);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: '#2d2d2d',
                border: '1px solid #555',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#ddd',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a3a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2d2d2d')}
            >
              <span
                style={{
                  fontSize: 20,
                  width: 28,
                  textAlign: 'center',
                  color: kind.startsWith('raspberry')
                    ? '#c22'
                    : kind.startsWith('esp')
                      ? '#e8a020'
                      : '#4af',
                }}
              >
                {BOARD_ICON[kind]}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{BOARD_KIND_LABELS[kind]}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {BOARD_DESCRIPTIONS[kind]}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid #555',
            borderRadius: 4,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
