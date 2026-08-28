import React from 'react';
import { Bot, Sparkles, Activity } from 'lucide-react';

export default function AgentThinking({ message = "Agent is reasoning over transaction telemetry..." }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      background: 'rgba(99, 102, 241, 0.1)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: 'var(--radius-md)',
      color: '#A5B4FC',
      fontSize: '0.8rem',
      fontWeight: 600
    }}>
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse-indigo 1.5s infinite'
      }}>
        <Sparkles size={11} color="#FFFFFF" />
      </div>
      <span>{message}</span>
    </div>
  );
}
