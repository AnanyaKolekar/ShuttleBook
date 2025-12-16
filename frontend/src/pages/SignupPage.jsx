import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', admin: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.admin ? 'admin' : 'user',
      });
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
        <h2>Create account</h2>
        <p>Book courts, gear, and coaches with live pricing.</p>
        <form onSubmit={submit} className="form">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
            Register as Admin
          </label>
          {error && <div className="badge danger">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Create account'}
          </button>
        </form>
        <div className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

