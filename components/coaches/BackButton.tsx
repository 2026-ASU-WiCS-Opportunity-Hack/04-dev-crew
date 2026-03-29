'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export default function BackButton({ fallbackHref = '/coaches', label = '← Back' }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="coach-profile-link"
      style={{ marginBottom: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
    >
      {label}
    </button>
  );
}
