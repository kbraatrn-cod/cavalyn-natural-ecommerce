'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="order-success">
      <div className="order-success__card">
        <div className="order-success__icon">✓</div>
        <h1 className="order-success__title">Siparişiniz Alındı! 🎉</h1>
        <p className="order-success__desc">
          Siparişiniz başarıyla oluşturuldu. Siparişinizi hazırlayıp en kısa sürede
          kargoya vereceğiz. Sipariş durumunuzu profilinizden takip edebilirsiniz.
        </p>
        {orderId && (
          <div className="order-success__order-id">
            Sipariş No: #{orderId.slice(-8).toUpperCase()}
          </div>
        )}
        <div className="order-success__actions">
          <Link href="/products" className="btn btn--primary btn--lg">
            Alışverişe Devam Et
          </Link>
          <Link href="/profile/orders" className="btn btn--secondary btn--lg">
            Siparişlerimi Gör
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="page-loader" style={{ paddingTop: '150px' }}>
        <div className="loader" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
