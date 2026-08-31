import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
    className?: string;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'danger',
    onConfirm,
    onCancel,
    className = '',
}: ConfirmDialogProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!mounted || !open) return null;

    const overlay = (
        <div
            className={cn('fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4', className)}
            role="dialog"
            aria-modal="true"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl border border-[#e6e6e6] p-6 w-full max-w-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">{title}</h3>
                <p className="font-sans text-[12.5px] text-[#666] leading-[1.7] mt-2">{message}</p>
                <div className="flex items-center justify-end gap-2 mt-6">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} size="sm" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
}
