import { create } from 'zustand';

export const useSignatureStore = create((set, get) => ({
  signatures: [],
  addSignature: (sig) => set(state => ({ signatures: [...state.signatures, sig] })),
  removeSignature: (id) => set(state => ({ signatures: state.signatures.filter(s => s.id !== id) })),
  updateSignature: (id, updates) => set(state => ({
    signatures: state.signatures.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  clearSignatures: () => set({ signatures: [] }),
  getSignatures: () => get().signatures,
})); 