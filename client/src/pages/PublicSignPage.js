import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import PDFRenderer from '../components/PDFRenderer';
import SignatureInputModal from '../components/SignatureInputModal';

const PublicSignPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  const [signer, setSigner] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signatureField, setSignatureField] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [signatureType, setSignatureType] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signature, setSignature] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);

  useEffect(() => {
    const fetchSignature = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/signatures/${token}`);
        setSignature(res.data.signature);
        setDocument(res.data.document);
        setSigner(res.data.signature?.signerEmail ? { email: res.data.signature.signerEmail } : null);
        setPdfUrl(`/api/docs/${res.data.document._id}/download`);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load document.');
      }
      setLoading(false);
    };
    fetchSignature();
  }, [token]);

  const handleAddField = (pageNumber, x, y, pageDims) => {
    if (!signatureImage) {
      setClickCoords({ x, y, page: pageNumber, pageDims });
      setShowSignatureModal(true);
      return;
    }
    
    // Calculate signature position relative to page dimensions
    const signatureWidth = 200; // Default width
    const signatureHeight = 100; // Default height
    
    const newField = {
      id: `signature-${Date.now()}`,
      x: x - (signatureWidth / 2), // Center the signature on click
      y: y - (signatureHeight / 2),
      page: pageNumber,
      width: signatureWidth,
      height: signatureHeight,
      image: signatureImage,
      type: signatureType,
      pageDims // Store page dimensions for reference
    };
    
    setSignatureField(newField);
  };

  const handleFieldMove = (field) => {
    setSignatureField(field);
  };

  const handleSignatureSave = (img, type) => {
    setSignatureImage(img);
    setSignatureType(type);
    setShowSignatureModal(false);
    
    // If we have saved coordinates, create the signature field
    if (clickCoords) {
      const signatureWidth = 200;
      const signatureHeight = 100;
      
      const newField = {
        id: `signature-${Date.now()}`,
        x: clickCoords.x - (signatureWidth / 2), // Center the signature on click
        y: clickCoords.y - (signatureHeight / 2),
        page: clickCoords.page,
        width: signatureWidth,
        height: signatureHeight,
        image: img,
        type: type,
        pageDims: clickCoords.pageDims
      };
      
      setSignatureField(newField);
      setClickCoords(null);
    }
  };

  const handleSubmit = async () => {
    if (!signatureField) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.put(`/api/signatures/${token}`, {
        signatureData: signatureField,
        signatureType,
      });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit signature.');
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/signatures/${token}/reject`);
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reject signature.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-red-600">{error}</div>
    </div>
  );
  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-green-600 text-xl font-semibold">Thank you! Your signature has been submitted.</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignatureInputModal
        open={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSave}
      />
      <div className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-indigo-600 mb-4">Sign Document</h1>
        <div className="mb-2 text-gray-700">Signer: <span className="font-mono">{signer?.email}</span></div>
        <div className="mb-6 text-gray-500 text-sm">Click on the document to place your signature.</div>
        <div className="border rounded overflow-hidden mb-4">
          <PDFRenderer 
            file={pdfUrl} 
            onPageClick={handleAddField}
            signatureFields={signatureField ? [signatureField] : []}
            onUpdateField={setSignatureField}
          />
        </div>
        <button
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!signatureField || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Signature'}
        </button>
        <button
          className="mt-4 ml-4 bg-rose-600 text-white px-6 py-2 rounded hover:bg-rose-700 disabled:opacity-50"
          onClick={handleReject}
          disabled={submitting}
        >
          Reject
        </button>
        {!signatureImage && (
          <div className="mt-4 text-sm text-gray-500">
            Please add your signature to continue.
            <button 
              className="ml-2 text-indigo-600 underline" 
              onClick={() => setShowSignatureModal(true)}
            >
              Add Signature
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSignPage; 