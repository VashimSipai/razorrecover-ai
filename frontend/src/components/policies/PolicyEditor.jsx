import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { recoveryApi } from '../../services/api';

export default function PolicyEditor() {
  const [maxRetries, setMaxRetries] = useState(3);
  const [cooldownHours, setCooldownHours] = useState(24);
  const [hitlThresholdInr, setHitlThresholdInr] = useState(50000);
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);
  const [allowDiscounting, setAllowDiscounting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    recoveryApi.getPolicyConfig().then(cfg => {
      if (cfg) {
        setMaxRetries(cfg.max_retries_per_transaction || 3);
        setCooldownHours(cfg.cooldown_hours || 24);
        setHitlThresholdInr((cfg.high_value_hitl_threshold_paise || 5000000) / 100);
        setAllowWhatsapp(cfg.allow_whatsapp_notifications ?? true);
        setAllowDiscounting(cfg.allow_smart_discounting ?? true);
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      await recoveryApi.updatePolicyConfig({
        max_retries_per_transaction: Number(maxRetries),
        cooldown_hours: Number(cooldownHours),
        max_discount_percent: 5,
        high_value_hitl_threshold_paise: Number(hitlThresholdInr) * 100,
        blocked_error_codes: [
          "BAD_REQUEST_CARD_INVALID",
          "GATEWAY_ERROR_CARD_BLOCKED",
          "BAD_REQUEST_PAYMENT_DECLINED_BY_BANK_DUE_TO_RISK"
        ],
        allow_whatsapp_notifications: allowWhatsapp,
        allow_smart_discounting: allowDiscounting
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update policy:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '32px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Sliders size={20} color="#6366F1" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
            Merchant Safety & Containment Rules
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Deterministic Policy Engine guardrails enforced before any money action
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            Max Retry Attempts Per Transaction
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Hard ceiling preventing customer fatigue and card network penalties.
          </span>
          <input
            type="number"
            min="1"
            max="5"
            value={maxRetries}
            onChange={e => setMaxRetries(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            Cooldown Interval (Hours)
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Minimum wait time between automated retry attempts.
          </span>
          <input
            type="number"
            min="1"
            max="72"
            value={cooldownHours}
            onChange={e => setCooldownHours(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
            Human-in-the-Loop Threshold (INR)
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Transactions exceeding this amount are automatically paused in the Approval Queue.
          </span>
          <input
            type="number"
            min="10000"
            step="5000"
            value={hitlThresholdInr}
            onChange={e => setHitlThresholdInr(e.target.value)}
            className="input-field"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="wa-toggle"
            checked={allowWhatsapp}
            onChange={e => setAllowWhatsapp(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#6366F1' }}
          />
          <label htmlFor="wa-toggle" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Enable Automated WhatsApp Customer Dunning Links
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          {isSaved ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Policy Guardrails Updated
            </span>
          ) : <div />}

          <button type="submit" className="btn-primary" disabled={isSaving}>
            <Save size={16} />
            <span>{isSaving ? 'Updating...' : 'Save Policy Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
