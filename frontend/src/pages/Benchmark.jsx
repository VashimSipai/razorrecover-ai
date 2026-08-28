import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import BenchmarkRunner from '../components/benchmark/BenchmarkRunner';
import { recoveryApi } from '../services/api';

export default function Benchmark() {
  const [results, setResults] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBenchmark = async () => {
    setIsRefreshing(true);
    try {
      const data = await recoveryApi.getBenchmarkResults();
      setResults(data);
    } catch (err) {
      console.error("Failed to load benchmark:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBenchmark();
  }, []);

  return (
    <div className="main-content">
      <Header
        title="2,500-Transaction Recovery Benchmark"
        subtitle="Empirical evaluation measuring precision, recall, net ₹ recovered, and strategy win rates"
        onRefresh={loadBenchmark}
        isRefreshing={isRefreshing}
      />

      <div className="page-wrapper">
        <BenchmarkRunner initialResults={results} />
      </div>
    </div>
  );
}
