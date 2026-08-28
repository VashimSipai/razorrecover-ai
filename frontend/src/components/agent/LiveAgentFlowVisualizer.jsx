import React from 'react';
import { Search, Calculator, Lightbulb, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

export default function LiveAgentFlowVisualizer({ activeStep = 5, latencyMs = 18 }) {
  const nodes = [
    {
      id: 'classifier',
      number: '01',
      title: 'Root Cause Classifier',
      subtitle: '20+ Taxonomy Mapping',
      icon: Search,
      accent: '#6366F1'
    },
    {
      id: 'scorer',
      number: '02',
      title: 'Recovery Scorer',
      subtitle: 'Decay & Salary Heuristics',
      icon: Calculator,
      accent: '#3B82F6'
    },
    {
      id: 'strategist',
      number: '03',
      title: 'AI Strategist',
      subtitle: 'Contextual Action Plan',
      icon: Lightbulb,
      accent: '#06B6D4'
    },
    {
      id: 'policy_gate',
      number: '04',
      title: 'Deterministic Policy Gate',
      subtitle: 'Hard Safety & HITL Limits',
      icon: ShieldCheck,
      accent: '#F59E0B'
    },
    {
      id: 'dispatcher',
      number: '05',
      title: 'Action Dispatcher',
      subtitle: 'Razorpay SDK & WhatsApp',
      icon: Zap,
      accent: '#10B981'
    }
  ];

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-transient" style={{ fontSize: '0.7rem' }}>
              LangGraph State Machine
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deterministic Invariant: LLM Reasoning ➔ Hard Policy Containment
            </span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            Multi-Agent Supervisor Execution Pipeline
          </h3>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          color: '#34D399',
          fontWeight: 700
        }}>
          <CheckCircle2 size={14} /> Pipeline Speed: ~{latencyMs}ms
        </div>
      </div>

      {/* Nodes Horizontal Flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        position: 'relative'
      }}>
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isPassed = idx < activeStep;
          const isCurrent = idx === activeStep - 1;

          return (
            <div
              key={node.id}
              style={{
                background: isCurrent ? 'rgba(25, 34, 53, 0.9)' : 'rgba(18, 24, 38, 0.5)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: isCurrent ? `1px solid ${node.accent}` : '1px solid var(--border-subtle)',
                boxShadow: isCurrent ? `0 0 20px ${node.accent}33` : 'none',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {node.number}
                </span>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: `${node.accent}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${node.accent}44`
                }}>
                  <Icon size={14} color={node.accent} />
                </div>
              </div>

              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: isCurrent ? '#FFFFFF' : 'var(--text-secondary)', marginBottom: '2px' }}>
                {node.title}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {node.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
