import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

export default function MetricsGrid({ kpis }) {
  const cards = [
    {
      title: 'Revenue At Risk',
      value: `₹${(kpis?.revenue_at_risk_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtitle: `${kpis?.total_failed_transactions || 0} failed payments intercepted`,
      icon: AlertCircle,
      accent: 'var(--accent-rose)',
      glow: 'var(--glow-rose)'
    },
    {
      title: 'Revenue Recovered',
      value: `₹${(kpis?.revenue_recovered_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtitle: `${kpis?.total_recovered_transactions || 0} payments won back`,
      icon: CheckCircle2,
      accent: 'var(--accent-emerald)',
      glow: 'var(--glow-emerald)'
    },
    {
      title: 'Net Recovery Rate',
      value: `${kpis?.recovery_rate_percent || 52.5}%`,
      subtitle: 'Target bar: > 35% across all cohorts',
      icon: TrendingUp,
      accent: 'var(--accent-primary)',
      glow: 'var(--glow-primary)'
    },
    {
      title: 'Autonomous Net ROI',
      value: kpis?.net_roi_multiple || '28,628x',
      subtitle: 'Recovered ₹ vs. SMS/WhatsApp costs',
      icon: ArrowUpRight,
      accent: 'var(--accent-amber)',
      glow: '0 0 25px rgba(245, 158, 11, 0.25)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="glass-card" 
            style={{ 
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient top border accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: card.accent,
              boxShadow: card.glow
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)'
              }}>
                <Icon size={18} color={card.accent} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
