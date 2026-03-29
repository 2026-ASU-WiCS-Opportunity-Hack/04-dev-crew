'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const MIN_FONT = 12;
const MAX_FONT = 24;
const DEFAULT_FONT = 16;
const MIN_BRIGHT = 50;
const MAX_BRIGHT = 150;
const DEFAULT_BRIGHT = 100;

const LANGUAGES = [
  { code: '', label: 'English (Default)' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh-CN', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
];

function applyGoogleTranslate(lang: string) {
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (!select) return;
  select.value = lang;
  select.dispatchEvent(new Event('change'));
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT);
  const [brightness, setBrightness] = useState(DEFAULT_BRIGHT);
  const [language, setLanguage] = useState('');
  const [translateReady, setTranslateReady] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedFont = parseInt(localStorage.getItem('a11y-font') ?? '');
    const savedBright = parseInt(localStorage.getItem('a11y-bright') ?? '');
    const savedLang = localStorage.getItem('a11y-lang') ?? '';

    if (!isNaN(savedFont)) {
      setFontSize(savedFont);
      document.documentElement.style.fontSize = `${savedFont}px`;
    }
    if (!isNaN(savedBright)) {
      setBrightness(savedBright);
      document.documentElement.style.filter = `brightness(${savedBright}%)`;
    }
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Auto-apply saved language once Google Translate is ready
  useEffect(() => {
    if (!translateReady || !language) return;
    const timer = setTimeout(() => applyGoogleTranslate(language), 800);
    return () => clearTimeout(timer);
  }, [translateReady, language]);

  // Close widget when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const widget = document.getElementById('a11y-widget');
      if (widget && !widget.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function changeFont(delta: number) {
    const next = Math.min(MAX_FONT, Math.max(MIN_FONT, fontSize + delta));
    setFontSize(next);
    document.documentElement.style.fontSize = `${next}px`;
    localStorage.setItem('a11y-font', String(next));
  }

  function changeBrightness(delta: number) {
    const next = Math.min(MAX_BRIGHT, Math.max(MIN_BRIGHT, brightness + delta));
    setBrightness(next);
    document.documentElement.style.filter = `brightness(${next}%)`;
    localStorage.setItem('a11y-bright', String(next));
  }

  function changeLanguage(lang: string) {
    setLanguage(lang);
    localStorage.setItem('a11y-lang', lang);
    applyGoogleTranslate(lang);
  }

  function reset() {
    setFontSize(DEFAULT_FONT);
    setBrightness(DEFAULT_BRIGHT);
    setLanguage('');
    document.documentElement.style.fontSize = '';
    document.documentElement.style.filter = '';
    localStorage.removeItem('a11y-font');
    localStorage.removeItem('a11y-bright');
    localStorage.removeItem('a11y-lang');
    applyGoogleTranslate('');
  }

  return (
    <>
      {/* Google Translate init — must be before the script loads */}
      <Script id="gt-init" strategy="lazyOnload">{`
        window.googleTranslateElementInit = function() {
          new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'es,pt,fr,ar,zh-CN,hi,sw,yo,ha',
            autoDisplay: false
          }, 'google_translate_element');
        };
      `}</Script>

      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
        onLoad={() => setTranslateReady(true)}
      />

      {/* Hidden Google Translate anchor */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Floating widget */}
      <div id="a11y-widget" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Accessibility options"
          title="Accessibility options"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--brand, #1a56db)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Aa
        </button>

        {/* Panel */}
        {open && (
          <div
            style={{
              position: 'absolute',
              bottom: '3.75rem',
              right: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.25rem',
              width: '230px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280' }}>
              Accessibility
            </p>

            {/* Text size */}
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>Text Size</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => changeFont(-2)} style={btnStyle} disabled={fontSize <= MIN_FONT}>A−</button>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', minWidth: '36px', textAlign: 'center' }}>{fontSize}px</span>
                <button type="button" onClick={() => changeFont(2)} style={btnStyle} disabled={fontSize >= MAX_FONT}>A+</button>
              </div>
            </div>

            {/* Brightness */}
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>Brightness</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => changeBrightness(-10)} style={btnStyle} disabled={brightness <= MIN_BRIGHT}>−</button>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', minWidth: '36px', textAlign: 'center' }}>{brightness}%</span>
                <button type="button" onClick={() => changeBrightness(10)} style={btnStyle} disabled={brightness >= MAX_BRIGHT}>+</button>
              </div>
            </div>

            {/* Language */}
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#111' }}>Language</p>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb' }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              {!translateReady && language && (
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: '#6b7280' }}>Loading translator...</p>
              )}
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={reset}
              style={{ fontSize: '0.78rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              ↺ Reset to defaults
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.3rem 0.65rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  background: '#f9fafb',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: '#111',
};
