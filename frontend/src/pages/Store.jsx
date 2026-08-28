import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { ShoppingBag, CreditCard, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, Sparkles, MessageSquare, Flame } from 'lucide-react';
import { recoveryApi } from '../services/api';
import CustomerPhoneMockup from '../components/demo/CustomerPhoneMockup';

export default function Store() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerName, setCustomerName] = useState('Pooja Mehta');
  const [customerEmail, setCustomerEmail] = useState('pooja.mehta@example.in');
  const [customerPhone, setCustomerPhone] = useState('+919876543210');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveRecoveryResult, setLiveRecoveryResult] = useState(null);

  useEffect(() => {
    // Load official Razorpay Checkout SDK script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const products = [
    {
      id: 'prod_course',
      name: 'AI Engineering Pro Track',
      description: 'Production multi-agent state machines, guardrails & LangGraph certification.',
      amount_inr: 2499,
      badge: 'Popular',
      badgeColor: '#6366F1'
    },
    {
      id: 'prod_saas',
      name: 'FinOps Cloud Infrastructure',
      description: 'Autonomous payment failover & real-time webhook observability cluster.',
      amount_inr: 4500,
      badge: 'Bestseller',
      badgeColor: '#10B981'
    },
    {
      id: 'prod_enterprise',
      name: 'Enterprise Scale License',
      description: 'Dedicated high-throughput recovery cluster with human compliance gateway.',
      amount_inr: 75000,
      badge: 'HITL Trigger (> ₹50k)',
      badgeColor: '#F59E0B'
    }
  ];

  // 1-Click Instant Failure Simulator (Guaranteed to work 100% offline or online)
  const handleSimulateInstantFailure = async (product, errorCode = "GATEWAY_ERROR_INSUFFICIENT_FUNDS") => {
    setSelectedProduct(product);
    setIsProcessing(true);
    setLiveRecoveryResult(null);

    try {
      const failureData = await recoveryApi.reportStorePaymentFailure({
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_order_id: `order_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        amount_inr: product.amount_inr,
        payment_method: product.amount_inr >= 50000 ? "card" : "upi",
        error_code: errorCode,
        error_source: "gateway",
        error_reason: "Payment failure intercepted during checkout"
      });

      setLiveRecoveryResult(failureData);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartCheckout = async (product) => {
    setSelectedProduct(product);
    setIsProcessing(true);
    setLiveRecoveryResult(null);

    try {
      const orderData = await recoveryApi.createStoreOrder({
        product_name: product.name,
        amount_inr: product.amount_inr,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      });

      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency,
        name: "RazorRecover Demo Store",
        description: product.name,
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: "#6366F1"
        },
        handler: function (response) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          setIsProcessing(false);
        },
        modal: {
          ondismiss: async function () {
            await handleSimulateInstantFailure(product, "BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER");
          }
        }
      };

      if (window.Razorpay) {
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async function (response) {
            await handleSimulateInstantFailure(product, response.error.code || "BAD_REQUEST_PAYMENT_TIMED_OUT");
          });
          rzp.open();
        } catch (e) {
          console.warn("Razorpay open failed, falling back to direct failure simulation:", e);
          await handleSimulateInstantFailure(product, "GATEWAY_ERROR_INSUFFICIENT_FUNDS");
        }
      } else {
        await handleSimulateInstantFailure(product, "GATEWAY_ERROR_INSUFFICIENT_FUNDS");
      }
    } catch (err) {
      console.error("Checkout initiation error:", err);
      await handleSimulateInstantFailure(product, "GATEWAY_ERROR_INSUFFICIENT_FUNDS");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-content">
      <Header
        title="Live Merchant Store & Customer Phone Experience"
        subtitle="Trigger a payment failure and watch the customer's phone receive the WhatsApp recovery nudge live"
      />

      <div className="page-wrapper">
        {/* Customer Prefill Configuration Card */}
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
              👤 Customer Session (Prefilled on Checkout)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {customerName} • {customerEmail} • {customerPhone}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="input-field"
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.75rem' }}
            />
            <input
              type="text"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone Number"
              className="input-field"
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.75rem' }}
            />
          </div>
        </div>

        {/* Store Products & Virtual Phone Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 340px', gap: '28px', alignItems: 'flex-start' }}>
          {/* Left Column: Products & Telemetry */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '24px' }}>
              {products.map((prod) => (
                <div key={prod.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: `${prod.badgeColor}22`, color: prod.badgeColor, border: `1px solid ${prod.badgeColor}44` }}>
                        {prod.badge}
                      </span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                        ₹{prod.amount_inr.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Primary Trigger Button */}
                    <button
                      onClick={() => handleSimulateInstantFailure(prod, prod.amount_inr >= 50000 ? "GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED" : "GATEWAY_ERROR_INSUFFICIENT_FUNDS")}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.8rem' }}
                      disabled={isProcessing}
                    >
                      <Zap size={14} />
                      <span>{isProcessing && selectedProduct?.id === prod.id ? 'Executing AI Engine...' : '⚡ Trigger Payment Failure & Nudge'}</span>
                    </button>

                    {/* Secondary Razorpay Modal Button */}
                    <button
                      onClick={() => handleStartCheckout(prod)}
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.75rem' }}
                      disabled={isProcessing}
                    >
                      <CreditCard size={12} />
                      <span>Open Razorpay Checkout Popup</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Autonomous Recovery Diagnostic Telemetry */}
            {liveRecoveryResult && (
              <div className="glass-card glass-card-glow" style={{ padding: '24px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles size={18} color="#6366F1" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    ⚡ Payment Drop Intercepted & Dispatched to Customer Phone!
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Policy Gate</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: liveRecoveryResult.policy_result === 'paused_hitl' ? '#FBBF24' : 'var(--accent-emerald)', marginTop: '2px' }}>
                      {liveRecoveryResult.policy_result.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI Strategy</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8', textTransform: 'capitalize', marginTop: '2px' }}>
                      {liveRecoveryResult.strategy?.replace('_', ' ')}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>P(Recovery)</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px' }}>
                      {Math.round((liveRecoveryResult.recovery_probability || 0.75) * 100)}% Win Prob
                    </div>
                  </div>
                </div>

                {liveRecoveryResult.policy_result === 'paused_hitl' && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.75rem', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span>This high-value order (≥ ₹50,000) was paused by LangGraph. Go to <strong>HITL Approvals</strong> in the sidebar to review and approve!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Virtual Customer Smartphone Mockup */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📱 Customer's Phone
              </div>
              <span className="badge badge-recovered" style={{ fontSize: '0.65rem' }}>
                WhatsApp Live
              </span>
            </div>

            <CustomerPhoneMockup
              notification={liveRecoveryResult}
              customerName={customerName}
              onRecoveryComplete={() => {
                if (liveRecoveryResult) {
                  setLiveRecoveryResult({
                    ...liveRecoveryResult,
                    status: 'recovered'
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
