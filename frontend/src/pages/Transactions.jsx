import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import TransactionTable from '../components/transactions/TransactionTable';
import { recoveryApi } from '../services/api';
import { Play, Search, Filter } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const loadTransactions = async () => {
    setIsRefreshing(true);
    try {
      const data = await recoveryApi.getTransactions({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
        page,
        limit: 20
      });
      setTransactions(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter, categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  const handleRecoverSingle = async (txnId) => {
    await recoveryApi.triggerRecovery(txnId);
    loadTransactions();
  };

  const handleBatchRecover = async () => {
    setIsBatchProcessing(true);
    try {
      await recoveryApi.triggerBatchRecovery(25);
      await loadTransactions();
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <div className="main-content">
      <Header
        title="Transaction Diagnostics & Audit History"
        subtitle="Complete database of failed transactions with real-time ReAct trace visibility"
        onRefresh={loadTransactions}
        isRefreshing={isRefreshing}
      />

      <div className="page-wrapper">
        {/* Filter Bar */}
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by customer, payment ID, or error code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ width: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="failed">Failed</option>
              <option value="recovering">Recovering</option>
              <option value="recovered">Recovered</option>
              <option value="paused_hitl">Paused (HITL)</option>
              <option value="unrecoverable">Unrecoverable</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="input-field"
              style={{ width: '160px' }}
            >
              <option value="">All Categories</option>
              <option value="transient">Transient</option>
              <option value="soft_decline">Soft Decline</option>
              <option value="auth_failure">Auth Failure</option>
              <option value="mandate">Mandate</option>
              <option value="hard_decline">Hard Decline</option>
            </select>

            <button
              onClick={handleBatchRecover}
              className="btn-primary"
              style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              disabled={isBatchProcessing}
            >
              <Play size={14} />
              <span>{isBatchProcessing ? 'Recovering Batch...' : 'Recover Batch (25)'}</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionTable
          transactions={transactions}
          total={total}
          onRefresh={loadTransactions}
          onRecoverSingle={handleRecoverSingle}
        />
      </div>
    </div>
  );
}
