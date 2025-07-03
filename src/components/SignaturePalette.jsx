import React from 'react';

const SignaturePalette = ({ signatures, onAddSignature, onSelectSignature, selectedSignatureId }) => {
  return (
    <div className="w-64 bg-white border-r h-full flex flex-col p-4 fixed left-0 top-0 z-40 shadow-xl" style={{ height: '100vh' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Signatures</h3>
        <button
          className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={onAddSignature}
        >
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {signatures.length === 0 && <div className="text-gray-400 text-sm">No signatures yet.</div>}
        {signatures.map(sig => (
          <div
            key={sig.id}
            className={`border rounded p-2 flex items-center space-x-3 bg-gray-50 cursor-pointer transition-all hover:shadow ${selectedSignatureId === sig.id ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:ring-1 hover:ring-indigo-300'}`}
            onClick={() => onSelectSignature(sig)}
          >
            <img src={sig.data} alt="Signature preview" className="h-10 w-auto object-contain bg-white border rounded" />
            <div>
              <div className="font-medium text-sm">{sig.name}</div>
              <div className="text-xs text-gray-500">{sig.type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignaturePalette; 