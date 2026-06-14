import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={styles.btn} type="submit">Sign in</button>
        </form>
        <p style={styles.link}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', padding: 40, borderRadius: 12, width: 360,
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)' },
  title: { marginBottom: 24, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  input: { width: '100%', padding: '12px 14px', marginBottom: 14,
           border: '1px solid #ddd', borderRadius: 8, fontSize: 14,
           boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: 13, background: '#4f46e5', color: '#fff',
         border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#dc2626', marginBottom: 14, fontSize: 13 },
  link: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' }
};
