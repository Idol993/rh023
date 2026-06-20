import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/Layout';

import Login from '@/pages/Login';
import Overview from '@/pages/Dashboard/Overview';
import Monitor from '@/pages/Dashboard/Monitor';
import Enterprise from '@/pages/Dashboard/Enterprise';
import JobPublish from '@/pages/Jobs/JobPublish';
import JobList from '@/pages/Jobs/JobList';
import JobMatch from '@/pages/Jobs/JobMatch';
import ContractList from '@/pages/Contracts/ContractList';
import ContractSign from '@/pages/Contracts/ContractSign';
import TaskBoard from '@/pages/Tasks/TaskBoard';
import CheckIn from '@/pages/Tasks/CheckIn';
import TaskSubmit from '@/pages/Tasks/TaskSubmit';
import TaskReview from '@/pages/Tasks/TaskReview';
import SettlementList from '@/pages/Settlements/SettlementList';
import PayoutCenter from '@/pages/Settlements/PayoutCenter';
import InvoiceList from '@/pages/Invoices/InvoiceList';
import Declaration from '@/pages/Tax/Declaration';
import WarningList from '@/pages/Risk/WarningList';
import ReviewPanel from '@/pages/Risk/ReviewPanel';
import DisputeList from '@/pages/Disputes/DisputeList';
import Me from '@/pages/Profile/Me';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />

          <Route path="dashboard">
            <Route path="overview" element={<Overview />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="enterprise" element={<Enterprise />} />
          </Route>

          <Route path="jobs">
            <Route path="publish" element={<JobPublish />} />
            <Route path="list" element={<JobList />} />
            <Route path="match" element={<JobMatch />} />
          </Route>

          <Route path="contract">
            <Route path="list" element={<ContractList />} />
            <Route path="sign/:id" element={<ContractSign />} />
          </Route>

          <Route path="tasks">
            <Route path="board" element={<TaskBoard />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="submit" element={<TaskSubmit />} />
            <Route path="review" element={<TaskReview />} />
          </Route>

          <Route path="settlement">
            <Route path="list" element={<SettlementList />} />
            <Route path="payout" element={<PayoutCenter />} />
          </Route>

          <Route path="invoice">
            <Route path="list" element={<InvoiceList />} />
          </Route>

          <Route path="tax">
            <Route path="declaration" element={<Declaration />} />
          </Route>

          <Route path="risk">
            <Route path="warnings" element={<WarningList />} />
            <Route path="review" element={<ReviewPanel />} />
          </Route>

          <Route path="dispute">
            <Route path="list" element={<DisputeList />} />
          </Route>

          <Route path="profile">
            <Route path="me" element={<Me />} />
          </Route>

          <Route path="*" element={<Overview />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
