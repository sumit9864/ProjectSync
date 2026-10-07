import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={`relative my-auto flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden ${maxWidth} rounded-2xl bg-white shadow-xl animate-scale-in dark:bg-ink-900 dark:border dark:border-ink-700 sm:max-h-[calc(100dvh-3rem)]`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-6 py-4 dark:border-ink-800">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors dark:text-ink-500 dark:hover:text-ink-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
