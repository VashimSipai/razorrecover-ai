import React, { useState } from 'react';
import { Search, Filter, Play, Eye, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
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
    <div className="glass-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Intercepted Transactions Ledger
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Showing {transactions.length} of {total} failed records monitored by autonomous recovery agent
          </p>
        </div>
      </div>

      <div className="table-container" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
        <table className="custom-table" style={{ width: '100%', minWidth: '950px' }}>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Payment ID</th>
              <th style={{ width: '160px' }}>Customer</th>
              <th style={{ width: '110px' }}>Amount</th>
              <th style={{ width: '110px' }}>Category</th>
              <th style={{ width: '150px' }}>Error Code</th>
              <th style={{ width: '90px' }}>P(Win)</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '160px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const status = txn.status;
              const isRecovering = recoveringId === txn.id;

              return (
                <tr key={txn.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
                      {txn.razorpay_payment_id}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {txn.payment_method?.toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.8rem' }}>{txn.customer_name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {txn.customer_email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      ₹{(txn.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-transient" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {txn.failure_category || 'Transient'}
                    </span>
                  </td>
                  <td>
                    <div 
                      title={txn.error_code}
                      style={{ fontSize: '0.7rem', color: '#FB7185', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {txn.error_code}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>
                      {Math.round((txn.recovery_probability || 0.6) * 100)}%
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${status === 'recovered' ? 'recovered' : status === 'recovering' ? 'recovering' : status === 'paused_hitl' ? 'hitl' : 'failed'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {status === 'failed' && (
                        <button
                          onClick={() => handleRecover(txn.id)}
                          className="btn-primary"
                          style={{ padding: '5px 9px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                          disabled={isRecovering}
                        >
                          <Play size={11} /> {isRecovering ? '...' : 'Recover'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleViewTrace(txn)}
                        className="btn-secondary"
                        style={{ padding: '5px 9px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                        title="View LangGraph Agent Reasoning Trace"
                      >
                        <Eye size={11} /> Trace
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
