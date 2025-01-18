import React from 'react';
import { X } from 'lucide-react';

interface ChessModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function ChessModal({ children, onClose }: ChessModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-4xl">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}