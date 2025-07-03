import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';

const EditableSignatureField = ({ 
  field, 
  onUpdate, 
  onDelete, 
  scale = 1,
  isSelected = false,
  onSelect 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(field.rotation || 0);
  const [size, setSize] = useState({
    width: field.width || 180,
    height: field.height || 60
  });
  const [position, setPosition] = useState({
    x: field.x * scale,
    y: field.y * scale
  });

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect?.(field.id);
  };

  const handleDragStop = (e, d) => {
    setIsDragging(false);
    const newX = d.x / scale;
    const newY = d.y / scale;
    
    setPosition({ x: d.x, y: d.y });
    onUpdate({
      ...field,
      x: newX,
      y: newY,
      rotation,
      width: size.width,
      height: size.height
    });
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    onSelect?.(field.id);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    setIsResizing(false);
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;
    const newSize = {
      width: parseInt(newWidth),
      height: parseInt(newHeight)
    };
    
    setSize(newSize);
    setPosition(position);
    
    onUpdate({
      ...field,
      x: position.x / scale,
      y: position.y / scale,
      rotation,
      width: newSize.width,
      height: newSize.height
    });
  };

  const handleRotate = (direction) => {
    const newRotation = direction === 'left' 
      ? rotation - 15 
      : rotation + 15;
    
    setRotation(newRotation);
    onUpdate({
      ...field,
      x: position.x / scale,
      y: position.y / scale,
      rotation: newRotation,
      width: size.width,
      height: size.height
    });
  };

  const handleDelete = () => {
    onDelete(field.id);
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  return (
    <Rnd
      size={size}
      position={position}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      minWidth={80}
      minHeight={30}
      maxWidth={400}
      maxHeight={200}
      bounds="parent"
      className={`${isSelected ? 'z-50' : 'z-40'}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center'
      }}
    >
      <motion.div
        className={`relative w-full h-full ${
          isSelected 
            ? 'ring-2 ring-indigo-500 ring-opacity-50' 
            : 'ring-1 ring-gray-300 ring-opacity-30'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Signature Image */}
        {field.signature?.data ? (
          <img
            src={field.signature.data}
            alt="Signature"
            className="w-full h-full object-contain pointer-events-none"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              mixBlendMode: 'multiply'
            }}
          />
        ) : (
          <div className="w-full h-full bg-yellow-200 border-2 border-yellow-600 rounded flex items-center justify-center">
            <span className="font-semibold text-yellow-900 text-sm">Sign Here</span>
          </div>
        )}

        {/* Control Buttons - Only show when selected */}
        <AnimatePresence>
          {isSelected && (
            <>
              {/* Rotate Controls */}
              <motion.button
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                onClick={() => handleRotate('left')}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                aria-label="Rotate left"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>

              <motion.button
                className="absolute -top-8 right-1/2 transform translate-x-1/2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                onClick={() => handleRotate('right')}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                aria-label="Rotate right"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>

              {/* Delete Button */}
              <motion.button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                onClick={handleDelete}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                aria-label="Delete signature"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Rotation Display */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                {rotation}°
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Resize Handles - Always visible but subtle */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-500 rounded-full opacity-50 pointer-events-auto cursor-nw-resize" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full opacity-50 pointer-events-auto cursor-ne-resize" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-indigo-500 rounded-full opacity-50 pointer-events-auto cursor-sw-resize" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-indigo-500 rounded-full opacity-50 pointer-events-auto cursor-se-resize" />
        </div>
      </motion.div>
    </Rnd>
  );
};

export default EditableSignatureField; 