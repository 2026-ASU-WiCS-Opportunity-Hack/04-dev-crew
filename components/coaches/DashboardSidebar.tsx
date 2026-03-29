'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

const navItems = [
  { href: '/dashboard/coach', label: '📊 Overview' },
  { href: '/dashboard/coach/profile', label: '✏️ Edit Profile' },
  { href: '/dashboard/coach/sessions', label: '⏱ Session Logs' },
  { href: '/dashboard/coach/credits', label: '🎓 CE Credits' },
  { href: '/dashboard/coach/membership', label: '💳 Membership' },
  { href: '/dashboard/coach/recertification', label: '📋 Recertification' },
  { href: '/dashboard/coach/events', label: '📅 Events' },
  { href: '/dashboard/coach/jobs', label: '💼 Job Board' },
  { href: '/dashboard/coach/jobs/my-applications', label: '📨 My Applications' },
  { href: '/dashboard/coach/resources', label: '📚 Resources' },
];

interface DashboardSidebarProps {
  coach: Pick<CoachRecord, 'id' | 'full_name' | 'certification_level'> | null;
}

export default function DashboardSidebar({ coach }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__user">
        <p className="dash-sidebar__name">{coach?.full_name ?? 'Coach'}</p>
        {coach && <CertBadge level={coach.certification_level} />}
      </div>

      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`dash-nav-link${pathname === item.href ? ' dash-nav-link--active' : ''}`}
        >
          {item.label}
        </Link>
      ))}

      {coach && (
        <Link href={`/coaches/${coach.id}`} className="dash-nav-link">
          👁 Public Profile
        </Link>
      )}
    </aside>
  );
}
