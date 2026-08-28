import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, MessageSquare, Clock, CreditCard, Sparkles } from 'lucide-react';
import { recoveryApi } from '../../services/api';
import AgentThinking from '../agent/AgentThinking';

export default function WebhookSimulator({ onSimulationSuccess }) {
  const [customerName, setCustomerName] = useState('Pooja Mehta');
  const [customerPhone, setCustomerPhone] = useState('+919876543210');
  const [amountInr, setAmountInr] = useState(3500);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [errorCode, setErrorCode] = useState('BAD_REQUEST_PAYMENT_TIMED_OUT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const presetScenarios = [
    {
      label: 'Transient UPI Timeout (₹2,500)',
      name: 'Rahul Sharma',
      amount: 2500,
      method: 'upi',
      code: 'BAD_REQUEST_PAYMENT_TIMED_OUT'
    },
    {
      label: 'Insufficient Funds Balance Decline (₹4,200)',
      name: 'Aditi Nair',
      amount: 4200,
      method: 'card',
      code: 'GATEWAY_ERROR_INSUFFICIENT_FUNDS'
    },
    {
      label: 'High-Value HITL Authorization (₹75,000)',
      name: 'Vikram Singhania',
      amount: 75000,
      method: 'card',
      code: 'GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED'
    },
    {
      label: 'Hard Decline / Blocked Card (₹1,500)',
      name: 'Deepak Patel',
      amount: 1500,
      method: 'card',
      code: 'GATEWAY_ERROR_CARD_BLOCKED'
    }
  ];

  const applyPreset = (sc) => {
    setCustomerName(sc.name);
    setAmountInr(sc.amount);
    setPaymentMethod(sc.method);
    setErrorCode(sc.code);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await recoveryApi.simulatePaymentFailure({
        customer_name: customerName,
        customer_email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.in`,
        customer_phone: customerPhone,
        amount_inr: Number(amountInr),
        payment_method: paymentMethod,
        error_code: errorCode,
        auto_recover: true
      });
      setSimulationResult(data);
      if (onSimulationSuccess) onSimulationSuccess();
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr', gap: '28px' }}>
      {/* Simulation Input Form */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Terminal size={20} color="#6366F1" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Razorpay Webhook Event Injector
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Simulate live `payment.failed` webhooks to test autonomous recovery
            </p>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            Quick Demo Scenarios
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(sc)}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Amount (INR)
              </label>
              <input
                type="number"
                value={amountInr}
                onChange={e => setAmountInr(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="upi">UPI (Instant VPA)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="mandate">UPI Autopay / e-NACH</option>
                <option value="netbanking">Netbanking</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Razorpay Error Code
              </label>
              <select
                value={errorCode}
                onChange={e => setErrorCode(e.target.value)}
                className="input-field"
              >
                <option value="BAD_REQUEST_PAYMENT_TIMED_OUT">BAD_REQUEST_PAYMENT_TIMED_OUT (Transient)</option>
                <option value="GATEWAY_ERROR">GATEWAY_ERROR (Transient)</option>
                <option value="GATEWAY_ERROR_INSUFFICIENT_FUNDS">GATEWAY_ERROR_INSUFFICIENT_FUNDS (Soft Decline)</option>
                <option value="GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED">GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED (Soft Decline)</option>
                <option value="AUTHENTICATION_FAILED_3DS">AUTHENTICATION_FAILED_3DS (Auth Failure)</option>
                <option value="BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER">BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER</option>
                <option value="GATEWAY_ERROR_CARD_BLOCKED">GATEWAY_ERROR_CARD_BLOCKED (Hard Decline)</option>
                <option value="MANDATE_EXECUTION_FAILED">MANDATE_EXECUTION_FAILED (Mandate)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '8px', padding: '12px' }}
            disabled={isSubmitting}
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Simulating Failure & Executing AI Engine...' : 'Inject Webhook & Execute AI Recovery'}</span>
          </button>

          {isSubmitting && (
            <div style={{ marginTop: '14px' }}>
              <AgentThinking message="Supervisor Agent is diagnosing failure & verifying Policy Gate..." />
            </div>
          )}
        </form>
      </div>

      {/* Real-time AI Autonomous Stream */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
            Autonomous Recovery Stream
          </h3>
          <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', fontWeight: 600 }}>
            LangGraph Multi-Agent
          </span>
        </div>

        {simulationResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Status Header Pill */}
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: simulationResult.recovery?.policy_result === 'paused_hitl' 
                ? 'rgba(245, 158, 11, 0.12)' 
                : simulationResult.recovery?.policy_result === 'blocked'
                ? 'rgba(244, 63, 94, 0.12)'
                : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${
                simulationResult.recovery?.policy_result === 'paused_hitl' 
                  ? 'rgba(245, 158, 11, 0.3)' 
                  : simulationResult.recovery?.policy_result === 'blocked'
                  ? 'rgba(244, 63, 94, 0.3)'
                  : 'rgba(16, 185, 129, 0.3)'
              }`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: simulationResult.recovery?.policy_result === 'paused_hitl' 
                    ? '#FBBF24' 
                    : simulationResult.recovery?.policy_result === 'blocked'
                    ? '#FB7185'
                    : '#34D399'
                }}>
                  {simulationResult.recovery?.policy_result === 'paused_hitl' 
                    ? '⏸️ PAUSED FOR HUMAN APPROVAL' 
                    : simulationResult.recovery?.policy_result === 'blocked'
                    ? '🚫 INTERVENTION BLOCKED BY POLICY'
                    : '⚡ RECOVERY ACTION DISPATCHED'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ID: {simulationResult.transaction_id}
                </span>
              </div>
            </div>

            {/* Strategy & Scoring Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Proposed Strategy</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', textTransform: 'capitalize', marginTop: '2px' }}>
                  {simulationResult.recovery?.strategy?.replace('_', ' ')}
                </div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recovery Likelihood</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px' }}>
                  {Math.round((simulationResult.recovery?.probability || 0.75) * 100)}% P(Recovery)
                </div>
              </div>
            </div>

            {/* AI Reasoning Box */}
            {simulationResult.recovery?.agent_reasoning && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#A5B4FC', fontWeight: 600, marginBottom: '4px' }}>
                  <Sparkles size={14} /> AI Diagnostic Reasoning
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {simulationResult.recovery.agent_reasoning}
                </p>
              </div>
            )}

            {/* Generated Action Details (Razorpay Resource) */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#F8FAFC', fontWeight: 600, marginBottom: '6px' }}>
                <CreditCard size={14} color="#38BDF8" /> Generated Razorpay Resource
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Resource Type: <strong style={{ color: '#FFFFFF' }}>{simulationResult.recovery?.razorpay_resource_type || 'payment_link'}</strong></span>
                <span>Resource ID: <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{simulationResult.recovery?.razorpay_resource_id || 'plink_rec_test'}</strong></span>
              </div>
            </div>

            {/* Live WhatsApp Customer Nudge Simulator */}
            {simulationResult.recovery?.notification_message && (
              <div style={{
                background: 'rgba(18, 140, 126, 0.1)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(37, 211, 102, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageSquare size={16} color="#25D366" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#25D366' }}>
                    Customer WhatsApp Nudge (Dispatched)
                  </span>
                </div>
                <div style={{
                  background: 'rgba(7, 9, 14, 0.6)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#FFFFFF',
                  lineHeight: 1.5,
                  borderLeft: '3px solid #25D366'
                }}>
                  {simulationResult.recovery.notification_message}
                </div>
              </div>
            )}

            {/* Engine Telemetry */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
              <span>Engine: <strong>{simulationResult.recovery?.execution_engine}</strong></span>
              <span>Policy Status: <strong style={{ color: 'var(--accent-emerald)' }}>{simulationResult.recovery?.policy_result}</strong></span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            <Zap size={36} style={{ marginBottom: '12px', opacity: 0.3 }} color="#6366F1" />
            <p style={{ fontSize: '0.85rem', maxWidth: '320px' }}>
              Select a scenario on the left and click <strong>Inject Webhook</strong> to watch real-time AI reasoning, Razorpay resource creation, and WhatsApp nudges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
