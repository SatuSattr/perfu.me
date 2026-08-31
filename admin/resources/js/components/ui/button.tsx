import * as React from 'react';
import { cn } from '@/lib/utils';

// Re-export capsule for convenience but keep Button as the canonical rounded-full API
// All admin buttons MUST be capsule (rounded-full) — no square variants allowed.
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill' | 'pill-active';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    // escape hatch for full customization — each token appended last so it wins via tailwind-merge
    background?: string;
    color?: string;
    outline?: string;
    hover?: string;
}

const base =
    'inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.12em] rounded-full transition-colors duration-200 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
    primary: 'bg-[#1a1a1a] text-white border border-[#1a1a1a] hover:bg-[#333] hover:border-[#333]',
    secondary: 'bg-white text-[#1a1a1a] border border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
    outline: 'bg-white text-[#666] border border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
    ghost: 'bg-transparent text-[#888] border border-transparent hover:text-[#1a1a1a] hover:border-[#1a1a1a]',
    danger: 'bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600',
    pill: 'bg-white text-[#888] border border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
    'pill-active': 'bg-[#1a1a1a] text-white border border-[#1a1a1a]',
};

const sizes: Record<Size, string> = {
    sm: 'text-[11px] gap-1.5 px-3 py-1.5',
    md: 'text-[11px] gap-1.5 px-4 py-2',
    lg: 'text-[11px] gap-2 px-5 py-2.5',
    // keep legacy pill name but all are rounded-full
    pill: 'text-[10px] gap-1.5 px-4 py-2',
    icon: 'w-8 h-8 p-0 gap-0',
    'icon-sm': 'w-7 h-7 p-0 gap-0',
};

export function Button({
    variant = 'primary',
    size = 'md',
    background,
    color,
    outline,
    hover,
    type = 'button',
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(base, variants[variant], sizes[size], background, color, outline, hover, className)}
            {...props}
        >
            {children}
        </button>
    );
}

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: Variant;
    size?: Size;
    background?: string;
    color?: string;
    outline?: string;
    hover?: string;
}

export function ButtonLink({
    variant = 'secondary',
    size = 'md',
    background,
    color,
    outline,
    hover,
    className,
    children,
    ...props
}: ButtonLinkProps) {
    return (
        <a
            className={cn(base, variants[variant], sizes[size], 'no-underline', background, color, outline, hover, className)}
            {...props}
        >
            {children}
        </a>
    );
}

// Backwards compat: existing code may import from capsule-button directly
export { CapsuleButton } from './capsule-button';
export { CapsuleLink } from './capsule-button';
