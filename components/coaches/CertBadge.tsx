import type { CertificationLevel } from '@/lib/types';

const CONFIG: Record<CertificationLevel, { bg: string; color: string; border: string }> = {
  CALC: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  PALC: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  SALC: { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' },
  MALC: { bg: '#fef9c3', color: '#a16207', border: '#fef08a' },
};

interface CertBadgeProps {
  level: CertificationLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function CertBadge({ level, size = 'sm' }: CertBadgeProps) {
  const cfg = CONFIG[level];
  const padding = size === 'lg' ? '6px 16px' : size === 'md' ? '4px 12px' : '2px 10px';
  const fontSize = size === 'lg' ? '0.875rem' : size === 'md' ? '0.8rem' : '0.72rem';

  return (
    <span
      style={{
        display: 'inline-block',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.06em',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {level}
    </span>
  );
}
