import { useState, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PDFViewer = () => {
  // State
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Auth
  const { token } = useAuth();

  // Refs
  const fileInputRef = useRef(null);
  const pdfViewerRef = useRef(null);

  // Helper functions
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return /^(https?:\/\/)?([\w.-]+)(:\d+)?(\/.*)?$/i.test(url);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Event handlers
  const handleLoadUrl = () => {
    if (!pdfUrl.trim()) {
      setError({ title: 'Missing URL', message: 'Please enter a PDF URL to load.' });
      return;
    }

    if (!isValidUrl(pdfUrl)) {
      setError({ title: 'Invalid URL', message: 'Please enter a valid URL starting with http:// or https://' });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Handle local development URLs
    let processedUrl = pdfUrl;
    if (processedUrl.includes('192.168.56.1') || processedUrl.includes('localhost') || processedUrl.includes('127.0.0.1')) {
      if (!processedUrl.startsWith('https://192.168.56.1:3000/')) {
        processedUrl = processedUrl.replace('192.168.56.1', '192.168.56.1:3000');
      }
    }

    // Add to iframe
    if (pdfViewerRef.current) {
      pdfViewerRef.current.src = `${processedUrl}#zoom=${zoom * 100}`;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError({ title: 'Invalid File', message: 'Please upload a valid PDF file.' });
      return;
    }

    setPdfFile(file);
    uploadPdfFile(file);
  };

  const uploadPdfFile = async (file) => {
    setUploadProgress(0);
    setIsLoading(true);
    setError(null);
    setUploadedDoc(null);
    setPdfBlobUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/docs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setIsLoading(false);
      setUploadProgress(100);
      setUploadedDoc(response.data.document);
      toast.success('PDF uploaded successfully!');
      // Fetch the uploaded PDF as a blob and preview it
      fetchPdfBlob(response.data.document._id);
    } catch (err) {
      setIsLoading(false);
      setUploadProgress(0);
      setError({ title: 'Upload Failed', message: err.response?.data?.message || 'Failed to upload PDF.' });
      toast.error('Failed to upload PDF.');
    }
  };

  const fetchPdfBlob = async (docId) => {
    setIsLoading(true);
    setPdfBlobUrl(null);
    try {
      const res = await api.get(`/api/docs/${docId}/download`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blobUrl = URL.createObjectURL(res.data);
      setPdfBlobUrl(blobUrl);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      // Enhanced error logging
      if (err.response) {
        console.error('PDF fetch error:', err.response.status, err.response.statusText, err.response.data);
        setError({ title: `Load Failed (${err.response.status})`, message: err.response.statusText || 'Failed to load PDF from server.' });
      } else {
        console.error('PDF fetch error:', err);
        setError({ title: 'Load Failed', message: 'Failed to load PDF from server.' });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      uploadPdfFile(file);
    } else {
      setError({ title: 'Invalid File', message: 'Please upload a valid PDF file.' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Render
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">PDF Viewer</h1>
          <p className="text-gray-600">Upload or enter URL to view PDF documents</p>
        </div>
        
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="pdf-url" className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                <div className="flex">
                  <input 
                    type="text" 
                    id="pdf-url" 
                    placeholder="Enter PDF URL"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleLoadUrl}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <i className="fas fa-search mr-1"></i> Load
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setShowUpload(!showUpload)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <i className="fas fa-upload mr-1"></i> Upload PDF
                </button>
              </div>
            </div>
            
            {/* Upload Section */}
            {showUpload && (
              <div className="mt-4">
                <div 
                  id="dropzone" 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${pdfFile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                  onDrop={handleDrop}
                  onDragOver={handleDrag}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    id="pdf-file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <i className="fas fa-file-pdf text-4xl text-indigo-500 mb-3"></i>
                    <p className="text-gray-600 mb-2">Drag & drop your PDF file here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
                      <i className="fas fa-folder-open mr-1"></i> Browse Files
                    </div>
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-indigo-700">Uploading...</span>
                      <span className="text-sm font-medium text-indigo-700">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl mb-6">
            <div className="animate-spin text-indigo-600 text-5xl mb-4">
              <i className="fas fa-spinner"></i>
            </div>
            <p className="text-gray-600">{uploadProgress < 100 ? 'Uploading PDF document...' : 'Processing PDF...'}</p>
          </div>
        )}
        
        {/* PDF Viewer */}
        {(pdfFile || pdfUrl || uploadedDoc) ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-lg font-medium text-gray-800 truncate">
                {uploadedDoc?.originalName || pdfFile?.name || pdfUrl.split('/').pop() || 'document.pdf'}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-search-plus"></i>
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                <button 
                  onClick={() => {
                    if (uploadedDoc) {
                      window.open(`/api/docs/${uploadedDoc._id}/download`, '_blank');
                    } else if (pdfFile) {
                      alert(`Download would start for: ${pdfFile.name}`);
                    } else if (pdfUrl) {
                      alert(`Download would start from URL: ${pdfUrl}`);
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden pt-[56.25%]">
              <iframe 
                ref={pdfViewerRef}
                className="absolute top-0 left-0 w-full h-full border-none"
                title="PDF Viewer"
                src={pdfBlobUrl || undefined}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError({ 
                    title: 'Load Failed', 
                    message: `Failed to load PDF. Please check the URL or file and try again.` 
                  });
                }}
              />
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of 5 {/* In real app, get total pages */}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, 5))}
                  disabled={currentPage >= 5}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {uploadedDoc ? formatFileSize(uploadedDoc.fileSize) : pdfFile ? formatFileSize(pdfFile.size) : 'Loading...'}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PDFViewer; 