import React from 'react';
import { X, Bot, CheckCircle2, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function AgentTraceModal({ transaction, auditLogs = [], onClose }) {
  if (!transaction) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <Bot size={20} color="#6366F1" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                LangGraph Agent Reasoning Trace
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Transaction: {transaction.razorpay_payment_id} • Amount: ₹{(transaction.amount_paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Diagnostic Overview Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Failure Category</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>
              {(transaction.failure_category || 'Transient').toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P(Recovery)</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              {Math.round((transaction.recovery_probability || 0.75) * 100)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div>
            <span className={`badge badge-${transaction.status === 'recovered' ? 'recovered' : transaction.status === 'recovering' ? 'recovering' : 'failed'}`}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Step-by-Step ReAct Timeline */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Supervisor Execution Timeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {auditLogs.map((log, idx) => (
              <div 
                key={log.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid #6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'capitalize' }}>
                      {log.event_type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                    {log.agent_thought_trace || JSON.stringify(log.event_payload)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
