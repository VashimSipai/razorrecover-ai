import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import Approvals from './pages/Approvals';
import Transactions from './pages/Transactions';
import Benchmark from './pages/Benchmark';
import Simulator from './pages/Simulator';
import Settings from './pages/Settings';
import { recoveryApi } from './services/api';
import { usePolling } from './hooks/usePolling';

export default function App() {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const items = await recoveryApi.getPendingApprovals();
      setPendingApprovalsCount(items.length);
    } catch (e) {
      // ignore
    }
  };

  // Automatically poll pending approval counts every 15 seconds
  usePolling(fetchPendingCount, 15000);

  return (
    <Router>
      <div className="app-container">
        <Sidebar pendingCount={pendingApprovalsCount} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/approvals" element={<Approvals onUpdatePending={setPendingApprovalsCount} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}
