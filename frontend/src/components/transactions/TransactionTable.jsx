import React, { useState } from 'react';
import { Search, Filter, Play, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import AgentTraceModal from '../agent/AgentTraceModal';
import { recoveryApi } from '../../services/api';

export default function TransactionTable({ transactions = [], total = 0, onRefresh, onRecoverSingle }) {
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingTrace, setIsLoadingTrace] = useState(false);
  const [recoveringId, setRecoveringId] = useState(null);

  const handleViewTrace = async (txn) => {
    setIsLoadingTrace(true);
    try {
      const data = await recoveryApi.getTransactionDetail(txn.id);
      setSelectedTxn(data.transaction);
      setAuditLogs(data.audit_logs || []);
    } catch (e) {
      console.error("Failed to load transaction trace:", e);
      setSelectedTxn(txn);
      setAuditLogs([]);
    } finally {
      setIsLoadingTrace(false);
    }
  };

  const handleRecover = async (txnId) => {
    setRecoveringId(txnId);
    try {
      await onRecoverSingle(txnId);
    } finally {
      setRecoveringId(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Intercepted Transactions Ledger
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total {total} failed payment records monitored by recovery agent
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Diagnostic Category</th>
              <th>Error Code</th>
              <th>P(Recovery)</th>
              <th>Status</th>
              <th style={{ minWidth: '200px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const status = txn.status;
              const isRecovering = recoveringId === txn.id;

              return (
                <tr key={txn.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {txn.razorpay_payment_id}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {txn.payment_method?.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{txn.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.customer_email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>
                      ₹{(txn.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-transient" style={{ fontSize: '0.7rem' }}>
                      {txn.failure_category || 'Transient'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: '#FB7185', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {txn.error_code}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                      {Math.round((txn.recovery_probability || 0.6) * 100)}%
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${status === 'recovered' ? 'recovered' : status === 'recovering' ? 'recovering' : status === 'paused_hitl' ? 'hitl' : 'failed'}`}>
                      {status}
                    </span>
                  </td>
                  <td style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {status === 'failed' && (
                        <button
                          onClick={() => handleRecover(txn.id)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          disabled={isRecovering}
                        >
                          <Play size={12} /> {isRecovering ? '...' : 'Recover'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleViewTrace(txn)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        title="View LangGraph Agent Reasoning Trace"
                      >
                        <Eye size={12} /> Trace
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedTxn && (
        <AgentTraceModal
          transaction={selectedTxn}
          auditLogs={auditLogs}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
}
