import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Header from '../components/Header';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { email, password, firstName, lastName });
      login(res.data.user, res.data.token, res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        window.location.href = '/login?sessionExpired=true';
        return;
      }
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-gray-50" role="main" aria-label="Register main content">
        <section className="w-full max-w-md p-4 sm:p-8 bg-white rounded-2xl shadow-md" aria-labelledby="register-title">
          <h1 id="register-title" className="text-2xl font-semibold text-indigo-600 mb-4">Create Inkswift Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Register form">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="register-firstname">First Name</label>
              <input
                id="register-firstname"
                type="text"
                className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                autoFocus
                aria-label="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="register-lastname">Last Name</label>
              <input
                id="register-lastname"
                type="text"
                className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                aria-label="Last Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Email"
                required
                aria-label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Password"
                required
                aria-label="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="ml-2 text-xs text-sky-500 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {error && <div className="text-rose-500 text-sm" role="alert">{error}</div>}
            <motion.button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              disabled={loading}
              aria-label="Register"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Registering...' : 'Register'}
            </motion.button>
          </form>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-sky-500 hover:underline">Login</a>
          </div>
        </section>
      </main>
    </>
  );
};

export default RegisterPage; 