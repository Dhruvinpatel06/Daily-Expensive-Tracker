import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  const configs = {
    success: { icon: CheckCircle, color: 'var(--success)', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    danger: { icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    info: { icon: Info, color: 'var(--accent-light)', bg: 'var(--accent-glow)', border: 'rgba(124,92,252,0.3)' },
  };

  const cfg = configs[toast.type] || configs.success;
  const Icon = cfg.icon;

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 18px',
        borderRadius: '12px',
        background: 'var(--bg-card)',
        border: `1px solid ${cfg.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: '240px',
        maxWidth: '320px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: cfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={cfg.color} />
      </div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
    </div>
  );
}
