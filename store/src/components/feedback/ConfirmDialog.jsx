import { useEffect } from 'react';

export function ConfirmDialog({ open, title='Konfirmasi', message, confirmText='Hapus', cancelText='Batal', variant='danger', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-[#e6e6e6] shadow-[0_16px_40px_rgba(0,0,0,0.12)] w-full max-w-[420px] p-6 flex flex-col gap-4">
        <h3 className="font-sans text-[15px] font-semibold text-[#1a1a1a]">{title}</h3>
        {message && <p className="font-sans text-[12.5px] leading-[1.7] text-[#555]">{message}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded font-sans text-[11px] uppercase tracking-[0.12em] border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] hover:text-[#111] transition-colors cursor-pointer bg-white">{cancelText}</button>
          <button type="button" onClick={onConfirm} className={`px-5 py-2.5 rounded font-sans text-[11px] uppercase tracking-[0.12em] text-white border-none cursor-pointer transition-colors ${variant==='danger' ? 'bg-[#1a1a1a] hover:bg-[#333]' : 'bg-[#111] hover:bg-[#333]'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
