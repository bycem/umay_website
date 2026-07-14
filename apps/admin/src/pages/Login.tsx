import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/api/auth/login', { username, password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 48,
          borderRadius: 16,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <img
          src="/logo.png"
          alt="Umay Okçuluk"
          width={64}
          height={64}
          style={{ display: 'block', margin: '0 auto 24px' }}
        />
        <h1
          style={{
            margin: '0 0 24px',
            fontFamily: 'var(--font-heading)',
            fontSize: 24,
            textAlign: 'center',
            color: 'var(--ink)',
          }}
        >
          Yönetim Paneli
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adı"
            autoComplete="username"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 16,
              fontFamily: 'var(--font-body)',
              color: 'var(--ink)',
              background: 'var(--surface)',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            autoComplete="current-password"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 16,
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 16,
              fontFamily: 'var(--font-body)',
              color: 'var(--ink)',
              background: 'var(--surface)',
            }}
          />
          {error && (
            <div
              style={{
                marginBottom: 16,
                color: 'var(--accent-dark)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = 'var(--accent-dark)';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.background = 'var(--accent)';
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
