import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use a more reliable CDN for the PDF.js worker
const pdfjsVersion = '3.11.174'; // Explicitly set the version for consistency
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

// Add error boundary for PDF rendering
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PDF Rendering Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error loading PDF. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const fallbackPdfUrl = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';

function blobToHex(blob, cb) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = new Uint8Array(e.target.result);
    cb(Array.from(arr).slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join(' '));
  };
  reader.readAsArrayBuffer(blob);
}

function base64ToBlob(base64, type = 'application/pdf') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

// Add helper for rotation
function getTransformStyle(field, scale) {
  const cx = (field.width || 180) * scale / 2;
  const cy = (field.height || 60) * scale / 2;
  return `rotate(${field.rotation || 0}deg)`;
}

// Add animation CSS (injected inline for now)
const style = document.createElement('style');
style.innerHTML = `
@keyframes signature-select-pop {
  0% { transform: scale(1); box-shadow: none; }
  60% { transform: scale(1.08); box-shadow: 0 0 12px #6366f1; }
  100% { transform: scale(1); box-shadow: 0 0 8px #6366f1; }
}`;
document.head.appendChild(style);

const PDFRenderer = ({ file, base64, onPageChange, initialPage = 1, signatureFields = [], onPageClick, onUpdateField, onRemoveField, isEditable = true, onPageDims, onFieldSelect, selectedFieldId }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageDims, setPageDims] = useState({ width: 900, height: 1200 });
  const pageContainerRef = useRef();
  const dragFieldRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [objectUrl, setObjectUrl] = useState(null);
  const [blobHex, setBlobHex] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Calculate scale factor between rendered PDF and actual PDF points
  const scale = pageDims.width / 900; // 900 is the default width used in <Page width={900} />

  // Handle blob URLs or file objects
  useEffect(() => {
    const processFile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof file === 'string' && file.startsWith('blob:')) {
          // Handle blob URL
          console.log('Processing blob URL:', file);
          try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to fetch blob: ${response.status}`);
            const blob = await response.blob();
            setPdfBlob(blob);
            
            // Create object URL for react-pdf
            const url = URL.createObjectURL(blob);
            setObjectUrl(url);
            setDownloadUrl(url);
            
            // Debug: Log blob info
            console.log('Blob info:', {
              size: blob.size,
              type: blob.type,
              url: url
            });
            
            blobToHex(blob, setBlobHex);
          } catch (err) {
            console.error('Error processing blob URL:', err);
            setError(`Error loading PDF: ${err.message}`);
          }
        } else if (file instanceof Blob) {
          // Handle Blob object directly
          console.log('Processing Blob object:', file);
          const url = URL.createObjectURL(file);
          setObjectUrl(url);
          setDownloadUrl(url);
          setPdfBlob(file);
          blobToHex(file, setBlobHex);
        } else if (base64) {
          // Handle base64 string
          console.log('Processing base64 PDF');
          const blob = base64ToBlob(base64);
          const url = URL.createObjectURL(blob);
          setObjectUrl(url);
          setDownloadUrl(url);
          setPdfBlob(blob);
          blobToHex(blob, setBlobHex);
        } else {
          console.log('No valid file provided, using fallback');
        }
      } catch (err) {
        console.error('Error in processFile:', err);
        setError(`Failed to process PDF: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    processFile();

    // Cleanup
    return () => {
      if (objectUrl) {
        console.log('Cleaning up object URL:', objectUrl);
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, base64]);

  // Debug effect
  useEffect(() => {
    console.log('PDFRenderer - State update:', {
      file,
      objectUrl,
      pdfBlob,
      loading,
      error,
      'pdfjs.version': pdfjs.version
    });
  }, [file, objectUrl, pdfBlob, loading, error]);

  // Always use a string for file prop
  const pdfFileToUse = objectUrl || (typeof file === 'string' ? file : fallbackPdfUrl);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  useEffect(() => {
    console.log('PDFRenderer - Current file:', file);
    console.log('PDFRenderer - Object URL:', objectUrl);
    console.log('PDFRenderer - PDF.js version:', pdfjs.version);
  }, [file, objectUrl]);

  const handleLoadSuccess = ({ numPages }) => {
    console.log('[PDFRenderer] onLoadSuccess, numPages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    if (onPageChange) onPageChange(pageNumber);
  };

  const handleLoadError = (err) => {
    console.error('[PDFRenderer] onLoadError:', err);
    setError(err.message || 'Failed to load PDF');
    setLoading(false);
  };

  const handlePageClick = (e) => {
    if (!onPageClick) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onPageClick(pageNumber, x, y, pageDims);
  };

  const handlePageRenderSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageDims({ width: viewport.width, height: viewport.height });
    if (onPageDims) onPageDims({ width: viewport.width, height: viewport.height });
  };

  // Enhanced drag: constrain to page bounds, grid snapping
  const handleDragStart = (e, field) => {
    e.stopPropagation();
    console.log('[Drag] Start', field.id);
    dragFieldRef.current = field.id;
    const rect = pageContainerRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + field.x * scale),
      y: e.clientY - (rect.top + (pageDims.height - (field.y + (field.height || 60)) * scale)),
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragMove = (e) => {
    if (!dragFieldRef.current || !onUpdateField) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left - dragOffsetRef.current.x) / scale;
    let y = (e.clientY - rect.top - dragOffsetRef.current.y) / scale;
    // Constrain to page bounds
    const field = signatureFields.find(f => f.id === dragFieldRef.current);
    const width = field?.width || 180;
    const height = field?.height || 60;
    x = Math.max(0, Math.min(x, pageDims.width - width));
    y = Math.max(0, Math.min(y, pageDims.height - height));
    // Grid snapping (10pt)
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
    console.log('[Drag] Move', dragFieldRef.current, 'to', x, y);
    onUpdateField(dragFieldRef.current, { x, y });
  };

  const handleDragEnd = () => {
    console.log('[Drag] End', dragFieldRef.current);
    dragFieldRef.current = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = '';
  };

  // Add handlers for resize and rotate
  function handleResizeStart(e, field, dir) {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = field.width || 180;
    const startHeight = field.height || 60;
    const startLeft = field.x;
    const startTop = field.y;
    const scale = pageDims.width / 900;

    function onMove(ev) {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;
      if (dir === 'se') {
        newWidth = Math.max(30, startWidth + dx);
        newHeight = Math.max(20, startHeight + dy);
      } else if (dir === 'sw') {
        newWidth = Math.max(30, startWidth - dx);
        newHeight = Math.max(20, startHeight + dy);
        newX = startLeft + dx;
      } else if (dir === 'ne') {
        newWidth = Math.max(30, startWidth + dx);
        newHeight = Math.max(20, startHeight - dy);
        newY = startTop + dy;
      } else if (dir === 'nw') {
        newWidth = Math.max(30, startWidth - dx);
        newHeight = Math.max(20, startHeight - dy);
        newX = startLeft + dx;
        newY = startTop + dy;
      }
      if (onUpdateField) onUpdateField(field.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function handleRotateStart(e, field) {
    e.stopPropagation();
    const rect = e.target.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = field.rotation || 0;

    function getAngle(ev) {
      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    function onMove(ev) {
      let angle = getAngle(ev) - 90; // 0 deg is up
      if (onUpdateField) onUpdateField(field.id, { rotation: angle });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Deselect on click outside
  useEffect(() => {
    if (!isEditable) return;
    function handleClickOutside(e) {
      if (!pageContainerRef.current) return;
      if (!pageContainerRef.current.contains(e.target)) {
        if (onFieldSelect) onFieldSelect(null);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isEditable, onFieldSelect]);

  useEffect(() => {
    function globalClickLogger(e) {
      console.log('[Global Click] target:', e.target);
    }
    window.addEventListener('click', globalClickLogger, true);
    return () => window.removeEventListener('click', globalClickLogger, true);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full w-full">
        {/* Navigation Toolbar removed, parent handles navigation */}
        {/* PDF Viewer */}
        <div className="flex-1 min-h-0 overflow-auto flex justify-center items-start bg-gray-50">
          <div className="w-full max-w-5xl flex flex-col items-center relative m-auto">
            {/* Debug info */}
            {file instanceof Blob && (
              <div className="text-xs text-gray-500 mb-2">
                <div>Blob size: {file.size} bytes</div>
                <div>Blob type: {file.type}</div>
                <div>First 20 bytes (hex): {blobHex}</div>
                {downloadUrl && (
                  <a href={downloadUrl} download="debug.pdf" className="ml-2 px-2 py-1 bg-blue-100 rounded">Download Blob</a>
                )}
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                <span>Loading PDF...</span>
                <div className="text-xs text-gray-400 mt-2">{typeof pdfFileToUse === 'string' ? pdfFileToUse : '[Blob] PDF'}</div>
              </div>
            )}
            {error && (
              <div className="text-red-500 p-4 border border-red-200 rounded text-center">
                <p><strong>Error:</strong> {error}</p>
                <div className="text-xs text-gray-400 mt-2">File: {String(pdfFileToUse)}</div>
                {downloadUrl && (
                  <a href={downloadUrl} download="debug.pdf" className="ml-2 px-2 py-1 bg-blue-100 rounded">Download Blob</a>
                )}
              </div>
            )}
            {!error && !loading && (
              <div
                ref={pageContainerRef}
                className="relative my-8"
                style={{ width: pageDims.width, height: pageDims.height, cursor: onPageClick ? 'crosshair' : 'default' }}
                onClick={handlePageClick}
              >
                <Document
                  file={pdfFileToUse}
                  onLoadSuccess={handleLoadSuccess}
                  onLoadError={handleLoadError}
                  error={<div className="text-red-500">Failed to load PDF.</div>}
                  loading={null}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={900}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onRenderSuccess={handlePageRenderSuccess}
                  />
                </Document>
                {/* Overlay container as sibling to PDF canvas */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: pageDims.width,
                    height: pageDims.height,
                    pointerEvents: 'none',
                    zIndex: 99999,
                  }}
                >
                  {signatureFields.filter(f => f.page === pageNumber).map((field, idx) => {
                    const width = (field.width || 180) * scale;
                    const height = (field.height || 60) * scale;
                    const left = field.x * scale;
                    const top = (pageDims.height - (field.y + (field.height || 60)) * scale);
                    const rotation = field.rotation || 0;
                    const isSelected = selectedFieldId === field.id || (!selectedFieldId && idx === 0 && signatureFields.length === 1);
                    return (
                      <div
                        key={field.id || idx}
                        className={`absolute group ${isSelected ? 'ring-2 ring-indigo-500 signature-selected' : ''}`}
                        style={{
                          left,
                          top,
                          width,
                          height,
                          zIndex: 99999,
                          pointerEvents: isEditable ? 'all' : 'none',
                          userSelect: 'none',
                          background: 'transparent',
                          border: isEditable && isSelected ? '2px solid #6366f1' : 'none',
                          borderRadius: isEditable && isSelected ? 8 : 0,
                          boxShadow: isEditable && isSelected ? '0 4px 16px 0 #6366f155' : 'none',
                          transform: `rotate(${rotation}deg)`
                        }}
                        onMouseDown={isEditable ? (e => { console.log('[Overlay] onMouseDown', field.id); e.stopPropagation(); if (onFieldSelect) onFieldSelect(field.id); console.log('[Overlay] calling handleDragStart', field.id); handleDragStart(e, field); }) : undefined}
                        tabIndex={0}
                        aria-label="Signature field"
                      >
                        {/* Selection animation */}
                        {isSelected && <div style={{animation: 'signature-select-pop 0.3s'}} />}
                        {/* Contextual toolbar for selected signature */}
                        {isEditable && isSelected && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 bg-white border border-gray-200 rounded shadow px-2 py-1 z-30"
                            style={{ minWidth: 120 }}
                          >
                            <button
                              className="text-xs px-2 py-1 rounded hover:bg-indigo-100"
                              onClick={e => { e.stopPropagation(); if (onRemoveField) onRemoveField(field.id); }}
                            >Delete</button>
                            <span className="text-xs text-gray-400">Move/Resize/Rotate</span>
                          </div>
                        )}
                        {/* Signature image preview */}
                        {field.signature?.data && (
                          <img
                            src={field.signature.data}
                            alt="Signature"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              pointerEvents: 'none',
                              background: 'transparent',
                            }}
                          />
                        )}
                        {/* Resize handles (corners) - only for selected */}
                        {isEditable && isSelected && [
                          ['nw', 0, 0],
                          ['ne', width, 0],
                          ['sw', 0, height],
                          ['se', width, height],
                        ].map(([dir, x, y]) => (
                          <div
                            key={dir}
                            className="absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full cursor-nwse-resize"
                            style={{
                              left: x - 6,
                              top: y - 6,
                              zIndex: 20,
                            }}
                            onMouseDown={e => handleResizeStart(e, field, dir)}
                          />
                        ))}
                        {/* Rotation handle (top center) - only for selected */}
                        {isEditable && isSelected && (
                          <div
                            className="absolute w-4 h-4 bg-indigo-500 rounded-full cursor-pointer"
                            style={{
                              left: width / 2 - 8,
                              top: -28,
                              zIndex: 20,
                            }}
                            title="Rotate signature"
                            onMouseDown={e => handleRotateStart(e, field)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2v2M8 2a6 6 0 1 1-6 6" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1" fill="none"/></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PDFRenderer;