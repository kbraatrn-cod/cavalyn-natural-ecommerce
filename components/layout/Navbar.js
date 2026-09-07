'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menüyü sayfa değiştiğinde kapat
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/products', label: 'Ürünler' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="navbar__logo" id="navbar-logo">
          <img src="/images/logo.png" alt="Cavalyn" className="navbar__logo-img" />
        </Link>

        {/* Navigation Links */}
        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__link ${pathname === link.href ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Favoriler */}
          {session && (
            <Link href="/profile/favorites" className="navbar__icon-btn" id="navbar-favorites" title="Favoriler">
              ♡
            </Link>
          )}

          {/* Sepet */}
          <Link href="/cart" className="navbar__icon-btn" id="navbar-cart" title="Sepet">
            🛒
            {itemCount > 0 && (
              <span className="navbar__badge">{itemCount}</span>
            )}
          </Link>

          {/* Kullanıcı */}
          {session ? (
            <div className="navbar__profile-wrapper">
              <button
                className="navbar__icon-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                id="navbar-profile"
                title="Profilim"
              >
                👤
              </button>
              {profileOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-name">{session.user.name}</span>
                    <span className="navbar__dropdown-email">{session.user.email}</span>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link href="/profile" className="navbar__dropdown-item">
                    👤 Profilim
                  </Link>
                  <Link href="/profile/orders" className="navbar__dropdown-item">
                    📦 Siparişlerim
                  </Link>
                  <Link href="/profile/favorites" className="navbar__dropdown-item">
                    ♡ Favorilerim
                  </Link>
                  {session.user.role === 'admin' && (
                    <>
                      <div className="navbar__dropdown-divider" />
                      <Link href="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin">
                        ⚙️ Admin Panel
                      </Link>
                    </>
                  )}
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--logout"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    🚪 Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn--primary btn--sm" id="navbar-login">
              Giriş Yap
            </Link>
          )}

          {/* Mobil Menü Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menüyü aç"
            id="navbar-mobile-toggle"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobil Menü Overlay */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__mobile-link ${pathname === link.href ? 'navbar__mobile-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <Link href="/login" className="btn btn--primary btn--full mt-4">
              Giriş Yap
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
