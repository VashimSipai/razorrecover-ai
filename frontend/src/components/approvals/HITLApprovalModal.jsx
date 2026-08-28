import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Edit3, X, AlertTriangle } from 'lucide-react';

export default function HITLApprovalModal({ item, onClose, onDecision, isSubmitting }) {
  const [actionType, setActionType] = useState('approve'); // 'approve', 'modify', 'reject'
  const [modifiedStrategy, setModifiedStrategy] = useState(item?.proposed_strategy || 'payment_link');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const handleSubmit = () => {
    onDecision(item.id, {
      action: actionType,
      modified_strategy: actionType === 'modify' ? modifiedStrategy : undefined,
      reviewer_notes: notes || 'Reviewed by merchant operator in live evaluation.'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <ShieldAlert size={20} color="#F59E0B" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Human-in-the-Loop Authorization
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                LangGraph State Machine Paused • Thread: {item.id}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>{item.customer_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.customer_phone}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction Amount</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                ₹{(item.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Error Diagnostic</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FB7185' }}>{item.error_code}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P(Recovery)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {int(item.recovery_probability * 100) || 75}%
              </div>
            </div>
          </div>
        </div>

        {/* Risk Trigger Alert */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: '20px'
        }}>
          <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FBBF24' }}>
              Policy Trigger Reason
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {item.risk_reason}
            </div>
          </div>
        </div>

        {/* Agent Proposed Strategy */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            🤖 Agent Recommendation
          </div>
          <p style={{
            fontSize: '0.825rem',
            color: 'var(--text-primary)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            lineHeight: 1.6
          }}>
            {item.agent_recommendation || `Execute ${item.proposed_strategy} with customer WhatsApp verification link.`}
          </p>
        </div>

        {/* Action Selection Tabs */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Choose Review Action
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActionType('approve')}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: actionType === 'approve' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                border: actionType === 'approve' ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                color: actionType === 'approve' ? '#34D399' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle size={16} /> Approve
            </button>

            <button
              type="button"
              onClick={() => setActionType('modify')}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: actionType === 'modify' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-tertiary)',
                border: actionType === 'modify' ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                color: actionType === 'modify' ? '#60A5FA' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={16} /> Modify Plan
            </button>

            <button
              type="button"
              onClick={() => setActionType('reject')}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: actionType === 'reject' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-tertiary)',
                border: actionType === 'reject' ? '1px solid #F43F5E' : '1px solid var(--border-subtle)',
                color: actionType === 'reject' ? '#FB7185' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>

        {/* Modify Option Selector */}
        {actionType === 'modify' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Override Strategy
            </label>
            <select
              value={modifiedStrategy}
              onChange={e => setModifiedStrategy(e.target.value)}
              className="input-field"
            >
              <option value="payment_link">Payment Link (Alternate Method)</option>
              <option value="smart_retry">Smart Retry (Schedule Delay)</option>
              <option value="mandate_retry">Mandate Retargeting</option>
              <option value="escalation">Manual VIP Account Escalation</option>
            </select>
          </div>
        )}

        {/* Reviewer Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Audit Log Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Verified customer KYC, approved alternate split link."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Resuming State Machine...' : 'Submit Decision & Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

function int(val) {
  return Math.round(Number(val) || 0);
}
