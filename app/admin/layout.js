'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SITE_CONFIG } from '@/lib/constants';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Ürünler', icon: '📦' },
  { href: '/admin/orders', label: 'Siparişler', icon: '🧾' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        <div className="loader" />
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="empty-state" style={{ paddingTop: '150px' }}>
        <div className="empty-state__icon">🔐</div>
        <h2 className="empty-state__title">Yetkisiz Erişim</h2>
        <p className="empty-state__desc">Bu sayfaya erişim yetkiniz yok.</p>
        <Link href="/" className="btn btn--primary mt-6">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-sidebar__logo">
            <span>⚙️</span>
            {sidebarOpen && <span>{SITE_CONFIG.name} Admin</span>}
          </Link>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Sidebar aç/kapat"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? 'admin-sidebar__link--active'
                  : ''
              }`}
            >
              <span className="admin-sidebar__link-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__link">
            <span className="admin-sidebar__link-icon">🏠</span>
            {sidebarOpen && <span>Siteye Dön</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar__title">
            {adminNavItems.find(item =>
              item.href === pathname ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            )?.label || 'Admin Panel'}
          </h1>
          <div className="admin-topbar__user">
            <span>{session.user.name}</span>
            <span className="badge badge--primary">Admin</span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
