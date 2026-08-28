import React from 'react';
import Header from '../components/layout/Header';
import WebhookSimulator from '../components/simulator/WebhookSimulator';

export default function Simulator() {
  return (
    <div className="main-content">
      <Header
        title="Payment Failure Webhook Simulator"
        subtitle="Simulate real-time payment failure events and watch autonomous LangGraph recovery live"
      />

      <div className="page-wrapper">
        <WebhookSimulator />
      </div>
    </div>
  );
}
