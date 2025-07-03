import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import PDFRenderer from '../components/PDFRenderer';
import Header from '../components/Header';
import SignatureInputModal from '../components/SignatureInputModal';
import { cssToPDF } from '../utils/coordinateTransform';

const DEFAULT_SIG_WIDTH = 180;
const DEFAULT_SIG_HEIGHT = 60;

// TODO: Integrate signature overlay and placement logic

const DocumentViewerPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [pdfFile, setPdfFile] = useState(null); // Blob or URL
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signatureFields, setSignatureFields] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [pendingSignature, setPendingSignature] = useState(null); // { dataUrl, type }
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [pageDims, setPageDims] = useState({ width: 900, height: 1200 });
  const [currentPage, setCurrentPage] = useState(1);
  const [sigActionLoading, setSigActionLoading] = useState(false);
  const [sigActionError, setSigActionError] = useState('');
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [finalizeError, setFinalizeError] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfPageDims, setPdfPageDims] = useState({ width: 900, height: 1200 }); // PDF points
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Fetch document metadata and signature overlays only.
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setDocInfo(null);
    setSignatureFields([]);
    const fetchDoc = async () => {
      try {
        // Fetch document metadata
        const docRes = await api.get(`/api/docs/${id}`);
        setDocInfo(docRes.data.document);
        // Map signers/signatureData to overlays
        const signers = docRes.data.document.signers || [];
        const overlays = signers
          .filter(s => s.signatureData && s.signatureData.image)
          .map((s, idx) => ({
            id: s._id || idx,
            page: s.signatureData.page || 1,
            x: s.signatureData.x || 50,
            y: s.signatureData.y || 50,
            width: s.signatureData.width || DEFAULT_SIG_WIDTH,
            height: s.signatureData.height || DEFAULT_SIG_HEIGHT,
            rotation: s.signatureData.rotation || 0,
            signature: { data: s.signatureData.image, type: s.signatureData.type },
            signerEmail: s.email,
          }));
        setSignatureFields(overlays);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, token]);

  useEffect(() => {
    const fetchPdfBlob = async () => {
      if (!docInfo) return;
      try {
        setLoading(true);
        setError('');
        // Always get the latest JWT from localStorage
        const latestToken = localStorage.getItem('token');
        const res = await api.get(`/api/docs/${docInfo._id}/download`, {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${latestToken}` },
        });
        const blobUrl = window.URL.createObjectURL(res.data);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load PDF.');
      } finally {
        setLoading(false);
      }
    };
    fetchPdfBlob();
    // Clean up blob URL on unmount
    return () => {
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docInfo]);

  // Handle click-to-place signature field (only if a signature is pending)
  const handlePageClick = async (page, x, y, dims) => {
    if (!pendingSignature || !docInfo) return;
    setSigActionLoading(true);
    setSigActionError('');
    try {
      // Calculate scale between rendered PDF and actual PDF points
      const scale = dims.width / pdfPageDims.width;
      // Debug logging
      console.log('[Signature Placement Debug]');
      console.log('Rendered PDF size (pixels):', dims.width, dims.height);
      console.log('Actual PDF size (points):', pdfPageDims.width, pdfPageDims.height);
      console.log('Click coordinates (pixels):', x, y);
      console.log('Scale (rendered/actual):', scale);
      // Convert to PDF coordinates using actual PDF page size and scale
      const pdfCoords = cssToPDF(x, y, pdfPageDims.height, scale, DEFAULT_SIG_HEIGHT);
      console.log('Calculated PDF coordinates (points):', pdfCoords.x, pdfCoords.y);
      // Save to backend (self-sign)
      await api.post('/api/signatures/self-sign', {
        documentId: docInfo._id,
        signerEmail: user.email,
        signerName: user.firstName + ' ' + user.lastName,
        signatureData: pendingSignature.data,
        signatureType: pendingSignature.type,
        position: {
          page,
          x: pdfCoords.x,
          y: pdfCoords.y,
          width: DEFAULT_SIG_WIDTH,
          height: DEFAULT_SIG_HEIGHT,
          rotation: 0,
          image: pendingSignature.data,
          type: pendingSignature.type,
        },
      });
      // Reload document and overlays
      const docRes = await api.get(`/api/docs/${id}`);
      setDocInfo(docRes.data.document);
      const signers = docRes.data.document.signers || [];
      const overlays = signers
        .filter(s => s.signatureData && s.signatureData.image)
        .map((s, idx) => ({
          id: s._id || idx,
          page: s.signatureData.page || 1,
          x: s.signatureData.x || 50,
          y: s.signatureData.y || 50,
          width: s.signatureData.width || DEFAULT_SIG_WIDTH,
          height: s.signatureData.height || DEFAULT_SIG_HEIGHT,
          rotation: s.signatureData.rotation || 0,
          signature: { data: s.signatureData.image, type: s.signatureData.type },
          signerEmail: s.email,
        }));
      setSignatureFields(overlays);
      setPendingSignature(null);
      setShowSignatureModal(false);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Redirect to login if unauthorized
        window.location.href = '/login?sessionExpired=true';
        return;
      }
      setSigActionError(err.response?.data?.message || 'Failed to save signature.');
    } finally {
      setSigActionLoading(false);
    }
  };

  // Update a signature field's position/size/rotation (optional: sync with backend)
  const handleUpdateField = (id, updates) => {
    console.log('[handleUpdateField]', id, updates);
    setSignatureFields(fields => fields.map(f => f.id === id ? { ...f, ...updates } : f));
    // Optionally, sync with backend here
  };

  // Remove a signature field (optional: sync with backend)
  const handleRemoveField = (id) => {
    setSignatureFields(fields => fields.filter(f => f.id !== id));
    setSelectedFieldId(null);
    // Optionally, sync with backend here
  };

  // Save signature modal result
  const handleSignatureSave = (dataUrl, type) => {
    setPendingSignature({ data: dataUrl, type });
    setShowSignatureModal(false); // Close the modal after saving
    // Modal closes, user will click to place on PDF
  };

  // Track selected field for coordinate display
  const handleFieldSelect = (id) => {
    setSelectedFieldId(id);
  };

  // Get selected field's coordinates (PDF system)
  const selectedField = signatureFields.find(f => f.id === selectedFieldId);

  // Finalize and download signed PDF
  const handleFinalizeDownload = async () => {
    if (!docInfo) return;
    setFinalizeLoading(true);
    setFinalizeError('');
    try {
      const res = await api.post(`/api/signatures/finalize/${docInfo._id}`, {}, {
        responseType: 'blob',
      });
      // Download the PDF
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${docInfo.originalName || 'signed-document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        window.location.href = '/login?sessionExpired=true';
        return;
      }
      setFinalizeError(err.response?.data?.message || 'Failed to finalize and download PDF.');
    } finally {
      setFinalizeLoading(false);
    }
  };

  // Add share handler
  const handleShare = () => {
    // For demo: use current document's public link or download link
    const link = `${window.location.origin}/document/${docInfo._id}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="flex flex-col h-screen min-h-0 w-full">
      <Header />
      {/* Navigation Toolbar restored */}
      <div className="h-12 flex items-center justify-center bg-gray-50 border-b border-gray-200 z-10">
        <button
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold min-w-[44px] min-h-[36px] focus:outline-none focus:ring-2 focus:ring-indigo-400 mx-1"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
          tabIndex={0}
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium mx-2" aria-live="polite">
          Page {currentPage}
        </span>
        <button
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold min-w-[44px] min-h-[36px] focus:outline-none focus:ring-2 focus:ring-indigo-400 mx-1"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={false} // We'll disable if we know numPages
          aria-label="Next page"
          title="Next page"
          tabIndex={0}
        >
          Next
        </button>
      </div>
      {/* PDF Viewer Container - bulletproof flex layout */}
      <div className="flex-1 min-h-0 overflow-auto flex justify-center items-start bg-gray-50">
        <div className="w-full max-w-5xl flex flex-col items-center relative m-auto">
          <h1 className="text-2xl font-bold mb-4">Document Viewer</h1>
          {loading && <div className="text-gray-500">Loading document...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {sigActionError && <div className="text-red-500">{sigActionError}</div>}
          {finalizeError && <div className="text-red-500">{finalizeError}</div>}
          {pdfBlobUrl && !loading && !error && (
            <PDFRenderer
              file={pdfBlobUrl}
              pageNumber={currentPage}
              signatureFields={signatureFields}
              onPageClick={pendingSignature ? handlePageClick : undefined}
              onUpdateField={docInfo && docInfo.status !== 'completed' ? handleUpdateField : undefined}
              onRemoveField={docInfo && docInfo.status !== 'completed' ? handleRemoveField : undefined}
              onFieldSelect={setSelectedFieldId}
              selectedFieldId={selectedFieldId}
              onPageChange={setCurrentPage}
              initialPage={currentPage}
              pageDims={pageDims}
              isEditable={docInfo && docInfo.status !== 'completed'}
              onPageDims={setPdfPageDims}
            />
          )}
          {!pdfBlobUrl && !loading && !error && (
            <div className="text-gray-500">No PDF loaded</div>
          )}
          {/* Finalize & Download Button */}
          {docInfo && docInfo.status !== 'completed' && (
            <button
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
              onClick={handleFinalizeDownload}
              disabled={finalizeLoading}
              aria-label="Finalize and download signed PDF"
            >
              {finalizeLoading ? 'Finalizing...' : 'Finalize & Download Signed PDF'}
            </button>
          )}
          {/* Download Signed PDF Button for completed docs */}
          {docInfo && docInfo.status === 'completed' && pdfBlobUrl && (
            <>
              <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfBlobUrl;
                  link.setAttribute('download', `${docInfo.originalName || 'signed-document'}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                }}
                aria-label="Download signed PDF"
              >
                Download Signed PDF
              </button>
              <button
                className="mt-6 ml-4 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                onClick={handleShare}
                aria-label="Share signed document"
              >
                Share
              </button>
            </>
          )}
          {/* Floating Add Signature Button */}
          <button
            className="fixed bottom-8 right-8 z-40 bg-indigo-600 text-white rounded-full shadow-lg p-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => setShowSignatureModal(true)}
            aria-label="Add Signature"
            disabled={sigActionLoading}
          >
            <span className="text-2xl font-bold">+</span>
          </button>
          {/* Signature Creation Modal */}
          <SignatureInputModal
            open={showSignatureModal}
            onClose={() => { setShowSignatureModal(false); setPendingSignature(null); }}
            onSave={handleSignatureSave}
          />
          {/* Real-time coordinate display for selected field */}
          {selectedField && (
            <div className="fixed bottom-8 left-8 bg-white rounded shadow-lg px-4 py-2 text-gray-700 z-40">
              <div className="font-semibold">Signature Coordinates</div>
              <div>Page: {selectedField.page}</div>
              <div>X: {Math.round(selectedField.x)}</div>
              <div>Y: {Math.round(selectedField.y)}</div>
              <div>Width: {Math.round(selectedField.width)}</div>
              <div>Height: {Math.round(selectedField.height)}</div>
            </div>
          )}
          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowShareModal(false)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Share Signed Document</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="w-full border rounded px-3 py-2 text-gray-700 bg-gray-100"
                  />
                </div>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={handleCopyLink}
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerPage; 