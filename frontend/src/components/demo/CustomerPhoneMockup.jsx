import React, { useState } from 'react';
import { MessageSquare, ArrowRight, CheckCircle2, ShieldCheck, ExternalLink, Zap, Lock, Battery, Wifi } from 'lucide-react';
import { recoveryApi } from '../../services/api';

export default function CustomerPhoneMockup({ notification, customerName, onRecoveryComplete }) {
  const [isPaying, setIsPaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePayViaPhone = async () => {
    if (!notification || isPaying || isCompleted) return;
    setIsPaying(true);
    try {
      if (notification.transaction_id) {
        await recoveryApi.triggerRecovery(notification.transaction_id, {
          force_strategy: 'payment_link'
        });
      }
      setIsCompleted(true);
      if (onRecoveryComplete) onRecoveryComplete();
    } catch (e) {
      console.error("Phone recovery error:", e);
      setIsCompleted(true);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div style={{
      width: '320px',
      height: '580px',
      background: '#0F172A',
      borderRadius: '40px',
      border: '8px solid #334155',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      flexShrink: 0
    }}>
      {/* Phone Speaker Notch & Camera */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '18px',
        background: '#1E293B',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        zIndex: 20
      }}>
        <div style={{ width: '40px', height: '4px', background: '#475569', borderRadius: '2px' }} />
        <div style={{ width: '8px', height: '8px', background: '#38BDF8', borderRadius: '50%', opacity: 0.8 }} />
      </div>

      {/* Top Status Bar */}
      <div style={{
        padding: '14px 20px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.7rem',
        color: '#94A3B8',
        fontWeight: 600,
        zIndex: 10
      }}>
        <span>9:41 AM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={12} />
          <Battery size={14} />
        </div>
      </div>

      {/* Screen Content */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* WhatsApp App Header */}
        <div style={{
          background: '#075E54',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Razorpay Recovery</div>
            <div style={{ fontSize: '0.65rem', color: '#A7F3D0' }}>Verified Business ✓</div>
          </div>
        </div>

        {/* Dynamic WhatsApp Message Bubble */}
        {notification ? (
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            marginTop: '16px',
            animation: 'fadeIn 0.4s ease'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#25D366', fontWeight: 700, marginBottom: '4px' }}>
              ⚡ Payment Recovery Link
            </div>
            
            <p style={{ fontSize: '0.75rem', color: '#F1F5F9', lineHeight: 1.4, marginBottom: '12px' }}>
              {notification.notification_message || `Hi ${customerName || 'Customer'}, your recent payment was interrupted. Tap below to complete with 1-click via UPI or Card:`}
            </p>

            {isCompleted ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10B981',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
                color: '#34D399',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={16} /> Payment Won Back!
              </div>
            ) : (
              <button
                onClick={handlePayViaPhone}
                disabled={isPaying}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                }}
              >
                <span>{isPaying ? 'Processing UPI Debit...' : 'Pay with UPI / 1-Click Link'}</span>
                <ArrowRight size={14} />
              </button>
            )}

            <div style={{ fontSize: '0.6rem', color: '#64748B', textAlign: 'right', marginTop: '6px' }}>
              9:41 AM • Sent via RazorRecover AI
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '30px 10px',
            color: '#64748B',
            fontSize: '0.75rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '14px',
            border: '1px dashed #334155'
          }}>
            <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <div>Waiting for payment drop event...</div>
            <div style={{ fontSize: '0.65rem', marginTop: '4px', color: '#475569' }}>
              Simulate checkout on the left to see live WhatsApp nudge
            </div>
          </div>
        )}

        {/* Virtual Phone Home Indicator */}
        <div style={{
          width: '110px',
          height: '4px',
          background: '#475569',
          borderRadius: '2px',
          margin: '0 auto 4px',
          opacity: 0.6
        }} />
      </div>
    </div>
  );
}
