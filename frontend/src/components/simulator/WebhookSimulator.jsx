import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { recoveryApi } from '../../services/api';

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
        customer_email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
      {/* Simulation Form */}
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
              Simulate real-time `payment.failed` webhooks to test autonomous recovery
            </p>
          </div>
        </div>

        {/* Quick Presets */}
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
                <option value="BAD_REQUEST_PAYMENT_TIMED_OUT">BAD_REQUEST_PAYMENT_TIMED_OUT</option>
                <option value="GATEWAY_ERROR">GATEWAY_ERROR</option>
                <option value="GATEWAY_ERROR_INSUFFICIENT_FUNDS">GATEWAY_ERROR_INSUFFICIENT_FUNDS</option>
                <option value="GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED">GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED</option>
                <option value="AUTHENTICATION_FAILED_3DS">AUTHENTICATION_FAILED_3DS</option>
                <option value="BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER">BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER</option>
                <option value="GATEWAY_ERROR_CARD_BLOCKED">GATEWAY_ERROR_CARD_BLOCKED</option>
                <option value="MANDATE_EXECUTION_FAILED">MANDATE_EXECUTION_FAILED</option>
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
            <span>{isSubmitting ? 'Injecting & Recovering...' : 'Inject Webhook & Execute Agent'}</span>
          </button>
        </form>
      </div>

      {/* Real-time Agent Result Card */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
          Autonomous Execution Stream
        </h3>

        {simulationResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: simulationResult.recovery?.policy_result === 'paused_hitl' 
                ? 'rgba(245, 158, 11, 0.1)' 
                : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${simulationResult.recovery?.policy_result === 'paused_hitl' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: simulationResult.recovery?.policy_result === 'paused_hitl' ? '#FBBF24' : '#34D399' }}>
                  {simulationResult.recovery?.policy_result === 'paused_hitl' ? 'PAUSED FOR HITL APPROVAL' : 'RECOVERY ACTION DISPATCHED'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ID: {simulationResult.transaction_id}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Strategy</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8', textTransform: 'capitalize' }}>
                  {simulationResult.recovery?.strategy?.replace('_', ' ')}
                </div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P(Recovery)</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {Math.round((simulationResult.recovery?.probability || 0.75) * 100)}%
                </div>
              </div>
            </div>

            {simulationResult.recovery?.payment_url && (
              <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Generated Payment Link</div>
                <a
                  href={simulationResult.recovery.payment_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--accent-accent)', wordBreak: 'break-all', fontWeight: 600 }}
                >
                  {simulationResult.recovery.payment_url}
                </a>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              Engine: {simulationResult.recovery?.execution_engine} • Policy Result: {simulationResult.recovery?.policy_result}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', textAlign: 'center' }}>
            <Zap size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.85rem' }}>
              Select a scenario or enter custom parameters and click Inject to witness real-time autonomous reasoning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
