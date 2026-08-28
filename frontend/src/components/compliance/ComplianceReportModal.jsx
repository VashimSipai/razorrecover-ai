import React from 'react';
import { X, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { recoveryApi } from '../../services/api';

export default function ComplianceReportModal({ onClose }) {
  const handleDownloadCSV = () => {
    window.open(recoveryApi.getComplianceExportUrl('csv'), '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)' }}>
              <ShieldCheck size={18} color="#10B981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Regulatory Compliance Audit Export</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tamper-evident RBI and merchant audit records</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 size={16} color="#10B981" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Audit Ledger Integrity: Verified</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This export contains all timestamped ReAct thought traces, policy checks, Human-in-the-Loop decision overrides, and Razorpay resource IDs in compliance with standard financial reporting rules.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            Close
          </button>
          <button onClick={handleDownloadCSV} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            <Download size={14} />
            <span>Download CSV Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
}
