import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SignaturePad from 'signature_pad';

const fonts = [
  { label: 'Handwritten', value: 'Pacifico, cursive' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Script', value: 'Dancing Script, cursive' },
  { label: 'Monospace', value: 'Courier New, monospace' },
];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, y: -24, transition: { duration: 0.18, ease: 'easeIn' } },
};

const SignatureInputModal = ({ open, onClose, onSave }) => {
  const [mode, setMode] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [typedFont, setTypedFont] = useState(fonts[0].value);
  const [uploadUrl, setUploadUrl] = useState(null);
  const canvasRef = useRef();
  const signaturePadRef = useRef();
  const modalRef = useRef();
  const inputRef = useRef();
  const [uploadError, setUploadError] = useState('');
  const [drawPreview, setDrawPreview] = useState(null);
  const [isPadEmpty, setIsPadEmpty] = useState(true);

  useEffect(() => {
    if (open && mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(0,0,0)',
        minWidth: 1.5,
        maxWidth: 2.5,
        throttle: 16,
        onEnd: () => {
          updateDrawPreview();
        },
      });
      const updateOnPointerUp = () => {
        updateDrawPreview();
      };
      canvas.addEventListener('pointerup', updateOnPointerUp);
      canvas.addEventListener('touchend', updateOnPointerUp);
      setIsPadEmpty(true);
      setDrawPreview(null);
      return () => {
        if (canvas) {
          canvas.removeEventListener('pointerup', updateOnPointerUp);
          canvas.removeEventListener('touchend', updateOnPointerUp);
        }
      };
    }
    setTimeout(() => {
      if (mode === 'draw' && canvasRef.current) canvasRef.current.focus();
      if (mode === 'type' && inputRef.current) inputRef.current.focus();
    }, 0);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('input, button, canvas, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
    };
  }, []);

  if (!open) return null;

  const updateDrawPreview = () => {
    if (signaturePadRef.current) {
      const empty = signaturePadRef.current.isEmpty();
      setIsPadEmpty(empty);
      setDrawPreview(empty ? null : signaturePadRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      updateDrawPreview();
    }
  };
  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data) {
        data.pop();
        signaturePadRef.current.fromData(data);
        updateDrawPreview();
      }
    }
  };
  const handleUpload = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Only PNG, JPG, JPEG, or SVG files are allowed.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setUploadError('File size must be 1MB or less.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setUploadUrl(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleSave = () => {
    if (mode === 'draw') {
      if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        const dataUrl = signaturePadRef.current.toDataURL('image/png');
        onSave(dataUrl, 'drawn');
      }
    } else if (mode === 'type') {
      if (typedName.trim()) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `48px ${typedFont}`;
        ctx.fillStyle = '#222';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(typedName, 200, 50);
        onSave(canvas.toDataURL('image/png'), 'typed');
      }
    } else if (mode === 'upload' && uploadUrl) {
      onSave(uploadUrl, 'uploaded');
    }
  };
  const canSave = () => {
    if (mode === 'draw') return signaturePadRef.current && !signaturePadRef.current.isEmpty();
    if (mode === 'type') return typedName.trim().length > 0;
    if (mode === 'upload') return uploadUrl;
    return false;
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="signature-modal-title" aria-describedby="signature-modal-desc" initial="hidden" animate="visible" exit="exit" variants={modalVariants}>
          <motion.div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto" tabIndex="-1" initial={{ scale: 0.98, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0, transition: { duration: 0.22 } }} exit={{ scale: 0.98, opacity: 0, y: -24, transition: { duration: 0.18 } }}>
            <motion.button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded" onClick={onClose} aria-label="Close signature modal" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>&times;</motion.button>
            <h2 id="signature-modal-title" className="text-xl font-semibold mb-4">Add Your Signature</h2>
            <div id="signature-modal-desc" className="sr-only">Add your signature by drawing, typing, or uploading an image. Use the tabs to switch modes.</div>
            <div className="flex space-x-2 mb-4" role="tablist" aria-label="Signature input modes">
              {[
                { key: 'draw', label: 'Draw', icon: '✏️' },
                { key: 'type', label: 'Type', icon: '⌨️' },
                { key: 'upload', label: 'Upload', icon: '📁' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`flex-1 py-3 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors min-w-[44px] min-h-[44px] ${mode === tab.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setMode(tab.key)}
                  aria-label={`${tab.label} signature`}
                  aria-selected={mode === tab.key}
                  aria-controls={`signature-tabpanel-${tab.key}`}
                  role="tab"
                  tabIndex={0}
                  title={tab.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            {mode === 'draw' && (
              <motion.div className="flex flex-col items-center" id="signature-tabpanel-draw" role="tabpanel" aria-labelledby="signature-tab-draw" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="relative">
                  <canvas ref={canvasRef} width={400} height={100} className="border-2 border-gray-300 rounded-lg mb-3 cursor-crosshair bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-h-[44px] min-w-[200px]" style={{ touchAction: 'none' }} tabIndex={0} aria-label="Draw your signature here" title="Draw your signature here" />
                  <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">Draw here</div>
                </div>
                <div className="flex space-x-2 mb-2">
                  <motion.button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded min-w-[44px] min-h-[44px]" onClick={handleUndo} aria-label="Undo last stroke" title="Undo" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Undo</motion.button>
                  <motion.button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded min-w-[44px] min-h-[44px]" onClick={handleClear} aria-label="Clear signature" title="Clear" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Clear</motion.button>
                </div>
                <div className="w-full flex flex-col items-center mt-2">
                  <span className="text-xs text-gray-500 mb-1">Preview:</span>
                  <div className="border rounded bg-gray-50 p-2 min-h-[60px] min-w-[200px] flex items-center justify-center">
                    {drawPreview ? (
                      <img src={drawPreview} alt="Signature preview" className="max-h-16 max-w-full" />
                    ) : (
                      <span className="text-gray-400">(Draw above to preview)</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            {mode === 'type' && (
              <motion.div className="flex flex-col items-center space-y-3" id="signature-tabpanel-type" role="tabpanel" aria-labelledby="signature-tab-type" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <label htmlFor="signature-type-name" className="sr-only">Type your name</label>
                <input
                  ref={inputRef}
                  id="signature-type-name"
                  name="typedName"
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-h-[44px]"
                  placeholder="Type your name"
                  value={typedName}
                  onChange={e => setTypedName(e.target.value)}
                  maxLength={32}
                  aria-label="Type your name"
                  title="Type your name"
                />
                <div className="flex flex-wrap gap-2 justify-center">{fonts.map(f => (
                  <motion.button key={f.value} className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors min-w-[44px] min-h-[44px] ${typedFont === f.value ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} style={{ fontFamily: f.value }} onClick={() => setTypedFont(f.value)} aria-label={`Select font: ${f.label}`} title={f.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>{f.label}</motion.button>))}</div>
                <div className="mt-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 text-2xl min-h-[60px] flex items-center justify-center" style={{ fontFamily: typedFont, minWidth: 300 }}>{typedName || 'Your Name'}</div>
              </motion.div>
            )}
            {mode === 'upload' && (
              <motion.div className="flex flex-col items-center" id="signature-tabpanel-upload" role="tabpanel" aria-labelledby="signature-tab-upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="w-full"><label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors min-h-[44px]" title="Click to upload signature"><input type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleUpload} aria-label="Upload signature image" className="hidden" /><div className="space-y-2"><svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><div><p className="text-sm font-medium text-gray-700">Click to upload signature</p><p className="text-xs text-gray-500">PNG, JPG, JPEG, SVG. Max 1MB.</p></div></div></label></div>
                {uploadError && (<motion.div className="text-sm text-rose-500 mt-2 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{uploadError}</motion.div>)}
                {uploadUrl && (<motion.div className="mt-4 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}><p className="text-sm text-gray-600 mb-2">Preview:</p><img src={uploadUrl} alt="Signature preview" className="max-h-24 mx-auto border rounded" /></motion.div>)}
              </motion.div>
            )}
            <div className="flex justify-end mt-6 space-x-3">
              <motion.button className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors min-w-[44px] min-h-[44px]" onClick={onClose} aria-label="Cancel signature input" title="Cancel" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>Cancel</motion.button>
              <motion.button className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors min-w-[44px] min-h-[44px]" onClick={handleSave} disabled={!canSave()} aria-label="Save signature" title="Save signature" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>Save Signature</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignatureInputModal; 