import React from 'react';
import { Filter, ArrowDown, CheckCircle2 } from 'lucide-react';

export default function RecoveryFunnel({ funnelData }) {
  const defaultStages = [
    { stage: 'Payment Failures Ingested', count: 300, conversion_rate: 100.0, color: '#6366F1' },
    { stage: 'AI Diagnosed & Scored', count: 300, conversion_rate: 100.0, color: '#3B82F6' },
    { stage: 'Policy Gate Approved', count: 264, conversion_rate: 88.0, color: '#06B6D4' },
    { stage: 'Interventions Dispatched', count: 222, conversion_rate: 74.0, color: '#34D399' },
    { stage: 'Revenue Recovered (Won Back)', count: 158, conversion_rate: 52.5, color: '#10B981' },
  ];

  const stages = (funnelData && funnelData.length > 0) ? funnelData : defaultStages;

  return (
    <div className="glass-card" style={{ padding: '28px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recovery Conversion Funnel
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stage-by-stage drop-off and policy containment pipeline
          </p>
        </div>
        <div style={{
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34D399',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          52.5% Final Win Rate
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stages.map((stage, idx) => {
          const pct = stage.conversion_rate;
          const barColor = idx === stages.length - 1 ? 'var(--accent-emerald)' : 'var(--accent-primary)';

          return (
            <div key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {stage.stage}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {stage.count} events
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div style={{
                width: '100%',
                height: '10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: idx === stages.length - 1 
                    ? 'linear-gradient(90deg, #10B981, #34D399)' 
                    : 'linear-gradient(90deg, #6366F1, #3B82F6)',
                  boxShadow: idx === stages.length - 1 ? 'var(--glow-emerald)' : 'var(--glow-primary)',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
