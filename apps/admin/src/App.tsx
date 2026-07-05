import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './lib/api';
import Login from './pages/Login';
import AppLayout from './components/AppLayout';
import type { NavKey } from './components/AppLayout';
import { ToastProvider } from './components/Toast';
import SlidersPage from './pages/SlidersPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

type Phase = 'checking' | 'login' | 'panel';

export default function App() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [active, setActive] = useState<NavKey>('sliders');

  useEffect(() => {
    setUnauthorizedHandler(() => setPhase('login'));
    api
      .get('/api/auth/me')
      .then(() => setPhase('panel'))
      .catch(() => setPhase('login'));
  }, []);

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Çıkış isteği başarısız oldu, oturum yine de sonlandırılıyor:', err);
    } finally {
      setPhase('login');
    }
  }

  if (phase === 'checking') return null;
  if (phase === 'login') return <Login onLogin={() => setPhase('panel')} />;

  return (
    <ToastProvider>
      <AppLayout active={active} onNavigate={setActive} onLogout={handleLogout}>
        {active === 'sliders' ? <SlidersPage /> : <AnnouncementsPage />}
      </AppLayout>
    </ToastProvider>
  );
}
