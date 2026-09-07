'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // Şifre güçlülüğü
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: 'Zayıf', color: 'var(--color-error)' };
    if (score <= 2) return { level: 2, text: 'Orta', color: 'var(--color-warning)' };
    if (score <= 3) return { level: 3, text: 'İyi', color: 'var(--color-info)' };
    return { level: 4, text: 'Güçlü', color: 'var(--color-success)' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      // Kayıt
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kayıt başarısız oldu');
        return;
      }

      // Otomatik giriş
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Kayıt başarılı ama giriş olmadı, login sayfasına yönlendir
        addToast('Hesabınız oluşturuldu! Giriş yapabilirsiniz.', 'success');
        router.push('/login');
      } else {
        addToast('Hoş geldiniz! Hesabınız başarıyla oluşturuldu.', 'success');
        router.push('/');
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
          <h2 className="auth-page__visual-title">Aramıza Katılın</h2>
          <p className="auth-page__visual-desc">
            Ücretsiz hesap oluşturun ve doğal güzellik dünyasını keşfetmeye
            hemen başlayın. Özel indirimler ve kampanyalardan yararlanın.
          </p>
        </div>
      </div>

      {/* Sağ Form */}
      <div className="auth-page__form-side">
        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <h1 className="auth-form__title">Hesap Oluştur</h1>
          <p className="auth-form__subtitle">
            Hemen ücretsiz kayıt olun ve alışverişe başlayın
          </p>

          {error && (
            <div className="toast toast--error" style={{ marginBottom: 'var(--space-4)' }}>
              <span className="toast__icon">✕</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-form__fields">
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Ad Soyad</label>
              <input
                type="text"
                id="register-name"
                name="name"
                className="form-input"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">E-posta</label>
              <input
                type="email"
                id="register-email"
                name="email"
                className="form-input"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Şifre</label>
              <input
                type="password"
                id="register-password"
                name="password"
                className="form-input"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              {/* Şifre Güçlülük Göstergesi */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '4px',
                  }}>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          background: i <= strength.level ? strength.color : 'var(--color-gray-200)',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    color: strength.color,
                    fontWeight: 600,
                  }}>
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Şifre Tekrar</label>
              <input
                type="password"
                id="register-confirm"
                name="confirmPassword"
                className={`form-input ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'form-input--error'
                    : ''
                }`}
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className="form-error">Şifreler eşleşmiyor</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--full"
              disabled={loading}
              id="register-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loader loader--sm" /> Hesap Oluşturuluyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </div>

          <div className="auth-form__footer">
            Zaten hesabınız var mı?{' '}
            <Link href="/login">Giriş Yapın</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
