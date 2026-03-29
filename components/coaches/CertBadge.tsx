import type { CertificationLevel } from '@/lib/types';

interface CertBadgeProps {
  level: CertificationLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function CertBadge({ level, size = 'sm' }: CertBadgeProps) {
  return (
    <span className={`cert-badge cert-badge--${level} cert-badge--${size}`}>
      {level}
    </span>
  );
}
