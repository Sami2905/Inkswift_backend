import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <section className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md" aria-labelledby="reset-title">
          <h1 id="reset-title" className="text-2xl font-semibold text-indigo-600 mb-4">Reset Password</h1>
          {success ? (
            <div className="text-green-600 font-medium">Password reset! Redirecting to login...</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                id="reset-password"
                name="newPassword"
                type="password"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                aria-label="New password"
              />
              <motion.button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={loading}
                aria-label="Reset password"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >{loading ? 'Resetting...' : 'Reset Password'}</motion.button>
              {error && <div className="text-rose-500 text-sm" role="alert">{error}</div>}
            </form>
          )}
        </section>
      </main>
    </>
  );
};

export default ResetPasswordPage; 