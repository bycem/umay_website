import type { ReactNode } from 'react';

export type NavKey = 'sliders' | 'announcements';

interface AppLayoutProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: 'sliders', label: 'Slider' },
  { key: 'announcements', label: 'Duyurular' },
];

export default function AppLayout({ active, onNavigate, onLogout, children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <img src="/logo.png" alt="Umay Okçuluk" className="app-sidebar-logo" />
          <nav className="app-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  'app-sidebar-link' + (active === item.key ? ' app-sidebar-link--active' : '')
                }
                onClick={() => onNavigate(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button type="button" className="app-sidebar-logout" onClick={onLogout}>
          Çıkış
        </button>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}
