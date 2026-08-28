import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { ShoppingBag, CreditCard, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { recoveryApi } from '../services/api';

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
        // Fallback if Razorpay SDK script isn't loaded
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
      console.error("Checkout initiation error:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-content">
      <Header
        title="Live Merchant Store & Real Checkout Experience"
        subtitle="Test real Razorpay Checkout modal popups, trigger live failures, and watch autonomous AI recovery in real time"
      />

      <div className="page-wrapper">
        {/* Customer Prefill Configuration Card */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
              placeholder="Name"
              className="input-field"
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
            />
            <input
              type="text"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone"
              className="input-field"
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          {products.map((prod) => (
            <div key={prod.id} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', background: `${prod.badgeColor}22`, color: prod.badgeColor, border: `1px solid ${prod.badgeColor}44` }}>
                    {prod.badge}
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                    ₹{prod.amount_inr.toLocaleString('en-IN')}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {prod.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  {prod.description}
                </p>
              </div>

              <button
                onClick={() => handleStartCheckout(prod)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                disabled={isProcessing}
              >
                <CreditCard size={16} />
                <span>{isProcessing && selectedProduct?.id === prod.id ? 'Opening Razorpay Modal...' : 'Pay with Razorpay Modal'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Live Autonomous Recovery Card Triggered from Checkout */}
        {liveRecoveryResult && (
          <div className="glass-card glass-card-glow" style={{ padding: '32px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366F1' }}>
                <Sparkles size={20} color="#6366F1" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  ⚡ Live Checkout Payment Failure Intercepted & Recovered!
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  The Razorpay Checkout modal triggered a failure event. LangGraph immediately took action:
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Policy Gate Decision</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: liveRecoveryResult.policy_result === 'paused_hitl' ? '#FBBF24' : 'var(--accent-emerald)', marginTop: '4px' }}>
                  {liveRecoveryResult.policy_result.toUpperCase()}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Intervention Strategy</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', textTransform: 'capitalize', marginTop: '4px' }}>
                  {liveRecoveryResult.strategy?.replace('_', ' ')}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P(Recovery) Likelihood</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {Math.round((liveRecoveryResult.recovery_probability || 0.75) * 100)}% Win Probability
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Generated Resource</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {liveRecoveryResult.razorpay_resource_id}
                </div>
              </div>
            </div>

            {/* Live WhatsApp Bubble */}
            {liveRecoveryResult.notification_message && (
              <div style={{ background: 'rgba(18, 140, 126, 0.12)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageSquare size={16} color="#25D366" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#25D366' }}>
                    Automated Customer WhatsApp Nudge Dispatched
                  </span>
                </div>
                <div style={{ background: 'rgba(7, 9, 14, 0.7)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#FFFFFF', lineHeight: 1.5, borderLeft: '3px solid #25D366' }}>
                  {liveRecoveryResult.notification_message}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
