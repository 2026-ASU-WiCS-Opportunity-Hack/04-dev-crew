'use client';

interface RecertificationActionsProps {
  allMet: boolean;
}

export default function RecertificationActions({ allMet }: RecertificationActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button
        className="button-primary"
        disabled={!allMet}
        style={{ opacity: !allMet ? 0.5 : 1, cursor: !allMet ? 'not-allowed' : 'pointer' }}
        onClick={() => alert('Application submission coming soon. Contact your chapter lead directly.')}
      >
        Submit Application
      </button>
      <a href="mailto:info@wial.org" className="button-secondary">
        Contact WIAL Global
      </a>
    </div>
  );
}
