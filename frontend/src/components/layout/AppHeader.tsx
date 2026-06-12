import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/useProjectStore';
import { ShareModal } from './ShareModal';
import { useLocalizedHref, useCurrentLocale } from '../../i18n/useLocalizedNavigate';
import { blogUrlFor } from '../../i18n/path';
import { trackVisitGitHub, trackVisitDiscord } from '../../utils/analytics';
import type { AutoSaveState } from '../../hooks/useAutoSaveProject';
import vepsLogo from '../../assets/veps-logo.svg';

const GITHUB_URL = 'https://github.com/viethung20101/dtu-electronics';
const DISCORD_URL = 'https://discord.gg/3mARjJrh4E';

interface AppHeaderProps {
  /** Optional auto-save state — when set, renders a save status indicator. */
  autoSave?: AutoSaveState;
  variant?: 'editor' | 'default';
}

const SAVE_STATUS_COPY: Record<AutoSaveState['status'], { label: string; color: string }> = {
  idle: { label: 'Saved', color: '#7d8590' },
  dirty: { label: 'Unsaved changes', color: '#f0883e' },
  saving: { label: 'Saving…', color: '#3fb950' },
  saved: { label: 'Saved', color: '#3fb950' },
  error: { label: 'Save failed', color: '#f85149' },
};

const AutoSaveIndicator: React.FC<{ state: AutoSaveState }> = ({ state }) => {
  const meta = SAVE_STATUS_COPY[state.status];
  const tip =
    state.status === 'error' && state.errorMessage
      ? `Auto-save failed: ${state.errorMessage}`
      : state.lastSavedAt
        ? `Last saved ${new Date(state.lastSavedAt).toLocaleTimeString()}`
        : 'Auto-save ready';
  return (
    <div
      title={tip}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        fontSize: 12,
        color: meta.color,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: meta.color,
          opacity: state.status === 'saving' ? 0.7 : 1,
          animation: state.status === 'saving' ? 'cvs-pulse 1s ease-in-out infinite' : 'none',
        }}
      />
      <span>{meta.label}</span>
    </div>
  );
};

export const AppHeader: React.FC<AppHeaderProps> = ({ autoSave, variant }) => {
  const location = useLocation();
  const currentProject = useProjectStore((s) => s.currentProject);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { t } = useTranslation();
  const localize = useLocalizedHref();
  const currentLocale = useCurrentLocale();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Tauri desktop: skip the header entirely. The marketing nav was
  // already hidden, but the strip itself was still painting an empty
  // black bar over the editor. Brand/auto-save/share/auth-slot all
  // live elsewhere in desktop: title bar shows "Velxio Desktop", the
  // native menubar has File/Edit/View/Help, auto-save is a Pro cloud
  // feature (desktop saves to .vlx), share generates a velxio.dev URL
  // that doesn't apply to a desktop session, and the license flow
  // owns its own DesktopWelcomePage.
  if (import.meta.env.VITE_DESKTOP) {
    return null;
  }

  const isActive = (path: string) => {
    const localizedPath = localize(path);
    if (path === '/') {
      return location.pathname === localizedPath ? ' header-nav-link-active' : '';
    }
    return location.pathname === localizedPath || location.pathname.startsWith(localizedPath + '/')
      ? ' header-nav-link-active'
      : '';
  };

  const isEditor = variant === 'editor' || (!variant && location.pathname.includes('/editor'));

  return (
    <header className={`app-header ${isEditor ? 'app-header-editor' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          {/* Brand */}
          <div className="header-brand">
            <Link to={localize('/')} style={{ display: 'flex', alignItems: 'center' }}>
              <img src={vepsLogo} alt="VEPS Logo" className="header-logo-img" />
            </Link>
          </div>
        </div>

        {/* Main nav links (web only). The Tauri desktop build hides
            this nav and surfaces the equivalent actions via the
            native menubar (see pro/desktop/src-tauri/src/menu.rs in
            velxio-prod). VITE_DESKTOP is the env flag the Tauri
            build sets — main.tsx already uses it to gate the @pro
            overlay, same pattern here. */}
        <nav className={'header-nav-links' + (menuOpen ? ' header-nav-open' : '')}>
          <Link to={localize('/')} className={'header-nav-link' + isActive('/')}>
            {t('header.nav.home')}
          </Link>
          <Link to={localize('/docs')} className={'header-nav-link' + isActive('/docs')}>
            {t('header.nav.documentation')}
          </Link>
          <Link to={localize('/examples')} className={'header-nav-link' + isActive('/examples')}>
            {t('header.nav.examples')}
          </Link>
          <Link to={localize('/editor')} className={'header-nav-link' + isActive('/editor')}>
            {t('header.nav.editor')}
          </Link>
          <Link to={localize('/about')} className={'header-nav-link' + isActive('/about')}>
            {t('header.nav.about')}
          </Link>
        </nav>

        {/* Right: language + share + auth + mobile hamburger */}
        <div className="header-right">
          {/* Auto-save status — only when a project is loaded and the editor
              page mounted the hook */}
          {autoSave && currentProject && <AutoSaveIndicator state={autoSave} />}

          {/* Share button — visible when a project is loaded */}
          {currentProject && location.pathname === '/editor' && (
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                borderRadius: 4,
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#ccc',
                fontSize: 13,
              }}
              title="Share project"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          )}

          {/* Auth UI lives in the pro overlay — sign-in/sign-up buttons
              when anonymous, user dropdown when logged in. The overlay's
              mountPro() portals its HeaderAuth component into this slot
              via mountIntoSlot('header-auth'). In OSS without the
              overlay this slot stays empty, which is correct because the
              OSS image has no auth backend either. */}
          <div data-velxio-slot="header-auth" style={{ display: 'contents' }} />

          {!import.meta.env.VITE_DESKTOP && (
            <>
              <Link to={localize('/register')} className="header-btn-register">
                {t('header.auth.signUp')}
              </Link>
              <Link to={localize('/editor')} className="header-btn-workspace">
                <span>Workspace</span>
                <svg
                  className="header-btn-workspace-svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginLeft: 6 }}
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </>
          )}

          {/* Mobile hamburger — useless in desktop where the nav it
              would expand is itself hidden. */}
          {!import.meta.env.VITE_DESKTOP && (
            <button
              className="header-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </header>
  );
};
