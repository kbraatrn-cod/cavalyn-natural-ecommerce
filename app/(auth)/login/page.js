'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        addToast('Başarıyla giriş yaptınız!', 'success');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Sol Görsel */}
      <div className="auth-page__visual">
        <div className="auth-page__visual-pattern" />
        <div className="auth-page__visual-content">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
          <h2 className="auth-page__visual-title">Hoş Geldiniz</h2>
          <p className="auth-page__visual-desc">
            Doğal güzellik yolculuğunuza kaldığınız yerden devam edin.
            Yüzlerce doğal ürün sizi bekliyor.
          </p>
        </div>
      </div>

      {/* Sağ Form */}
      <div className="auth-page__form-side">
        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <h1 className="auth-form__title">Giriş Yap</h1>
          <p className="auth-form__subtitle">
            Hesabınıza giriş yaparak alışverişe başlayın
          </p>

          {error && (
            <div className="toast toast--error" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="toast__icon">✕</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-form__fields">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">E-posta</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Şifre</label>
              <input
                type="password"
                id="login-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--full"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loader loader--sm" /> Giriş Yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>

          <div className="auth-form__footer">
            Hesabınız yok mu?{' '}
            <Link href="/register">Hemen Kayıt Olun</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="page-loader" style={{ paddingTop: '150px' }}>
        <div className="loader" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
