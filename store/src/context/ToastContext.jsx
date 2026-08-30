import { createContext, useCallback, useContext, useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';

const ToastContext = createContext(null);
let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = 'default') => {
    const id = ++idSeq;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'default'),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, push, setToasts }}>
      {children}
      {/* Toast viewport - matches design language */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto min-w-[280px] max-w-[90vw] px-5 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border text-[12px] font-sans leading-relaxed flex items-center gap-2 ' +
              (t.variant === 'success'
                ? 'bg-[#111] text-white border-[#111]'
                : t.variant === 'error'
                  ? 'bg-white text-red-600 border-red-200'
                  : 'bg-white text-[#1a1a1a] border-[#e6e6e6]')
            }
            role="status"
          >
            {t.variant === 'success' && (
              <Check size={14} strokeWidth={2.5} />
            )}
            {t.variant === 'error' && (
              <CircleAlert size={14} strokeWidth={2} />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
