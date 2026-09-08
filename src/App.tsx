import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login from './pages/Login';
import Households from './pages/Households';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';

import AppShell from './components/shell/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/households" element={<Households />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/households" element={<Households />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
