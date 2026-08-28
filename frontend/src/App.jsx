import Store from './pages/Store';
import Dashboard from './pages/Dashboard';
import Approvals from './pages/Approvals';
import Transactions from './pages/Transactions';
import Benchmark from './pages/Benchmark';
import Simulator from './pages/Simulator';
import Settings from './pages/Settings';
import { recoveryApi } from './services/api';

export default function App() {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const items = await recoveryApi.getPendingApprovals();
      setPendingApprovalsCount(items.length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar pendingCount={pendingApprovalsCount} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/approvals" element={<Approvals onUpdatePending={setPendingApprovalsCount} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}
