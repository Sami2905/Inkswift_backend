import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, y: -24, transition: { duration: 0.18, ease: 'easeIn' } },
};

const InviteSignersModal = ({ open, onClose, onInvite, signers, loading }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100, width: 180, height: 60, page: 1 });
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
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

  if (!open) return null;

  const handleInvite = (e) => {
    e.preventDefault();
    if (email && name && position) {
      onInvite({ email, name, position });
      setEmail('');
      setName('');
      setPosition({ x: 100, y: 100, width: 180, height: 60, page: 1 });
    }
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          aria-describedby="invite-modal-desc"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            tabIndex="-1"
            initial={{ scale: 0.98, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0, transition: { duration: 0.22 } }}
            exit={{ scale: 0.98, opacity: 0, y: -24, transition: { duration: 0.18 } }}
          >
            <motion.button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded" onClick={onClose} aria-label="Close invite modal" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>&times;</motion.button>
            <h2 id="invite-modal-title" className="text-xl font-semibold mb-4">Invite Signers</h2>
            <div id="invite-modal-desc" className="sr-only">Invite people to sign this document by email. You can copy their unique signing link after inviting.</div>
            <form onSubmit={handleInvite} className="flex flex-col gap-2 mb-4" aria-label="Invite signer form">
              <label htmlFor="invite-email" className="sr-only">Signer email</label>
              <input
                id="invite-email"
                name="email"
                ref={inputRef}
                type="email"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Signer email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Signer email"
              />
              <label htmlFor="invite-name" className="sr-only">Signer name</label>
              <input
                id="invite-name"
                name="name"
                type="text"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Signer name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                aria-label="Signer name"
              />
              <div className="flex flex-wrap gap-2">
                <label htmlFor="invite-x" className="sr-only">X position</label>
                <input id="invite-x" name="x" type="number" className="border rounded px-2 py-1 w-20" placeholder="X" value={position.x} onChange={e => setPosition(p => ({ ...p, x: Number(e.target.value) }))} aria-label="X position" />
                <label htmlFor="invite-y" className="sr-only">Y position</label>
                <input id="invite-y" name="y" type="number" className="border rounded px-2 py-1 w-20" placeholder="Y" value={position.y} onChange={e => setPosition(p => ({ ...p, y: Number(e.target.value) }))} aria-label="Y position" />
                <label htmlFor="invite-width" className="sr-only">Width</label>
                <input id="invite-width" name="width" type="number" className="border rounded px-2 py-1 w-20" placeholder="Width" value={position.width} onChange={e => setPosition(p => ({ ...p, width: Number(e.target.value) }))} aria-label="Width" />
                <label htmlFor="invite-height" className="sr-only">Height</label>
                <input id="invite-height" name="height" type="number" className="border rounded px-2 py-1 w-20" placeholder="Height" value={position.height} onChange={e => setPosition(p => ({ ...p, height: Number(e.target.value) }))} aria-label="Height" />
                <label htmlFor="invite-page" className="sr-only">Page number</label>
                <input id="invite-page" name="page" type="number" className="border rounded px-2 py-1 w-20" placeholder="Page" value={position.page} onChange={e => setPosition(p => ({ ...p, page: Number(e.target.value) }))} aria-label="Page number" />
              </div>
              <motion.button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={loading}
                aria-label="Send invite"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >Invite</motion.button>
            </form>
            <div>
              <h3 className="font-medium mb-2">Invited Signers</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {signers.length === 0 && <li className="text-gray-400">No signers invited yet.</li>}
                {signers.map(signer => (
                  <li key={signer.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                    <span>{signer.email}</span>
                    <span className={`text-xs ml-2 ${signer.status === 'signed' ? 'text-green-700' : 'text-yellow-700'}`}>{signer.status}</span>
                    {signer.link && (
                      <motion.button
                        className="ml-2 text-indigo-500 hover:underline text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                        onClick={() => handleCopy(signer.link, signer.id)}
                        aria-label={`Copy invite link for ${signer.email}`}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                      >{copiedId === signer.id ? 'Copied!' : 'Copy Link'}</motion.button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteSignersModal; 