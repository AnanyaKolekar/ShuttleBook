import { Routes, Route, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user } = useAuth();
  return (
    <div className="page">
      <Header />
      <div className="layout">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<BookingPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

