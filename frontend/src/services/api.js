import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const recoveryApi = {
  // Dashboard & Funnel
  getDashboardKPIs: () => api.get('/analytics/dashboard').then(res => res.data),
  getFunnelStages: () => api.get('/analytics/funnel').then(res => res.data),
  
  // Transactions
  getTransactions: (params = {}) => api.get('/transactions', { params }).then(res => res.data),
  getTransactionDetail: (id) => api.get(`/transactions/${id}`).then(res => res.data),
  
  // Autonomous Recovery
  triggerRecovery: (txnId, payload = {}) => api.post(`/recover/${txnId}`, payload).then(res => res.data),
  triggerBatchRecovery: (limit = 25) => api.post('/recover/batch/process', null, { params: { limit } }).then(res => res.data),
  
  // Human-in-the-Loop Approvals
  getPendingApprovals: () => api.get('/approvals').then(res => res.data),
  submitApprovalDecision: (queueId, payload) => api.post(`/approvals/${queueId}/decision`, payload).then(res => res.data),
  
  // Benchmark
  runBenchmark: (count = 2500) => api.post('/benchmark/run', null, { params: { count } }).then(res => res.data),
  getBenchmarkResults: () => api.get('/benchmark/results').then(res => res.data),
  
  // Simulator
  simulatePaymentFailure: (payload) => api.post('/simulate/failure', payload).then(res => res.data),
  
  // Store Demo
  createStoreOrder: (payload) => api.post('/store/order', payload).then(res => res.data),
  reportStorePaymentFailure: (payload) => api.post('/store/payment-failure', payload).then(res => res.data),

  // Policies
  getPolicyConfig: () => api.get('/policies').then(res => res.data),
  updatePolicyConfig: (payload) => api.put('/policies', payload).then(res => res.data),
  
  // Compliance Export URL
  getComplianceExportUrl: (format = 'csv') => `${API_BASE}/analytics/compliance/export?format=${format}`
};

export default api;
