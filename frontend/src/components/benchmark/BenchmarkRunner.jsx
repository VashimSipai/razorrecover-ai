import React, { useState } from 'react';
import { Play, CheckCircle2, BarChart2, ShieldCheck, Activity, Download, Zap, Sparkles } from 'lucide-react';
import { recoveryApi } from '../../services/api';

export default function BenchmarkRunner({ initialResults }) {
  const [results, setResults] = useState(initialResults);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const data = await recoveryApi.runBenchmark(2500);
      setResults(data);
    } catch (e) {
      console.error("Benchmark failed:", e);
    } finally {
      setIsRunning(false);
    }
  };

  const metrics = results?.metrics;

  return (
    <div>
      {/* Benchmark Control Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-transient" style={{ fontSize: '0.75rem' }}>
                Empirical Evaluation Harness
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Batch Size: 2,500 Transactions • Runtime: 0.05s
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              2,500-Transaction Recovery Benchmark
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '6px', lineHeight: 1.5 }}>
              Executes the full multi-agent state machine and policy containment engine across 2,500 realistic Indian payment failures, measuring precision, recovery rate, and net ₹ won back.
            </p>
          </div>

          <button
            onClick={handleRun}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
            disabled={isRunning}
          >
            <Play size={18} />
            <span>{isRunning ? 'Evaluating 2,500 Records...' : 'Execute 2,500 Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Revenue at Risk</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '6px' }}>
                ₹{(metrics.total_revenue_at_risk_inr || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>2,500 failed orders</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Revenue Won Back</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '6px' }}>
                ₹{(metrics.total_revenue_recovered_inr || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Actual recovered value</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Recovery Win Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8', marginTop: '6px' }}>
                {metrics.net_recovery_rate_percent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Across all error types</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Autonomous ROI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '6px' }}>
                {metrics.net_roi_multiple}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Recovered ₹ / cost multiple</div>
            </div>
          </div>

          {/* Strategy Breakdown Table */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
              🎯 Strategy Win Rates Across 2,500 Interventions
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Intervention Strategy</th>
                    <th>Attempts</th>
                    <th>Successful Recoveries</th>
                    <th>Strategy Win Rate</th>
                    <th>Net Recovered Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.strategy_breakdown?.map((st, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>
                        {st.strategy.replace('_', ' ')}
                      </td>
                      <td>{st.attempts}</td>
                      <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{st.successful}</td>
                      <td>
                        <span className="badge badge-recovered">
                          {st.success_rate_percent}%
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                        ₹{(st.recovered_amount_inr || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Category Breakdown Table */}
          {results.category_breakdown && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
                🧬 Taxonomy Cohort Breakdown (Indian Banking Dynamics)
              </h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Failure Category</th>
                      <th>Total Volume</th>
                      <th>Revenue at Risk</th>
                      <th>Recovered Orders</th>
                      <th>Category Win Rate</th>
                      <th>Net Won Back</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.category_breakdown.map((cat, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#FFFFFF', textTransform: 'capitalize' }}>
                          {cat.category.replace('_', ' ')}
                        </td>
                        <td>{cat.count} ({Math.round((cat.count / 2500) * 100)}%)</td>
                        <td style={{ color: '#FB7185' }}>
                          ₹{(cat.amount_inr || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          {cat.recovered_count}
                        </td>
                        <td>
                          <span className={`badge badge-${cat.recovery_rate_percent >= 50 ? 'recovered' : cat.recovery_rate_percent > 20 ? 'recovering' : 'failed'}`}>
                            {cat.recovery_rate_percent}%
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          ₹{(cat.recovered_amount_inr || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
