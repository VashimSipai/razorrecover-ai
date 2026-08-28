import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FailureBreakdown() {
  const categoryData = [
    { name: 'Transient Gateway', count: 892, value: 74.1, color: '#6366F1' },
    { name: 'Soft Declines (Balance)', count: 738, value: 49.9, color: '#3B82F6' },
    { name: 'Auth / 3DS Drops', count: 474, value: 40.2, color: '#06B6D4' },
    { name: 'Autopay Mandate', count: 185, value: 34.2, color: '#F59E0B' },
    { name: 'Hard Declines (Risk)', count: 211, value: 9.8, color: '#F43F5E' },
  ];

  return (
    <div className="glass-card" style={{ padding: '28px', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Failure Taxonomy & Win Rates
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          20+ Razorpay error codes categorized into recovery cohorts
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categoryData.map((cat, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: cat.color }} />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {cat.count} failed events
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                {cat.value}%
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Win Rate
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
