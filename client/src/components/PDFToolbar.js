import React from 'react';
import { motion } from 'framer-motion';

const PDFToolbar = ({ 
  pageNumber, 
  totalPages, 
  scale, 
  rotation, 
  onPageChange, 
  onScaleChange, 
  onRotationChange,
  onDownload,
  onPrint 
}) => {
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
  const rotationLevels = [0, 90, 180, 270];

  const buttonVariants = {
    hover: { scale: 1.05, y: -1 },
    tap: { scale: 0.95 },
  };

  const iconVariants = {
    hover: { rotate: 5 },
    tap: { rotate: -5 },
  };

  return (
    <motion.div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-2 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center space-x-4">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageNumber}
              onChange={(e) => onPageChange(parseInt(e.target.value) || 1)}
              className="w-12 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Page number"
            />
            <span className="text-sm text-gray-600">/ {totalPages}</span>
          </div>
          
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </motion.button>
          
          <select
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            aria-label="Zoom level"
          >
            {zoomLevels.map(level => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
          
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onScaleChange(Math.min(5, scale + 0.25))}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </motion.button>
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onRotationChange((rotation - 90 + 360) % 360)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Rotate counterclockwise"
          >
            <motion.svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </motion.svg>
          </motion.button>
          
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {rotation}°
          </span>
          
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => onRotationChange((rotation + 90) % 360)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Rotate clockwise"
          >
            <motion.svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </motion.svg>
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={onDownload}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Download document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={onPrint}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Print document"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFToolbar; 