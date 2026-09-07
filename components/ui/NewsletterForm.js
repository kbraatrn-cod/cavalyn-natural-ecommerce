'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      addToast('Bültenimize başarıyla abone oldunuz! 🎉', 'success');
      setEmail('');
    }
  };

  return (
    <form className="newsletter__form" onSubmit={handleSubmit}>
      <input
        type="email"
        className="newsletter__input"
        placeholder="E-posta adresinizi girin"
        id="newsletter-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn--gold btn--lg">
        Abone Ol
      </button>
    </form>
  );
}
