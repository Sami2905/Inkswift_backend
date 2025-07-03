import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const TestComponent = () => {
  const { user, token } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [pdfHealth, setPdfHealth] = useState(null);
  const [pdfHealthLoading, setPdfHealthLoading] = useState(false);
  const [pdfHealthError, setPdfHealthError] = useState('');
  const [blobUrl, setBlobUrl] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [jwt, setJwt] = React.useState(localStorage.getItem('token') || '');
  const [inputJwt, setInputJwt] = React.useState(jwt);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Authentication
    try {
      results.auth = {
        user: !!user,
        token: !!token,
        status: 'PASS'
      };
    } catch (error) {
      results.auth = {
        error: error.message,
        status: 'FAIL'
      };
    }

    // Test 2: API Health Check
    try {
      const healthRes = await api.get('/api/health');
      results.health = {
        status: healthRes.data.status,
        app: healthRes.data.app,
        status: 'PASS'
      };
    } catch (error) {
      results.health = {
        error: error.message,
        status: 'FAIL'
      };
    }

    // Test 3: Documents API
    try {
      const docsRes = await api.get('/api/docs');
      results.documents = {
        count: docsRes.data.documents?.length || 0,
        pagination: docsRes.data.pagination,
        status: 'PASS'
      };
    } catch (error) {
      results.documents = {
        error: error.message,
        status: 'FAIL'
      };
    }

    // Test 4: Local Storage
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      results.storage = {
        token: !!storedToken,
        user: !!storedUser,
        status: 'PASS'
      };
    } catch (error) {
      results.storage = {
        error: error.message,
        status: 'FAIL'
      };
    }

    setTestResults(results);
    setLoading(false);
    toast.success('Tests completed!');
  };

  const handlePDFHealthCheck = async () => {
    setPdfHealthLoading(true);
    setPdfHealthError('');
    setPdfHealth(null);
    try {
      // Use a known document ID or prompt user for one
      const testDocId = prompt('Enter a Document ID to test PDF endpoint:', '');
      if (!testDocId) {
        setPdfHealthError('No document ID provided.');
        setPdfHealthLoading(false);
        return;
      }
      const res = await fetch(`/api/docs/${testDocId}/download`, {
        method: 'GET',
      });
      const contentType = res.headers.get('content-type');
      const contentLength = res.headers.get('content-length');
      setPdfHealth({
        ok: res.ok,
        status: res.status,
        contentType,
        contentLength,
      });
      if (!res.ok) {
        setPdfHealthError(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setPdfHealthError(err.message || 'PDF health check failed.');
    } finally {
      setPdfHealthLoading(false);
    }
  };

  const TestPDF = () => {
    const [error, setError] = React.useState(null);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold mb-4">Test Public PDF Viewer</h2>
        <div className="bg-white p-4 rounded shadow">
          <Document 
            file="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            onLoadError={err => { setError(err.message); console.error('Test PDF error:', err, err.stack, err.name, err.cause); }}
          >
            <Page pageNumber={1} width={600} />
          </Document>
          {error && <div className="text-red-500 mt-2">Error: {error}</div>}
        </div>
      </div>
    );
  };

  const BackendPDFTest = () => {
    const [blobUrl, setBlobUrl] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [jwt, setJwt] = React.useState(localStorage.getItem('token') || '');
    const [inputJwt, setInputJwt] = React.useState(jwt);

    const fetchBlob = async (token) => {
      setError(null);
      setBlobUrl(null);
      try {
        const res = await api.get('/api/docs/6860f7e1bdfe754adbf56eb5/download', {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = res.data;
        setBlobUrl(URL.createObjectURL(blob));
      } catch (err) {
        setError(err.message);
        console.error('Backend PDF test error:', err, err.stack, err.name, err.cause);
      }
    };

    React.useEffect(() => {
      if (jwt) fetchBlob(jwt);
      // Clean up blob URL on unmount
      return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
      // eslint-disable-next-line
    }, [jwt]);

    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Backend PDF Blob Viewer</h2>
        <div className="mb-2">
          <label htmlFor="jwt-input" className="block mb-1 font-medium">JWT Token</label>
          <input
            id="jwt-input"
            name="jwt"
            type="text"
            value={inputJwt}
            onChange={e => setInputJwt(e.target.value)}
            placeholder="Paste JWT token here"
            className="w-full px-2 py-1 border rounded"
          />
          <button
            className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setJwt(inputJwt)}
          >Test with this JWT</button>
        </div>
        <div className="bg-white p-4 rounded shadow">
          {blobUrl && (
            <Document file={blobUrl} onLoadError={err => { setError(err.message); console.error('Backend PDF error:', err, err.stack, err.name, err.cause); }}>
              <Page pageNumber={1} width={600} />
            </Document>
          )}
          {error && <div className="text-red-500 mt-2">Error: {error}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* System Tests */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">System Test</h2>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>

        <button
          className="mb-4 ml-4 px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          onClick={handlePDFHealthCheck}
          disabled={pdfHealthLoading}
        >
          {pdfHealthLoading ? 'Checking PDF...' : 'PDF Health Check'}
        </button>

        {pdfHealth && (
          <div className="mt-2 p-4 bg-gray-50 border rounded">
            <div><b>Status:</b> {pdfHealth.ok ? '✅ OK' : '❌ Error'} (HTTP {pdfHealth.status})</div>
            <div><b>Content-Type:</b> {pdfHealth.contentType}</div>
            <div><b>Content-Length:</b> {pdfHealth.contentLength || 'N/A'}</div>
          </div>
        )}

        {pdfHealthError && (
          <div className="mt-2 p-2 bg-rose-100 text-rose-700 border border-rose-300 rounded">{pdfHealthError}</div>
        )}

        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="border rounded p-3">
              <h3 className="font-medium capitalize">{testName}</h3>
              <div className={`text-sm ${result.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {result.status}
              </div>
              {result.error && (
                <div className="text-red-500 text-sm mt-1">Error: {result.error}</div>
              )}
              {result.status === 'PASS' && (
                <div className="text-gray-600 text-sm mt-1">
                  {Object.entries(result).filter(([key]) => key !== 'status').map(([key, value]) => (
                    <div key={key}>{key}: {JSON.stringify(value)}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Current State:</h3>
          <div className="text-sm space-y-1">
            <div>User: {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}</div>
            <div>Token: {token ? 'Present' : 'Missing'}</div>
            <div>API Base: {api.defaults.baseURL}</div>
          </div>
        </div>
      </div>

      {/* Test PDF Viewer */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Test Public PDF Viewer</h2>
        <div className="bg-white p-4 rounded shadow">
          <Document 
            file="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            onLoadError={err => { console.error('Test PDF error:', err); }}
          >
            <Page pageNumber={1} width={600} />
          </Document>
        </div>
      </div>

      <TestPDF />
      <BackendPDFTest />
    </div>
  );
};

// Add accessibility test using axe-core
// Only run in test environment
if (process.env.NODE_ENV === 'test') {
  import('@testing-library/react').then(({ render }) => {
    import('axe-core').then(axe => {
      render(<TestComponent />);
      axe.run(document.body, {}, (err, results) => {
        if (err) throw err;
        if (results.violations.length > 0) {
          // eslint-disable-next-line no-console
          console.error('Accessibility violations:', results.violations);
        }
      });
    });
  });
}

export default TestComponent; 