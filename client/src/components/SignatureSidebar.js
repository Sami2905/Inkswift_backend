import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureInputModal from './SignatureInputModal';

const SignatureSidebar = ({ 
  signatures, 
  onAddSignature, 
  onSelectSignature, 
  onDeleteSignature,
  selectedSignature,
  onClearAll,
  placedField
}) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [activeTab, setActiveTab] = useState('signatures');

  const containerVariants = {
    hidden: { x: 300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.3, 
        ease: 'easeOut',
        staggerChildren: 0.1
      } 
    },
    exit: { x: 300, opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  const buttonVariants = {
    hover: { scale: 1.02, y: -1 },
    tap: { scale: 0.98 }
  };

  const handleSaveSignature = (signatureData, type) => {
    const newSignature = {
      id: Date.now(),
      data: signatureData,
      type,
      createdAt: new Date().toISOString(),
      name: `Signature ${signatures.length + 1}`
    };
    onAddSignature(newSignature);
    setShowSignatureModal(false);
  };

  const handleDeleteSignature = (signatureId) => {
    onDeleteSignature(signatureId);
  };

  return (
    <>
      <motion.div
        className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-30 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4">
          <h2 className="text-lg font-semibold">Signature Tools</h2>
          <p className="text-indigo-100 text-sm">Create and manage your signatures</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <motion.button
            className={`flex-1 py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              activeTab === 'signatures' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('signatures')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Signatures
          </motion.button>
          <motion.button
            className={`flex-1 py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              activeTab === 'tools' 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('tools')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Tools
          </motion.button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-300 ${placedField ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'signatures' && (
              <motion.div
                key="signatures"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Add Signature Button */}
                <motion.button
                  className="w-full mb-4 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
                  onClick={() => setShowSignatureModal(true)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create New Signature</span>
                  </div>
                </motion.button>

                {/* Signatures List */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {signatures.map((signature) => (
                      <motion.div
                        key={signature.id}
                        className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSignature?.id === signature.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => onSelectSignature(signature)}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {signature.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {signature.type} • {new Date(signature.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <motion.button
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSignature(signature.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Delete signature"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                        
                        {/* Signature Preview */}
                        <div className="mt-2 flex justify-center">
                          <img
                            src={signature.data}
                            alt="Signature preview"
                            className="max-h-12 max-w-full object-contain"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {signatures.length === 0 && (
                    <motion.div
                      className="text-center py-8 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p className="text-sm">No signatures yet</p>
                      <p className="text-xs">Create your first signature to get started</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <motion.button
                      className="w-full py-2 px-3 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={() => setShowSignatureModal(true)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Draw Signature
                    </motion.button>
                    <motion.button
                      className="w-full py-2 px-3 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={() => setShowSignatureModal(true)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Type Signature
                    </motion.button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-900 mb-2">Document Actions</h3>
                  <div className="space-y-2">
                    <motion.button
                      className="w-full py-2 px-3 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      onClick={onClearAll}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Clear All Fields
                    </motion.button>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Tips</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Double-click on the PDF to add signature fields</li>
                    <li>• Drag signature fields to reposition them</li>
                    <li>• Use keyboard arrows for precise positioning</li>
                    <li>• Save multiple signatures for quick access</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {placedField && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="bg-white/80 rounded-lg shadow p-4 border border-indigo-300 text-indigo-700 font-semibold">
                Signature placed. Remove it to add another.
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Signature Input Modal */}
      <SignatureInputModal
        open={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSaveSignature}
      />
    </>
  );
};

export default SignatureSidebar; 