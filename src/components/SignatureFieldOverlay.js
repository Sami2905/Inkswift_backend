import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const HANDLE_SIZE = 44; // Minimum touch target size

const SignatureFieldOverlay = ({ field, onMove, onUpdate, onRemove, onSelect, scale = 1, selected }) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState(null);
  const [rotationStart, setRotationStart] = useState(null);
  const ref = useRef();

  // Move logic
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDragging(true);
    setOffset({
      x: e.clientX - field.x * scale,
      y: e.clientY - field.y * scale,
    });
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };
  // Touch drag
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    e.stopPropagation();
    setDragging(true);
    setOffset({
      x: e.touches[0].clientX - field.x * scale,
      y: e.touches[0].clientY - field.y * scale,
    });
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };
  const handleTouchMove = (e) => {
    if (!dragging || !e.touches || e.touches.length !== 1) return;
    const newX = (e.touches[0].clientX - offset.x) / scale;
    const newY = (e.touches[0].clientY - offset.y) / scale;
    onMove({ ...field, x: newX, y: newY });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newX = (e.clientX - offset.x) / scale;
      const newY = (e.clientY - offset.y) / scale;
      onMove({ ...field, x: newX, y: newY });
    } else if (resizing && resizeDir) {
      const rect = ref.current.getBoundingClientRect();
      let newWidth = field.width;
      let newHeight = field.height;
      let newX = field.x;
      let newY = field.y;
      if (resizeDir === 'se') {
        newWidth = Math.max(40, (e.clientX - rect.left) / scale);
        newHeight = Math.max(20, (e.clientY - rect.top) / scale);
      } else if (resizeDir === 'sw') {
        newWidth = Math.max(40, (rect.right - e.clientX) / scale);
        newHeight = Math.max(20, (e.clientY - rect.top) / scale);
        newX = field.x + (field.width - newWidth);
      } else if (resizeDir === 'ne') {
        newWidth = Math.max(40, (e.clientX - rect.left) / scale);
        newHeight = Math.max(20, (rect.bottom - e.clientY) / scale);
        newY = field.y + (field.height - newHeight);
      } else if (resizeDir === 'nw') {
        newWidth = Math.max(40, (rect.right - e.clientX) / scale);
        newHeight = Math.max(20, (rect.bottom - e.clientY) / scale);
        newX = field.x + (field.width - newWidth);
        newY = field.y + (field.height - newHeight);
      }
      onUpdate(field.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    } else if (rotating && rotationStart) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      let rotation = angle - rotationStart.offset;
      if (rotation < 0) rotation += 360;
      onUpdate(field.id, { rotation });
    }
  };
  // Touch resize/rotate (not full multi-touch, but basic support)
  const handleResizeTouchStart = (dir) => (e) => {
    e.stopPropagation();
    setResizing(true);
    setResizeDir(dir);
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };
  const handleRotateTouchStart = (e) => {
    e.stopPropagation();
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches ? e.touches[0] : e;
    const startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    setRotating(true);
    setRotationStart({ offset: startAngle - (field.rotation || 0) });
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };
  const handleTouchMoveResize = (e) => {
    if (!resizing || !resizeDir || !e.touches || !e.touches[0]) return;
    const rect = ref.current.getBoundingClientRect();
    let newWidth = field.width;
    let newHeight = field.height;
    let newX = field.x;
    let newY = field.y;
    const touch = e.touches[0];
    if (resizeDir === 'se') {
      newWidth = Math.max(40, (touch.clientX - rect.left) / scale);
      newHeight = Math.max(20, (touch.clientY - rect.top) / scale);
    } else if (resizeDir === 'sw') {
      newWidth = Math.max(40, (rect.right - touch.clientX) / scale);
      newHeight = Math.max(20, (touch.clientY - rect.top) / scale);
      newX = field.x + (field.width - newWidth);
    } else if (resizeDir === 'ne') {
      newWidth = Math.max(40, (touch.clientX - rect.left) / scale);
      newHeight = Math.max(20, (rect.bottom - touch.clientY) / scale);
      newY = field.y + (field.height - newHeight);
    } else if (resizeDir === 'nw') {
      newWidth = Math.max(40, (rect.right - touch.clientX) / scale);
      newHeight = Math.max(20, (rect.bottom - touch.clientY) / scale);
      newX = field.x + (field.width - newWidth);
      newY = field.y + (field.height - newHeight);
    }
    onUpdate(field.id, { width: newWidth, height: newHeight, x: newX, y: newY });
  };
  const handleTouchEndResize = () => {
    setResizing(false);
    setResizeDir(null);
    document.body.style.userSelect = '';
  };
  const handleTouchMoveRotate = (e) => {
    if (!rotating || !rotationStart || !e.touches || !e.touches[0]) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touch = e.touches[0];
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    let rotation = angle - rotationStart.offset;
    if (rotation < 0) rotation += 360;
    onUpdate(field.id, { rotation });
  };
  const handleTouchEndRotate = () => {
    setRotating(false);
    setRotationStart(null);
    document.body.style.userSelect = '';
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    setRotating(false);
    setResizeDir(null);
    setRotationStart(null);
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (dragging || resizing || rotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
      window.addEventListener('touchmove', handleTouchMoveResize, { passive: false });
      window.addEventListener('touchend', handleTouchEndResize, { passive: false });
      window.addEventListener('touchmove', handleTouchMoveRotate, { passive: false });
      window.addEventListener('touchend', handleTouchEndRotate, { passive: false });
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMoveResize);
      window.removeEventListener('touchend', handleTouchEndResize);
      window.removeEventListener('touchmove', handleTouchMoveRotate);
      window.removeEventListener('touchend', handleTouchEndRotate);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMoveResize);
      window.removeEventListener('touchend', handleTouchEndResize);
      window.removeEventListener('touchmove', handleTouchMoveRotate);
      window.removeEventListener('touchend', handleTouchEndRotate);
    };
  });

  // Resize handle logic
  const handleResizeDown = (dir) => (e) => {
    e.stopPropagation();
    setResizing(true);
    setResizeDir(dir);
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };

  // Rotation handle logic
  const handleRotateDown = (e) => {
    e.stopPropagation();
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    setRotating(true);
    setRotationStart({ offset: startAngle - (field.rotation || 0) });
    document.body.style.userSelect = 'none';
    if (onSelect) onSelect(field.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(field.id);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') onMove({ ...field, y: field.y - 2 });
    if (e.key === 'ArrowDown') onMove({ ...field, y: field.y + 2 });
    if (e.key === 'ArrowLeft') onMove({ ...field, x: field.x - 2 });
    if (e.key === 'ArrowRight') onMove({ ...field, x: field.x + 2 });
    if (e.key === 'Delete' || e.key === 'Backspace') handleDelete(e);
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute select-none shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 group ${selected ? 'ring-4 ring-indigo-300' : ''}`}
      style={{
        left: field.x * scale,
        top: field.y * scale,
        zIndex: 10,
        cursor: dragging ? 'grabbing' : 'grab',
        width: (field.width || 180) * scale,
        height: (field.height || 60) * scale,
        transform: `rotate(${field.rotation || 0}deg) scale(${scale})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="button"
      tabIndex={0}
      aria-label="Move signature field"
      onKeyDown={handleKeyDown}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect && onSelect(field.id)}
      title="Drag to move. Use Tab/Arrows for keyboard."
    >
      {/* Signature Image */}
      {field.signature?.data ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={field.signature.data}
            alt="Signature"
            className="max-w-full max-h-full pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
          {/* Delete Button */}
          <motion.button
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }}
            onClick={handleDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Delete signature field"
            title="Delete signature"
            tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          {/* Resize Handles */}
          {['nw', 'ne', 'sw', 'se'].map(dir => (
            <div
              key={dir}
              className={`absolute bg-white border border-indigo-400 rounded-full cursor-${dir}-resize focus:ring-2 focus:ring-indigo-400`}
              style={{
                left: dir.includes('w') ? -HANDLE_SIZE / 2 : undefined,
                right: dir.includes('e') ? -HANDLE_SIZE / 2 : undefined,
                top: dir.includes('n') ? -HANDLE_SIZE / 2 : undefined,
                bottom: dir.includes('s') ? -HANDLE_SIZE / 2 : undefined,
                zIndex: 20,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                minWidth: 44,
                minHeight: 44,
              }}
              onMouseDown={handleResizeDown(dir)}
              onTouchStart={handleResizeTouchStart(dir)}
              tabIndex={0}
              aria-label={`Resize ${dir}`}
              title={`Resize (${dir.toUpperCase()})`}
            />
          ))}
          {/* Rotation Handle */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow focus:ring-2 focus:ring-indigo-400"
            style={{ zIndex: 20, width: HANDLE_SIZE, height: HANDLE_SIZE, minWidth: 44, minHeight: 44 }}
            onMouseDown={handleRotateDown}
            onTouchStart={handleRotateTouchStart}
            tabIndex={0}
            aria-label="Rotate signature"
            title="Rotate signature"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 17a7 7 0 1 0 7-7" />
            </svg>
          </div>
        </div>
      ) : (
        /* Placeholder for signature field */
        <div className="bg-yellow-200 border-2 border-yellow-600 rounded px-4 py-2 min-w-[120px] text-center w-full h-full flex items-center justify-center">
          <span className="font-semibold text-yellow-900 text-sm">Sign Here</span>
        </div>
      )}
      {/* Drag Handle Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-transparent group-hover:bg-indigo-50/20 transition-colors pointer-events-none" />
    </motion.div>
  );
};

export default SignatureFieldOverlay; 