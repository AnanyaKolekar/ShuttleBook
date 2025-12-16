import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', admin: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const user = await login(form);
      if (form.admin && user.role !== 'admin') {
        setError('Admin access denied');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Login to book your next game.</p>
        <form onSubmit={submit} className="form">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.admin}
              onChange={(e) => setForm({ ...form, admin: e.target.checked })}
            />
            Login as Admin
          </label>
          {error && <div className="badge danger">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="muted">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

