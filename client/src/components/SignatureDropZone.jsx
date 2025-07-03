import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SignatureDropZone = ({ page, scale, width, height, signatures, onDropSignature }) => {
  const [isOver, setIsOver] = useState(false);
  const zoneRef = useRef();

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const sigId = e.dataTransfer.getData('signatureId');
    if (!sigId) return;
    // Get drop coordinates relative to the drop zone
    const rect = zoneRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / width) * width / scale;
    const y = ((e.clientY - rect.top) / height) * height / scale;
    onDropSignature && onDropSignature({ sigId, page, x, y });
    toast.success('Signature placed');
  };

  return (
    <div
      ref={zoneRef}
      className={`absolute z-20 pointer-events-auto ${isOver ? 'ring-4 ring-indigo-400 ring-opacity-60' : ''}`}
      style={{ left: 0, top: 0, width, height, cursor: 'copy' }}
      onDragOver={e => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      {/* Placed signatures */}
      <AnimatePresence>
        {signatures.map(sig => (
          <motion.div
            key={sig.id}
            className="absolute group"
            style={{
              left: sig.x * scale,
              top: sig.y * scale,
              width: (sig.width || 180) * scale,
              height: (sig.height || 60) * scale,
              zIndex: 30,
              userSelect: 'none',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <img
              src={sig.data}
              alt="Signature"
              className="w-full h-full object-contain pointer-events-none rounded shadow"
              draggable={false}
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
            />
            {/* Delete button */}
            <motion.button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => {
                if (sig.onDelete) sig.onDelete(sig.id);
                toast('Signature removed', { icon: '🗑️' });
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Delete signature"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SignatureDropZone; 