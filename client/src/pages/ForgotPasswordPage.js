import React, { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <section className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md" aria-labelledby="forgot-title">
          <h1 id="forgot-title" className="text-2xl font-semibold text-indigo-600 mb-4">Forgot Password</h1>
          {success ? (
            <div className="text-green-600 font-medium">If the email exists, a reset link has been sent.</div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                id="forgot-email"
                name="email"
                type="email"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <motion.button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={loading}
                aria-label="Send reset link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >{loading ? 'Sending...' : 'Send Reset Link'}</motion.button>
              {error && <div className="text-rose-500 text-sm" role="alert">{error}</div>}
            </form>
          )}
        </section>
      </main>
    </>
  );
};

export default ForgotPasswordPage; 