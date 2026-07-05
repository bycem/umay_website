import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './lib/api';
import Login from './pages/Login';

type Phase = 'checking' | 'login' | 'panel';

export default function App() {
  const [phase, setPhase] = useState<Phase>('checking');

  useEffect(() => {
    setUnauthorizedHandler(() => setPhase('login'));
    api
      .get('/api/auth/me')
      .then(() => setPhase('panel'))
      .catch(() => setPhase('login'));
  }, []);

  if (phase === 'checking') return null;
  if (phase === 'login') return <Login onLogin={() => setPhase('panel')} />;
  return <div>panel placeholder</div>; // Task 14'te AppLayout gelecek
}
