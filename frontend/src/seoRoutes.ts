/**
 * Single source of truth for all public, indexable routes and their SEO metadata.
 * Used by:
 *  1. scripts/generate-sitemap.mjs  → builds sitemap.xml at build time
 *  2. scripts/prerender-seo.mjs     → generates prerendered HTML per route
 *  3. Page components (via getSeoMeta) → useSEO() hook
 *
 * Routes with `noindex: true` are excluded from the sitemap.
 * Routes with `seoMeta` get prerendered HTML at build time.
 */

const DOMAIN = 'https://cvs.local';

export interface SeoMeta {
  title: string;
  description: string;
  url: string;
}

export interface SeoRoute {
  path: string;
  /** 0.0 – 1.0 (default 0.5) */
  priority?: number;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** If true, excluded from sitemap */
  noindex?: boolean;
  /** SEO metadata — if present, this route gets a prerendered HTML page at build time. */
  seoMeta?: SeoMeta;
}

/** Look up the SEO metadata for a given path. */
export function getSeoMeta(path: string): SeoMeta | undefined {
  return SEO_ROUTES.find((r) => r.path === path)?.seoMeta;
}

export const SEO_ROUTES: SeoRoute[] = [
  // ── Main pages
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
    seoMeta: {
      title:
        'CVS — Center of Visualization & Simulation | Free Circuit & Microcontroller Simulator',
      description:
        'CVS is a free, open-source circuit and microcontroller simulator. Real-time SPICE analog simulation (ngspice-WASM) wired to 19 boards: Arduino, ESP32, RP2040, ATtiny85. 100+ components, oscilloscope, voltmeter, ammeter — no cloud.',
      url: `${DOMAIN}/`,
    },
  },
  { path: '/editor', priority: 0.9, changefreq: 'weekly' },
  {
    path: '/examples',
    priority: 0.8,
    changefreq: 'weekly',
    seoMeta: {
      title: 'Circuit & Arduino Simulator Examples — 100+ Projects | CVS',
      description:
        'Browse 100+ interactive examples — Arduino, ESP32, RP2040, ATtiny85 sketches plus 40+ analog SPICE circuits. Runs in your browser — free, no install.',
      url: `${DOMAIN}/examples`,
    },
  },

  // ── Documentation
  {
    path: '/docs',
    priority: 0.8,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Introduction | CVS Documentation',
      description:
        'Learn about CVS, the free open-source circuit and microcontroller simulator with real AVR8, RP2040, ESP32 emulation and 100+ interactive electronic components.',
      url: `${DOMAIN}/docs`,
    },
  },
  {
    path: '/docs/intro',
    priority: 0.8,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Introduction | CVS Documentation',
      description:
        'Learn about CVS, the free open-source circuit and microcontroller simulator with real AVR8, RP2040, ESP32 emulation and 100+ interactive electronic components.',
      url: `${DOMAIN}/docs/intro`,
    },
  },
  {
    path: '/docs/getting-started',
    priority: 0.8,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Getting Started | CVS Documentation',
      description:
        'Get started with CVS: use the hosted editor, self-host with Docker, or set up a local development environment. Simulate your first Arduino sketch in minutes.',
      url: `${DOMAIN}/docs/getting-started`,
    },
  },
  {
    path: '/docs/emulator',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Emulator Architecture | CVS Documentation',
      description:
        'How CVS emulates AVR8 (ATmega328p), RP2040, and RISC-V (ESP32-C3) CPUs. Covers execution loops, peripherals, and pin mapping for all supported boards.',
      url: `${DOMAIN}/docs/emulator`,
    },
  },
  {
    path: '/docs/esp32-emulation',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'ESP32 Emulation (Xtensa) | CVS Documentation',
      description:
        'QEMU-based emulation for ESP32 and ESP32-S3 (Xtensa LX6/LX7). Covers the lcgamboa fork, libqemu-xtensa, GPIO, WiFi, I2C, SPI, RMT/NeoPixel, and LEDC/PWM.',
      url: `${DOMAIN}/docs/esp32-emulation`,
    },
  },
  {
    path: '/docs/riscv-emulation',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'RISC-V Emulation (ESP32-C3) | CVS Documentation',
      description:
        'Browser-side RV32IMC emulator for ESP32-C3, XIAO ESP32-C3, and C3 SuperMini. Covers memory map, GPIO, UART0, the ESP32 image parser, RV32IMC ISA, and test suite.',
      url: `${DOMAIN}/docs/riscv-emulation`,
    },
  },
  {
    path: '/docs/rp2040-emulation',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'RP2040 Emulation (Raspberry Pi Pico) | CVS Documentation',
      description:
        'How CVS emulates the Raspberry Pi Pico and Pico W using rp2040js: ARM Cortex-M0+ at 133 MHz, GPIO, UART, ADC, I2C, SPI, PWM and WFI optimization.',
      url: `${DOMAIN}/docs/rp2040-emulation`,
    },
  },
  {
    path: '/docs/raspberry-pi3-emulation',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Raspberry Pi 3 Emulation (QEMU) | CVS Documentation',
      description:
        'How CVS emulates a full Raspberry Pi 3B using QEMU raspi3b: real Raspberry Pi OS, Python + RPi.GPIO shim, dual-channel UART, VFS, and multi-board serial bridge.',
      url: `${DOMAIN}/docs/raspberry-pi3-emulation`,
    },
  },
  {
    path: '/docs/components',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Components Reference | CVS Documentation',
      description:
        'Full reference for all 100+ interactive electronic components in CVS: LEDs, displays, sensors, op-amps, transistors, and more. Includes wiring and property details.',
      url: `${DOMAIN}/docs/components`,
    },
  },
  {
    path: '/docs/architecture',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Project Architecture | CVS Documentation',
      description:
        'Detailed overview of the CVS system architecture: frontend, backend, AVR8 emulation pipeline, data flows, Zustand stores, and wire system.',
      url: `${DOMAIN}/docs/architecture`,
    },
  },
  {
    path: '/docs/third-party',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Wokwi Libraries | CVS Documentation',
      description:
        'How CVS integrates the official Wokwi open-source libraries: avr8js, wokwi-elements, and rp2040js. Covers configuration, updates, and the available components.',
      url: `${DOMAIN}/docs/third-party`,
    },
  },
  {
    path: '/docs/mcp',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'MCP Server | CVS Documentation',
      description:
        'CVS MCP Server reference: integrate AI agents (Claude, Cursor) with CVS via Model Context Protocol. Covers tools, transports, circuit format, and example walkthroughs.',
      url: `${DOMAIN}/docs/mcp`,
    },
  },
  {
    path: '/docs/setup',
    priority: 0.6,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Project Status | CVS Documentation',
      description:
        'Complete status of all implemented CVS features: circuit simulation, component system, wire system, code editor, example projects, and next steps.',
      url: `${DOMAIN}/docs/setup`,
    },
  },
  {
    path: '/docs/roadmap',
    priority: 0.6,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Roadmap | CVS Documentation',
      description:
        "CVS feature roadmap: what's implemented, what's in progress, and what's planned for future releases.",
      url: `${DOMAIN}/docs/roadmap`,
    },
  },

  // ── SEO keyword landing pages
  {
    path: '/circuit-simulator',
    priority: 0.95,
    changefreq: 'weekly',
    seoMeta: {
      title: 'Free Online Circuit Simulator — SPICE Analog Simulation in Your Browser | CVS',
      description:
        'CVS is a free online circuit simulator with real-time SPICE analog simulation via ngspice-WASM. 100+ components — resistors, capacitors, op-amps, transistors, regulators, diodes — wired to Arduino, ESP32, RP2040 firmware. Live oscilloscope, voltmeter, ammeter. No install, no account.',
      url: `${DOMAIN}/circuit-simulator`,
    },
  },
  {
    path: '/spice-simulator',
    priority: 0.9,
    changefreq: 'weekly',
    seoMeta: {
      title: 'Free Online SPICE Simulator — ngspice in Your Browser | CVS',
      description:
        'Run SPICE simulations directly in your browser. CVS uses ngspice compiled to WebAssembly via eecircuit-engine — full transient analysis, real device models (BJTs, MOSFETs, op-amps, diodes), Modified Nodal Analysis. Free and open-source.',
      url: `${DOMAIN}/spice-simulator`,
    },
  },
  {
    path: '/electronics-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free Online Electronics Simulator — Build & Test Circuits in Your Browser | CVS',
      description:
        'CVS is a free online electronics simulator with SPICE-accurate analog parts and 19 simulated microcontrollers. Build, wire, and test electronic circuits — Arduino, ESP32, RP2040, ATtiny85 — in your browser. 100+ components, no install, no account.',
      url: `${DOMAIN}/electronics-simulator`,
    },
  },
  {
    path: '/custom-chip-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Custom Chip Simulator — Build Your Own ICs in C, Rust & AssemblyScript | CVS',
      description:
        'Define your own integrated circuits in C, Rust, or AssemblyScript with the Wokwi-compatible Custom Chips API. Compile to WebAssembly and drive pins, attributes, timers, I²C and SPI from your simulated chip. Free and open-source.',
      url: `${DOMAIN}/custom-chip-simulator`,
    },
  },
  {
    path: '/attiny85-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free ATtiny85 Simulator — Cycle-Accurate AVR Emulation Online | CVS',
      description:
        'Simulate ATtiny85 firmware in your browser with cycle-accurate AVR8 emulation. Full DIP-8 pinout, 8 KB flash, 6 GPIOs, USI (I²C/SPI), Timer0/Timer1 PWM, 10-bit ADC, watchdog. Wire it to LEDs, sensors, or SPICE analog parts. Free, no install.',
      url: `${DOMAIN}/attiny85-simulator`,
    },
  },
  {
    path: '/arduino-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free Online Arduino Simulator — Run Sketches in Your Browser | CVS',
      description:
        'A free online Arduino simulator with real AVR8 emulation. Write and simulate Arduino code with LEDs, sensors, and 100+ components — no install, no account, instant results.',
      url: `${DOMAIN}/arduino-simulator`,
    },
  },
  {
    path: '/arduino-emulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Arduino Emulator — Real AVR8 & RP2040 Emulation, Free | CVS',
      description:
        'Free, open-source Arduino emulator with cycle-accurate AVR8 emulation at 16 MHz. Emulate Arduino Uno, Nano, Mega and Raspberry Pi Pico in your browser — no cloud, no install.',
      url: `${DOMAIN}/arduino-emulator`,
    },
  },
  {
    path: '/atmega328p-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'ATmega328P Simulator — Free Browser-Based AVR8 Emulation | CVS',
      description:
        'Simulate ATmega328P code in your browser. Full AVR8 emulation at 16 MHz — PORTB, PORTC, PORTD, Timer0/1/2, ADC, USART — with 100+ interactive components. Free & open-source.',
      url: `${DOMAIN}/atmega328p-simulator`,
    },
  },
  {
    path: '/arduino-mega-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Arduino Mega 2560 Simulator — Free Online AVR8 Emulator | CVS',
      description:
        'Simulate Arduino Mega 2560 (ATmega2560) code for free in your browser. 256 KB flash, 54 digital pins, 16 analog inputs, 4 serial ports — full AVR8 emulation with 100+ components.',
      url: `${DOMAIN}/arduino-mega-simulator`,
    },
  },
  {
    path: '/esp32-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free ESP32 Simulator Online — Xtensa LX6 Emulation | CVS',
      description:
        'Simulate ESP32 code in your browser for free. Real Xtensa LX6 emulation at 240 MHz via QEMU — ESP32 DevKit, ESP32-S3, ESP32-CAM. 100+ components, Serial Monitor, no install.',
      url: `${DOMAIN}/esp32-simulator`,
    },
  },
  {
    path: '/esp32-s3-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free ESP32-S3 Simulator — Xtensa LX7 Emulation Online | CVS',
      description:
        'Simulate ESP32-S3 code for free. Real Xtensa LX7 dual-core emulation at 240 MHz via QEMU — DevKitC, XIAO ESP32-S3, Arduino Nano ESP32. 100+ components, no install.',
      url: `${DOMAIN}/esp32-s3-simulator`,
    },
  },
  {
    path: '/esp32-c3-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free ESP32-C3 & RISC-V Simulator — QEMU Emulation | CVS',
      description:
        'Simulate ESP32-C3 RISC-V code via the QEMU lcgamboa backend (libqemu-riscv32) at 160 MHz. 100+ components, Serial Monitor. Also supports CH32V003. Free and open-source.',
      url: `${DOMAIN}/esp32-c3-simulator`,
    },
  },
  {
    path: '/raspberry-pi-pico-simulator',
    priority: 0.9,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free Raspberry Pi Pico Simulator — RP2040 ARM Cortex-M0+ Emulation | CVS',
      description:
        'Simulate Raspberry Pi Pico and Pico W code for free. Real RP2040 ARM Cortex-M0+ emulation at 133 MHz via rp2040js. 100+ components, Serial Monitor, Arduino-Pico core. No install.',
      url: `${DOMAIN}/raspberry-pi-pico-simulator`,
    },
  },
  {
    path: '/raspberry-pi-simulator',
    priority: 0.85,
    changefreq: 'monthly',
    seoMeta: {
      title: 'Free Raspberry Pi 3 Simulator — Full Linux Emulation in Your Browser | CVS',
      description:
        'Simulate Raspberry Pi 3 for free. Full ARM Cortex-A53 Linux emulation via QEMU — run Python, bash, RPi.GPIO in your browser. No Raspberry Pi hardware needed.',
      url: `${DOMAIN}/raspberry-pi-simulator`,
    },
  },

  // ── About
  {
    path: '/about',
    priority: 0.7,
    changefreq: 'monthly',
    seoMeta: {
      title: 'About CVS — Center of Visualization & Simulation',
      description:
        'Learn about CVS, the free open-source circuit and microcontroller simulator, and its creator David Montero Crespo — Application Architect at IBM, programming and robotics enthusiast.',
      url: `${DOMAIN}/about`,
    },
  },

  // ── Auth / admin (noindex)
  { path: '/login', noindex: true },
  { path: '/register', noindex: true },
  { path: '/admin', noindex: true },
];
