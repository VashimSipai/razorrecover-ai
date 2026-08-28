import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import RecoveryFunnel from '../components/dashboard/RecoveryFunnel';
import FailureBreakdown from '../components/dashboard/FailureBreakdown';
import TransactionTable from '../components/transactions/TransactionTable';
import LiveAgentFlowVisualizer from '../components/agent/LiveAgentFlowVisualizer';
import { recoveryApi } from '../services/api';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalTxns, setTotalTxns] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [kpiData, funnelData, txData] = await Promise.all([
        recoveryApi.getDashboardKPIs(),
        recoveryApi.getFunnelStages(),
        recoveryApi.getTransactions({ page: 1, limit: 10 })
      ]);
      setKpis(kpiData);
      setFunnel(funnelData);
      setTransactions(txData.items || []);
      setTotalTxns(txData.total || 0);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecoverSingle = async (txnId) => {
    await recoveryApi.triggerRecovery(txnId);
    loadData();
  };

  return (
    <div className="main-content">
      <Header
        title="Revenue Recovery Command Center"
        subtitle="Autonomous diagnosis, bounded interventions, and deterministic policy containment"
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <div className="page-wrapper">
        {/* Multi-Agent Live Execution Pipeline Flow */}
        <LiveAgentFlowVisualizer activeStep={5} latencyMs={18} />

        {/* KPI Metrics */}
        <MetricsGrid kpis={kpis} />

        {/* Funnel & Taxonomy Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <RecoveryFunnel funnelData={funnel} />
          <FailureBreakdown />
        </div>

        {/* Recent Transactions */}
        <TransactionTable
          transactions={transactions}
          total={totalTxns}
          onRefresh={loadData}
          onRecoverSingle={handleRecoverSingle}
        />
      </div>
    </div>
  );
}
