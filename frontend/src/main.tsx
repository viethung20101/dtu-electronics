import { createRoot } from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import './index.css';
// Side-effect import: initialises i18next BEFORE any component renders so
// useTranslation() always resolves against a live instance. Must come
// before App.
import './i18n';
import './components/velxio-components/IC74HC595';
import './components/velxio-components/LogicGateElements';
import './components/velxio-components/TransistorElements';
import './components/velxio-components/OpAmpElements';
import './components/velxio-components/PowerElements';
import './components/velxio-components/DiodeElements';
import './components/velxio-components/RelayElements';
import './components/velxio-components/LogicICElements';
import './components/velxio-components/FlipFlopElements';
import './components/velxio-components/RaspberryPi3Element';
import './components/velxio-components/Bmp280Element';
import './components/velxio-components/EPaperElement';
import App from './App.tsx';

// Configure monaco-editor for offline use via local static assets
const monacoVsPath = `${import.meta.env.BASE_URL}monaco/vs`;
loader.config({ paths: { vs: monacoVsPath } });

createRoot(document.getElementById('root')!).render(<App />);

// Tear down the Tauri-only splash now that React has mounted. Wait
// two animation frames so React's first paint commits before we
// touch the splash — otherwise users see a black flash between the
// splash fading and the editor first appearing. Fade via CSS
// transition for a smoother handoff, then remove the node entirely
// once the transition finishes.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('velxio-splash');
    if (!splash) return;
    splash.style.transition = 'opacity 250ms ease-out';
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    window.setTimeout(() => splash.remove(), 320);
  });
});

// Optional pro overlay. The `@pro` import resolves to a no-op stub in the
// open-source build (see vite.config.ts) and to the real overlay only when
// VITE_PRO_BUILD=true at build time. The dynamic import keeps the pro chunk
// out of the OSS bundle entirely (Vite tree-shakes the never-taken branch).
//
// VITE_DESKTOP=true is set by the Tauri desktop build. The desktop shell
// owns its own license + auth UI (Phase 3 of paid-clients) and runs against
// a locally spawned sidecar, so the velxio.dev-coupled overlay (trackers,
// billing, cloud auth, admin) is intentionally NOT loaded — even if a
// build accidentally sets both flags.
if (import.meta.env.VITE_PRO_BUILD && !import.meta.env.VITE_DESKTOP) {
  import('@pro/index')
    .then((m) => m.mountPro?.())
    .catch((err) => console.warn('[pro] failed to load overlay:', err));
}

// Desktop-only hooks (ESP32 QEMU prompt now, welcome screen in Phase 3).
// Dynamic import so the OSS bundle never pulls this in.
if (import.meta.env.VITE_DESKTOP) {
  import('./desktop/index')
    .then((m) => m.mountDesktop?.())
    .catch((err) => console.warn('[desktop] failed to load hooks:', err));
}
