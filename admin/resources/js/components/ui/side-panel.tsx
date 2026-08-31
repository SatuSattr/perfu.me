import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Width = 'sm' | 'md' | 'lg';

interface SidePanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: Width;
    closeOnOutsideClick?: boolean;
    closeOnEsc?: boolean;
    className?: string;
}

const widthMap: Record<Width, string> = {
    sm: 'sm:w-[380px]',
    md: 'sm:w-[420px]',
    lg: 'sm:w-[560px]',
};

export function SidePanel({
    open,
    onOpenChange,
    title,
    subtitle,
    children,
    footer,
    width = 'md',
    closeOnOutsideClick = true,
    closeOnEsc = true,
    className = '',
}: SidePanelProps) {
    const [mounted, setMounted] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // body scroll lock
    React.useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    // animation state
    React.useEffect(() => {
        if (open) {
            // next tick to allow transition
            const t = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [open]);

    // focus first input on open
    React.useEffect(() => {
        if (open && visible) {
            const el = panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button');
            el?.focus();
        }
    }, [open, visible]);

    // esc
    React.useEffect(() => {
        if (!open || !closeOnEsc) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, closeOnEsc, onOpenChange]);

    if (!mounted) return null;
    if (!open && !visible) return null;

    const overlay = (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
            {/* backdrop */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200',
                    visible ? 'opacity-100' : 'opacity-0',
                )}
                onClick={() => {
                    if (closeOnOutsideClick) onOpenChange(false);
                }}
                aria-hidden="true"
            />
            {/* panel */}
            <div
                ref={panelRef}
                className={cn(
                    'relative flex h-full w-full bg-white border-l border-[#e6e6e6] shadow-[-8px_0_24px_rgba(0,0,0,0.12)] flex-col transition-transform duration-200 ease-out',
                    widthMap[width],
                    visible ? 'translate-x-0' : 'translate-x-full',
                    className,
                )}
            >
                {/* header */}
                {(title || subtitle) && (
                    <div className="flex items-center justify-between gap-4 px-6 h-[60px] border-b border-[#e6e6e6] shrink-0">
                        <div className="min-w-0">
                            {title && (
                                <h2 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a] truncate">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="font-sans text-[11px] text-[#888] truncate mt-0.5">{subtitle}</p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onOpenChange(false)}
                            aria-label="Tutup"
                            className="shrink-0"
                        >
                            <X size={14} strokeWidth={1.8} />
                        </Button>
                    </div>
                )}

                {/* body */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {/* footer */}
                {footer && (
                    <div className="shrink-0 border-t border-[#e6e6e6] bg-white p-4 flex items-center justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
}
