import React from 'react';
import { ShieldCheck, Download, RefreshCw, Activity } from 'lucide-react';
import { recoveryApi } from '../../services/api';

export default function Header({ title, subtitle, onRefresh, isRefreshing = false }) {
  const handleExportCSV = () => {
    window.open(recoveryApi.getComplianceExportUrl('csv'), '_blank');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 40px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(7, 9, 14, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Circuit Breaker Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <Activity size={14} color="#10B981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399' }}>
            Circuit Breaker: Active (3.0s)
          </span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync</span>
          </button>
        )}

        {/* Download Compliance CSV Button */}
        <button 
          onClick={handleExportCSV}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <Download size={14} />
          <span>Compliance Audit CSV</span>
        </button>
      </div>
    </header>
  );
}
