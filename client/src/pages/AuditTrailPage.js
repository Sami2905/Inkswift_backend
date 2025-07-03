import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import EmptyState from '../components/EmptyState';

const actionLabels = {
  signed: 'Document Signed',
  invited: 'Signer Invited',
  viewed: 'Document Viewed',
  downloaded: 'Document Downloaded',
  // Add more as needed
};

const AuditTrailPage = () => {
  const { docId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/docs/${docId}/audit`);
        setLogs(res.data.audit || []);
      } catch (e) {
        setError('Failed to load audit trail.');
      }
      setLoading(false);
    };
    fetchAudit();
  }, [docId]);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-gray-50" role="main" aria-label="Audit Trail main content">
        <section className="w-full max-w-2xl p-4 sm:p-8 bg-white rounded-2xl shadow-md" aria-labelledby="audit-title">
          <h1 id="audit-title" className="text-2xl font-semibold text-indigo-600 mb-4">Audit Trail</h1>
          {loading ? (
            <div className="text-gray-400" aria-live="polite">Loading...</div>
          ) : error ? (
            <div className="text-rose-500" role="alert">{error}</div>
          ) : logs.length === 0 ? (
            <EmptyState
              illustration={
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full"><circle cx="32" cy="32" r="24" fill="#E5E7EB"/><rect x="24" y="28" width="16" height="8" rx="2" fill="#9CA3AF"/></svg>
              }
              title="No Audit Logs"
              description="Audit logs will appear here once actions are taken."
            />
          ) : (
            <ol className="relative border-l-2 border-indigo-200" aria-label="Audit event list">
              {logs.map((log, idx) => (
                <li key={log._id || idx} className="mb-8 ml-6" aria-label={`Audit event ${idx + 1}`}> 
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full ring-8 ring-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" /></svg>
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="font-semibold text-indigo-700">{actionLabels[log.action] || log.action}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {log.metadata?.signerEmail && <span>By: <span className="font-mono">{log.metadata.signerEmail}</span></span>}
                    {log.userId && <span>User: <span className="font-mono">{log.userId}</span></span>}
                  </div>
                  <motion.button
                    className="text-xs text-indigo-500 mt-1 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    aria-expanded={expanded === idx}
                    aria-controls={`audit-details-${idx}`}
                    aria-label={expanded === idx ? 'Hide Details' : 'Show Details'}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                  >{expanded === idx ? 'Hide Details' : 'Show Details'}</motion.button>
                  {expanded === idx && (
                    <div id={`audit-details-${idx}`} className="mt-2 bg-gray-50 border rounded p-2 text-xs text-gray-700" role="region" aria-label="Audit event details">
                      <div><b>Action:</b> {log.action}</div>
                      <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                      {log.metadata && Object.keys(log.metadata).map(key => (
                        <div key={key}><b>{key}:</b> {String(log.metadata[key])}</div>
                      ))}
                      {log.ipAddress && <div><b>IP:</b> {log.ipAddress}</div>}
                      {log.userAgent && <div><b>User Agent:</b> {log.userAgent}</div>}
                      {log.userId && <div><b>User ID:</b> {log.userId}</div>}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </>
  );
};

export default AuditTrailPage; 