/**
 * Component Library Sidebar
 *
 * Static panel interface for searching and selecting components and boards.
 * Fully styled for the dark theme editor sidebar.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import type { ComponentMetadata, ComponentCategory } from '../../types/component-metadata';
import type { BoardKind } from '../../types/board';
import { BOARD_KIND_LABELS } from '../../types/board';
import { isProBoardKind } from '../../lib/proBoardGate';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import raspberryPi3Svg from '../../assets/Raspberry_Pi_3_illustration.svg';
import { Attiny85 } from '../velxio-components/Attiny85';
import '../velxio-components/Esp32Element';
import '../velxio-components/PiPicoWElement';
import '../velxio-components/Stm32BluePillElement';
import '@wokwi/elements';
import '../../velxio-elements';
import './ComponentLibrarySidebar.css';

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

const ALL_BOARDS: BoardKind[] = [
  'arduino-uno',
  'arduino-nano',
  'arduino-mega',
  'raspberry-pi-pico',
  'pi-pico-w',
  'raspberry-pi-zero',
  'raspberry-pi-1',
  'raspberry-pi-2',
  'raspberry-pi-3',
  'raspberry-pi-4',
  'raspberry-pi-5',
  'esp32',
  'esp32-devkit-c-v4',
  'esp32-cam',
  'wemos-lolin32-lite',
  'esp32-s3',
  'xiao-esp32-s3',
  'arduino-nano-esp32',
  'esp32-c3',
  'xiao-esp32-c3',
  'aitewinrobot-esp32c3-supermini',
  'stm32-bluepill',
  'stm32-blackpill',
  'stm32-bluepill-f103cb',
  'stm32-blackpill-f401',
  'stm32-f4-discovery',
  'stm32-olimex-h405',
  'stm32-netduino-plus2',
  'stm32-netduino2',
  'attiny85',
];

const BOARD_TAG: Partial<Record<BoardKind, string>> = {
  'arduino-uno': 'wokwi-arduino-uno',
  'arduino-nano': 'wokwi-arduino-nano',
  'arduino-mega': 'wokwi-arduino-mega',
  'raspberry-pi-pico': 'wokwi-nano-rp2040-connect',
  'pi-pico-w': 'velxio-pi-pico-w',
  esp32: 'velxio-esp32',
  'esp32-devkit-c-v4': 'velxio-esp32',
  'esp32-cam': 'velxio-esp32',
  'wemos-lolin32-lite': 'velxio-esp32',
  'esp32-s3': 'velxio-esp32',
  'xiao-esp32-s3': 'velxio-esp32',
  'arduino-nano-esp32': 'velxio-esp32',
  'esp32-c3': 'velxio-esp32',
  'xiao-esp32-c3': 'velxio-esp32',
  'aitewinrobot-esp32c3-supermini': 'velxio-esp32',
  'stm32-bluepill': 'velxio-stm32-bluepill',
  'stm32-blackpill': 'velxio-stm32-blackpill',
  'stm32-bluepill-f103cb': 'velxio-stm32-bluepill-f103cb',
  'stm32-blackpill-f401': 'velxio-stm32-blackpill-f401',
  'stm32-f4-discovery': 'velxio-stm32-f4-discovery',
  'stm32-olimex-h405': 'velxio-stm32-olimex-h405',
  'stm32-netduino-plus2': 'velxio-stm32-netduino-plus2',
  'stm32-netduino2': 'velxio-stm32-netduino2',
};

const PASSIVE_TAGS = new Set([
  'wokwi-resistor',
  'wokwi-capacitor',
  'velxio-capacitor-electrolytic',
  'wokwi-inductor',
]);

export const ComponentLibrarySidebar: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all' | 'boards'>(
    'all',
  );
  const [registry] = useState(() => ComponentRegistry.getInstance());
  const [isLoading, setIsLoading] = useState(true);

  const addComponentTrigger = useSimulatorStore((s) => s.addComponentTrigger);
  const addBoardTrigger = useSimulatorStore((s) => s.addBoardTrigger);

  // Wait for registry to load
  useEffect(() => {
    const loadRegistry = async () => {
      await registry.load();
      setIsLoading(false);
    };
    loadRegistry();
  }, [registry]);

  // Listen to search events from UnifiedToolbar
  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener('velxio-component-search' as any, handleSearch);
    return () => window.removeEventListener('velxio-component-search' as any, handleSearch);
  }, []);

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    if (isLoading) return [];
    let components = searchQuery ? registry.search(searchQuery) : registry.getAllComponents();
    if (selectedCategory !== 'all') {
      components = components.filter((c) => c.category === selectedCategory);
    }
    return components;
  }, [searchQuery, selectedCategory, registry, isLoading]);

  // Get available categories
  const categories = useMemo(() => {
    if (isLoading) return [];
    return registry.getCategories();
  }, [registry, isLoading]);

  const filteredBoards = useMemo(() => {
    return ALL_BOARDS.filter(
      (k) =>
        !searchQuery ||
        BOARD_KIND_LABELS[k].toLowerCase().includes(searchQuery.toLowerCase()) ||
        BOARD_DESCRIPTIONS[k].toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // Group items by category for the structured display
  const groupedSections = useMemo(() => {
    const sections: { title: string; type: 'boards' | 'components'; items: any[] }[] = [];

    // 1. Boards section
    if (selectedCategory === 'all' || selectedCategory === 'boards') {
      if (filteredBoards.length > 0) {
        sections.push({
          title: 'BOARDS',
          type: 'boards',
          items: filteredBoards,
        });
      }
    }

    // 2. Component sections
    if (selectedCategory === 'all') {
      const grouped = new Map<ComponentCategory, ComponentMetadata[]>();
      filteredComponents.forEach((comp) => {
        if (comp.category === 'boards') return;
        const list = grouped.get(comp.category) || [];
        list.push(comp);
        grouped.set(comp.category, list);
      });

      categories.forEach((cat) => {
        if (cat === 'boards') return;
        const items = grouped.get(cat) || [];
        if (items.length > 0) {
          sections.push({
            title: cat.toUpperCase(),
            type: 'components',
            items,
          });
        }
      });
    } else if (selectedCategory !== 'boards') {
      if (filteredComponents.length > 0) {
        sections.push({
          title: selectedCategory.toUpperCase(),
          type: 'components',
          items: filteredComponents,
        });
      }
    }

    return sections;
  }, [selectedCategory, filteredBoards, filteredComponents, categories]);

  return (
    <div className="component-sidebar">
      {/* Search Header */}
      <div className="sidebar-search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder={t('editor.componentPicker.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (horizontal scroll) */}
      <div className="sidebar-categories">
        <button
          className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          {t('editor.componentPicker.allComponents')}
        </button>
        <button
          className={`category-pill ${selectedCategory === 'boards' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('boards')}
        >
          {t('editor.componentPicker.boards')}
        </button>
        {categories
          .filter((c) => c !== 'boards')
          .map((category) => (
            <button
              key={category}
              className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {ComponentRegistry.getCategoryDisplayName(category)}
            </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="sidebar-scroll-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('editor.componentPicker.loading')}</p>
          </div>
        ) : (
          <div className="sidebar-sections-container">
            {groupedSections.length === 0 ? (
              <div className="no-results">
                <p>{t('editor.componentPicker.noResults')}</p>
              </div>
            ) : (
              groupedSections.map((sec) => (
                <div key={sec.title} className="sidebar-section">
                  <h3 className="sidebar-section-title">{sec.title}</h3>
                  <div className="components-grid-row">
                    {sec.items.map((item) =>
                      sec.type === 'boards' ? (
                        <SidebarBoardCard
                          key={item}
                          kind={item}
                          onSelect={() => addBoardTrigger?.(item)}
                        />
                      ) : (
                        <SidebarComponentCard
                          key={item.id}
                          component={item}
                          onSelect={() => {
                            if (item.pro_only) {
                              const gate = (window as any).__velxio_pro_gate__;
                              if (gate && gate(item)) return;
                            }
                            addComponentTrigger?.(item);
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Sidebar Component Card --- */
interface SidebarComponentCardProps {
  component: ComponentMetadata;
  onSelect: () => void;
}

const SidebarComponentCard: React.FC<SidebarComponentCardProps> = ({ component, onSelect }) => {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const usePresetSvg =
    PASSIVE_TAGS.has(component.tagName) &&
    typeof component.thumbnail === 'string' &&
    component.thumbnail.trim().startsWith('<svg');

  useEffect(() => {
    if (!thumbnailRef.current) return;
    if (usePresetSvg) return;

    // Instantiate element dynamically
    const element = document.createElement(component.tagName);
    let scale = 0.55;
    if (component.tagName.includes('arduino') || component.tagName.includes('esp32')) {
      scale = 0.38;
    } else if (component.tagName.includes('lcd') || component.tagName.includes('display')) {
      scale = 0.42;
    }

    (element as HTMLElement).style.transform = `scale(${scale})`;
    (element as HTMLElement).style.transformOrigin = 'center center';

    if (component.defaultValues?.value !== undefined) {
      (element as any).value = component.defaultValues.value;
    }

    if (component.tagName === 'wokwi-led') {
      (element as any).value = true;
      (element as any).color = component.defaultValues?.color || 'red';
    } else if (component.tagName === 'wokwi-rgb-led') {
      (element as any).red = true;
      (element as any).green = true;
      (element as any).blue = true;
    } else if (component.tagName === 'wokwi-pushbutton') {
      (element as any).color = component.defaultValues?.color || 'red';
    } else if (component.tagName === 'wokwi-lcd1602' || component.tagName === 'wokwi-lcd2004') {
      (element as any).text = 'CVS Sim';
    }

    thumbnailRef.current.innerHTML = '';
    thumbnailRef.current.appendChild(element);

    return () => {
      if (thumbnailRef.current) {
        thumbnailRef.current.innerHTML = '';
      }
    };
  }, [component.tagName, component.defaultValues, usePresetSvg]);

  return (
    <button className="sidebar-card" onClick={onSelect}>
      <div className="card-thumbnail-container">
        {usePresetSvg ? (
          <div
            className="component-preview-svg"
            dangerouslySetInnerHTML={{ __html: component.thumbnail }}
          />
        ) : (
          <div ref={thumbnailRef} className="component-preview-svg" />
        )}
      </div>
      <div className="card-details">
        <span className="card-name">{component.name}</span>
      </div>
    </button>
  );
};

/* --- Sidebar Board Card --- */
interface SidebarBoardCardProps {
  kind: BoardKind;
  onSelect: () => void;
}

const SidebarBoardCard: React.FC<SidebarBoardCardProps> = ({ kind, onSelect }) => {
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thumbnailRef.current) return;
    if (kind === 'raspberry-pi-3' || kind === 'attiny85') return;
    if (kind === 'raspberry-pi-4' || kind === 'raspberry-pi-5') {
      const tagName = kind === 'raspberry-pi-4' ? 'velxio-raspberry-pi-4' : 'velxio-raspberry-pi-5';
      const el = document.createElement(tagName) as HTMLElement;
      el.style.transform = 'scale(0.38)';
      el.style.transformOrigin = 'center center';
      thumbnailRef.current.innerHTML = '';
      thumbnailRef.current.appendChild(el);
      return () => {
        if (thumbnailRef.current) thumbnailRef.current.innerHTML = '';
      };
    }

    const tag = BOARD_TAG[kind];
    if (!tag) return;

    const el = document.createElement(tag) as HTMLElement;
    el.setAttribute('board-kind', kind);
    el.style.transform = 'scale(0.32)';
    el.style.transformOrigin = 'center center';

    thumbnailRef.current.innerHTML = '';
    thumbnailRef.current.appendChild(el);

    return () => {
      if (thumbnailRef.current) thumbnailRef.current.innerHTML = '';
    };
  }, [kind]);

  const reactThumbnail =
    kind === 'raspberry-pi-3' ? (
      <img
        src={raspberryPi3Svg}
        alt="Raspberry Pi 3"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    ) : kind === 'attiny85' ? (
      <div style={{ transform: 'scale(0.65)', transformOrigin: 'center center' }}>
        <Attiny85 />
      </div>
    ) : null;

  return (
    <button className="sidebar-card" onClick={onSelect}>
      <div className="card-thumbnail-container">
        {reactThumbnail ? (
          reactThumbnail
        ) : (
          <div ref={thumbnailRef} className="component-preview-svg" />
        )}
        {isProBoardKind(kind) && <span className="pro-pill">PRO</span>}
      </div>
      <div className="card-details">
        <span className="card-name">{BOARD_KIND_LABELS[kind]}</span>
      </div>
    </button>
  );
};
