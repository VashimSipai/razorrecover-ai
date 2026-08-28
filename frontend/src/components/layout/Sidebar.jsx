import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Receipt, 
  BarChart3, 
  Terminal, 
  Sliders, 
  FileText,
  Zap
} from 'lucide-react';

export default function Sidebar({ pendingCount = 0 }) {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/approvals', label: 'HITL Approvals', icon: ShieldCheck, badge: pendingCount },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/benchmark', label: '2.5k Benchmark', icon: BarChart3 },
    { to: '/simulator', label: 'Failure Simulator', icon: Terminal },
    { to: '/settings', label: 'Policy Guardrails', icon: Sliders },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '24px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-primary)'
        }}>
          <Zap size={20} color="#FFFFFF" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RazorRecover
          </h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-accent)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Autonomous Engine
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '20px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span style={{
                  background: 'var(--accent-amber)',
                  color: '#000000',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Track & System Status Badge */}
      <div style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(12, 35, 64, 0.4)',
        border: '1px solid rgba(51, 149, 255, 0.2)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>Track 03 • AI Recovery</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          LangGraph • Gemini 2.5 • Test Mode
        </div>
      </div>
    </aside>
  );
}
