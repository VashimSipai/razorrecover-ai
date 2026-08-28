import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function RevenueChart({ data }) {
  // Default realistic 7-day time series if data is loading or empty
  const defaultData = [
    { day: 'Mon', revenue_at_risk: 420000, revenue_recovered: 235000 },
    { day: 'Tue', revenue_at_risk: 510000, revenue_recovered: 298000 },
    { day: 'Wed', revenue_at_risk: 380000, revenue_recovered: 215000 },
    { day: 'Thu', revenue_at_risk: 620000, revenue_recovered: 360000 },
    { day: 'Fri', revenue_at_risk: 740000, revenue_recovered: 412000 },
    { day: 'Sat', revenue_at_risk: 890000, revenue_recovered: 520000 },
    { day: 'Sun', revenue_at_risk: 650000, revenue_recovered: 375000 },
  ];

  const chartData = (data && data.length > 0) ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(13, 17, 26, 0.95)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            {label} Recovery Velocity
          </div>
          <div style={{ fontSize: '0.72rem', color: '#FB7185', marginBottom: '2px' }}>
            At Risk: ₹{((payload[0]?.value || 0)).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
            Recovered: ₹{((payload[1]?.value || 0)).toLocaleString('en-IN')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-recovered" style={{ fontSize: '0.65rem' }}>
              <TrendingUp size={12} /> Velocity Trend
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              7-Day Trajectory
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            Revenue at Risk vs. Won Back
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F43F5E' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Revenue at Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Won Back (Recovered)</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
            <YAxis 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false}
              tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue_at_risk" 
              stroke="#F43F5E" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRisk)" 
            />
            <Area 
              type="monotone" 
              dataKey="revenue_recovered" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRecovered)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
