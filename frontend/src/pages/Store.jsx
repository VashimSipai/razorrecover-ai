import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { ShoppingBag, CreditCard, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { recoveryApi } from '../services/api';
import CustomerPhoneMockup from '../components/demo/CustomerPhoneMockup';

export default function Store() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerName, setCustomerName] = useState('Ananya Iyer');
  const [customerEmail, setCustomerEmail] = useState('ananya.iyer@example.in');
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
      document.body.removeChild(script);
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

  const handleStartCheckout = async (product) => {
    setSelectedProduct(product);
    setIsProcessing(true);
    setLiveRecoveryResult(null);

    try {
      // 1. Create real order on backend
      const orderData = await recoveryApi.createStoreOrder({
        product_name: product.name,
        amount_inr: product.amount_inr,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      });

      // 2. Open Razorpay Standard Checkout modal
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
            // Intercept checkout dismissal / failure simulation
            const failureData = await recoveryApi.reportStorePaymentFailure({
              razorpay_payment_id: `pay_chk_${Date.now()}`,
              razorpay_order_id: orderData.order_id,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              amount_inr: product.amount_inr,
              payment_method: "upi",
              error_code: "BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER",
              error_source: "customer",
              error_reason: "Customer dropped off at OTP / 3DS authorization stage"
            });
            setLiveRecoveryResult(failureData);
            setIsProcessing(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          const failureData = await recoveryApi.reportStorePaymentFailure({
            razorpay_payment_id: response.error.metadata.payment_id || `pay_chk_${Date.now()}`,
            razorpay_order_id: orderData.order_id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            amount_inr: product.amount_inr,
            payment_method: response.error.source === 'gateway' ? 'card' : 'upi',
            error_code: response.error.code || 'BAD_REQUEST_PAYMENT_TIMED_OUT',
            error_source: response.error.source || 'gateway',
            error_reason: response.error.description || 'Payment failed during checkout'
          });
          setLiveRecoveryResult(failureData);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulation
        const failureData = await recoveryApi.reportStorePaymentFailure({
          razorpay_payment_id: `pay_chk_${Date.now()}`,
          razorpay_order_id: orderData.order_id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          amount_inr: product.amount_inr,
          payment_method: "card",
          error_code: "GATEWAY_ERROR_INSUFFICIENT_FUNDS",
          error_source: "customer",
          error_reason: "Card issuer declined transaction due to insufficient balance"
        });
        setLiveRecoveryResult(failureData);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-content">
      <Header
        title="Live Merchant Store & Customer Phone Experience"
        subtitle="Trigger a payment failure in Razorpay Checkout and watch the customer's phone receive the WhatsApp recovery nudge live"
      />

      <div className="page-wrapper">
        {/* Customer Prefill Configuration Card */}
        <div className="glass-card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
              👤 Customer Session (Prefilled into Razorpay Checkout)
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
              placeholder="Name"
              className="input-field"
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.75rem' }}
            />
            <input
              type="text"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone"
              className="input-field"
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.75rem' }}
            />
          </div>
        </div>

        {/* Store Products & Virtual Phone Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
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
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
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

                  <button
                    onClick={() => handleStartCheckout(prod)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.8rem' }}
                    disabled={isProcessing}
                  >
                    <CreditCard size={14} />
                    <span>{isProcessing && selectedProduct?.id === prod.id ? 'Opening Modal...' : 'Pay with Razorpay Modal'}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Live Autonomous Recovery Card */}
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
              </div>
            )}
          </div>

          {/* Right Column: Virtual Customer Phone Device */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📱 Customer's Smartphone
            </div>
            <CustomerPhoneMockup
              notification={liveRecoveryResult}
              customerName={customerName}
              onRecoveryComplete={() => {
                // Trigger live status update
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
