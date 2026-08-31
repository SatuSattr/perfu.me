import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types/auth';

export function Footer({ className = '' }: { className?: string }) {
    const { ip } = usePage<SharedProps>().props;

    return (
        <footer className={cn('border-t border-black/[0.06] bg-white', className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[44px] flex items-center justify-between gap-4">
                <p className="font-sans text-[11px] text-[#bbb]">&copy; 2026 Perfu.me</p>
                <p className="font-sans text-[11px] tracking-[0.08em] text-[#888]">
                    <span className="uppercase text-[#aaa] text-[10px] tracking-[0.12em]">IP</span>{' '}
                    <span className="font-mono text-[#888]">{ip ?? '-'}</span>
                </p>
            </div>
        </footer>
    );
}
