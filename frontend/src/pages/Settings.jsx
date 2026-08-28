import React from 'react';
import Header from '../components/layout/Header';
import PolicyEditor from '../components/policies/PolicyEditor';

export default function Settings() {
  return (
    <div className="main-content">
      <Header
        title="Merchant Policy & Safety Guardrails"
        subtitle="Tune deterministic containment rules, retry cooldowns, and Human-in-the-Loop thresholds"
      />

      <div className="page-wrapper">
        <PolicyEditor />
      </div>
    </div>
  );
}
