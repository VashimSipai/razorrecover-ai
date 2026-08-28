import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ApprovalQueue from '../components/approvals/ApprovalQueue';
import { recoveryApi } from '../services/api';

export default function Approvals({ onUpdatePending }) {
  const [items, setItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadApprovals = async () => {
    setIsRefreshing(true);
    try {
      const data = await recoveryApi.getPendingApprovals();
      setItems(data);
      if (onUpdatePending) onUpdatePending(data.length);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecision = async (queueId, payload) => {
    setIsSubmitting(true);
    try {
      await recoveryApi.submitApprovalDecision(queueId, payload);
      await loadApprovals();
    } catch (err) {
      console.error("Decision failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <Header
        title="Human-in-the-Loop Approval Center"
        subtitle="Review, modify, or approve high-value transactions (> ₹50k) paused by LangGraph"
        onRefresh={loadApprovals}
        isRefreshing={isRefreshing}
      />

      <div className="page-wrapper">
        <ApprovalQueue
          items={items}
          onDecision={handleDecision}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
