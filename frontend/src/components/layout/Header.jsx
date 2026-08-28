import React, { useState } from 'react';
import { ShieldCheck, Download, RefreshCw, Activity, Play, Sparkles, FileText } from 'lucide-react';
import { recoveryApi } from '../../services/api';
import GuidedTourModal from '../demo/GuidedTourModal';
import ComplianceReportModal from '../compliance/ComplianceReportModal';

export default function Header({ title, subtitle, onRefresh, isRefreshing = false }) {
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  return (
    <>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 1-Click Guided Demo Button */}
          <button
            onClick={() => setShowGuidedTour(true)}
            className="btn-primary"
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Play size={14} />
            <span>Launch 2-Min Demo</span>
          </button>

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

          {/* Download Compliance Audit Modal Button */}
          <button 
            onClick={() => setShowComplianceModal(true)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>Compliance Audit</span>
          </button>
        </div>
      </header>

      {showGuidedTour && (
        <GuidedTourModal onClose={() => setShowGuidedTour(false)} />
      )}

      {showComplianceModal && (
        <ComplianceReportModal onClose={() => setShowComplianceModal(false)} />
      )}
    </>
  );
}
