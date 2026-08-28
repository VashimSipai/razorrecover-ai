import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import HITLApprovalModal from './HITLApprovalModal';

export default function ApprovalQueue({ items = [], onDecision, isSubmitting }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={28} color="#10B981" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
          Approval Queue is Clear
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
          All high-value transactions have been reviewed. Automated transactions within safety limits continue running.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Failure Diagnostic</th>
              <th>Proposed Strategy</th>
              <th>Risk Flag</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.customer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.customer_phone}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--accent-amber)', fontSize: '0.95rem' }}>
                    ₹{(item.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="badge badge-hitl" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                    Paused HITL
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#FB7185', fontSize: '0.8rem' }}>{item.error_code}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.payment_method.toUpperCase()}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--accent-accent)' }}>
                    {item.proposed_strategy.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                    {item.risk_reason}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Review Action <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <HITLApprovalModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDecision={(queueId, payload) => {
            onDecision(queueId, payload);
            setSelectedItem(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
