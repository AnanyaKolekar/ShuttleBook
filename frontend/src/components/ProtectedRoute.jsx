import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="card">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;

