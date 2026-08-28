import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Bot, BarChart3, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GuidedTourModal({ onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "1. The Burning Problem in Indian Payments",
      badge: "Market Context",
      badgeColor: "#F43F5E",
      description: "Indian merchants lose 15% to 30% of sales from involuntary payment failures (UPI 8 PM peak rush timeouts, 3DS OTP drop-offs, daily limits). Blind retries cause customer harassment and NPCI penalty fees. We built RazorRecover AI to autonomously recapture lost revenue.",
      highlight: "₹3.41 Cr Revenue at Risk Analyzed in our 2,500-Transaction Evaluation"
    },
    {
      title: "2. The Core Safety Model: LLM ≠ Money Mover",
      badge: "Architecture Invariant",
      badgeColor: "#6366F1",
      description: "We use a 5-node LangGraph Multi-Agent State Machine (Classifier ➔ Scorer ➔ Strategist ➔ Policy Gate ➔ Dispatcher). The AI reasons and scores probability, but a 100% Deterministic Policy Gate validates limits, stopping rules, and anti-fatigue cooldowns before any money action.",
      highlight: "Deterministic Containment guarantees zero hallucinated amounts or unauthorized retries."
    },
    {
      title: "3. Live Checkout & WhatsApp Customer Nudge",
      badge: "Live Product Experience",
      badgeColor: "#10B981",
      description: "Experience our Live Checkout Store (/store). Triggering a failure pops up the official Razorpay Checkout modal, catches the drop, and dispatches a personalized 1-click WhatsApp recovery link to the customer's phone.",
      highlight: "Try clicking 'Pay on Virtual Phone' in the Store to watch the payment get won back live!"
    },
    {
      title: "4. High-Value Human-in-the-Loop Gateway",
      badge: "Governance & Safety",
      badgeColor: "#F59E0B",
      description: "When a transaction amount exceeds ₹50,000, LangGraph triggers an interrupt() pause. The transaction enters the Approval Queue (/approvals) where human operators can Approve, Modify, or Reject before execution.",
      highlight: "137 High-Value Orders successfully routed to human operators with zero double-charges."
    },
    {
      title: "5. Empirical Proof: 2,500-Transaction Benchmark",
      badge: "Empirical Results",
      badgeColor: "#38BDF8",
      description: "We don't hypothesize recovery — we prove it across 2,500 realistic Indian payment failures. Over ₹1.78 Crore won back (52.51% net recovery rate) with an empirical 28,628x Net ROI multiple over communication costs.",
      highlight: "1-Click Download Compliance Audit CSV available in the top navigation header."
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
      navigate('/store');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', background: `${slide.badgeColor}22`, color: slide.badgeColor, border: `1px solid ${slide.badgeColor}44` }}>
              {slide.badge}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {currentSlide + 1} of {slides.length}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Slide Content */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {slide.title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {slide.description}
          </p>

          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <SparklesIcon size={18} color="#6366F1" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5B4FC' }}>
              {slide.highlight}
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: idx === currentSlide ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentSlide ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handlePrev}
            className="btn-secondary"
            disabled={currentSlide === 0}
            style={{ opacity: currentSlide === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <button onClick={handleNext} className="btn-primary">
            <span>{currentSlide === slides.length - 1 ? 'Go to Live Checkout Store' : 'Next Step'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon({ size = 18, color = "#6366F1" }) {
  return <Zap size={size} color={color} style={{ flexShrink: 0 }} />;
}
