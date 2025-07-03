import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import EmptyState from '../components/EmptyState';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  signed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-700',
};

const DashboardPage = () => {
  const { user, logout, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Route protection
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
    }
    // eslint-disable-next-line
  }, [user, authLoading]);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      let authToken = token || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${authToken}` };
      let url = `/api/docs?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await api.get(url, { headers });
      setDocuments(res.data.documents);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(page);
    // eslint-disable-next-line
  }, [page, search, statusFilter]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-gray-50" role="main" aria-label="Dashboard main content">
        <section className="w-full max-w-5xl p-4 sm:p-8 bg-white rounded-2xl shadow-md" aria-labelledby="dashboard-title">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h1 id="dashboard-title" className="text-2xl font-semibold text-indigo-600">Inkswift Dashboard</h1>
          </div>
          <div className="mb-2 text-gray-700">Welcome, {user?.firstName || user?.name || user?.email || 'User'}!</div>
          <motion.button
            className="mb-4 px-4 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={() => navigate('/upload')}
            aria-label="Upload Document"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            + Upload Document
          </motion.button>
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-2 mb-4 items-center justify-between">
            <input
              id="dashboard-search"
              name="search"
              type="text"
              placeholder="Search documents..."
              className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search documents"
            />
            <select
              className="border rounded px-3 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          {error && <div className="text-rose-500 mb-2" role="alert">{error}</div>}
          {loading ? (
            <div className="text-gray-400" aria-live="polite">Loading documents...</div>
          ) : (
            <div>
              {documents.length === 0 ? (
                <EmptyState
                  illustration={
                    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                      <rect x="8" y="16" width="48" height="32" rx="4" fill="#E5E7EB"/>
                      <rect x="16" y="24" width="32" height="4" rx="2" fill="#9CA3AF"/>
                      <rect x="16" y="32" width="24" height="4" rx="2" fill="#D1D5DB"/>
                    </svg>
                  }
                  title="No Documents Yet"
                  description="Upload your first document to get started."
                />
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Document list">
                  {documents.map(doc => (
                    <li key={doc._id} className="rounded-2xl shadow-md p-4 bg-white flex flex-col justify-between" aria-label={`Document ${doc.originalName}`}> 
                      <article>
                        <div className="flex items-center gap-2 mb-2">
                          {/* Thumbnail */}
                          {doc.previewUrl ? (
                            <img src={doc.previewUrl} alt="Document preview" className="w-12 h-16 object-cover rounded border" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center text-gray-400 text-lg font-bold">PDF</div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-indigo-600 truncate">{doc.originalName}</div>
                            <div className="text-sm text-gray-500">Uploaded: {new Date(doc.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[doc.status] || 'bg-gray-100 text-gray-700'}`}>{doc.status}</span>
                        </div>
                      </article>
                      <div className="flex gap-2 mt-4">
                        <motion.button
                          className="flex-1 px-3 py-1 bg-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          onClick={() => navigate(`/document/${doc._id}`)}
                          aria-label={`View document ${doc.originalName}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          View
                        </motion.button>
                        <motion.button
                          className="flex-1 px-3 py-1 bg-green-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-green-400"
                          onClick={() => navigate(`/sign/${doc.signToken || doc._id}`)}
                          aria-label={`Sign document ${doc.originalName}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          Sign
                        </motion.button>
                        <motion.button
                          className="flex-1 px-3 py-1 bg-sky-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-sky-400"
                          onClick={() => navigate(`/share/${doc._id}`)}
                          aria-label={`Share document ${doc.originalName}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          Share
                        </motion.button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Pagination */}
              {total > limit && (
                <nav className="flex justify-center mt-6 space-x-2" aria-label="Pagination">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1" aria-live="polite">Page {page}</span>
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= total}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </nav>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default DashboardPage; 