import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { getGlobalBrandingSettings } from '@/lib/branding';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'WIAL Platform',
    template: '%s | WIAL Platform',
  },
  description:
    'A unified platform for WIAL chapters, coaches, events, and certification information.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const branding = await getGlobalBrandingSettings();

  return (
    <html lang="en">
      <body
        data-template={branding.template_id}
        style={
          {
            '--brand': branding.brand_color,
            '--brand-dark': branding.brand_dark_color,
            '--accent': branding.accent_color,
            '--footer-background': branding.footer_background,
          } as CSSProperties
        }
      >
        <div className="site-shell">
          <Header
            headerCtaLabel={branding.header_cta_label}
            logoUrl={branding.logo_url}
            navItems={branding.primary_nav_json}
            siteName={branding.site_name}
          />
          <main className="site-main">{children}</main>
          <Footer
            executiveDirectorEmail={branding.executive_director_email}
            footerSummary={branding.footer_summary}
            siteName={branding.site_name}
          />
        </div>
      </body>
    </html>
  );
}
