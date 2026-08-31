import * as React from 'react';

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <span className={`font-sans text-[9px] uppercase tracking-[0.2em] text-[#aaa] ${className}`}>{children}</span>;
}

export function Heading({ level = 2, children, className = '' }: { level?: 1 | 2 | 3; children: React.ReactNode; className?: string }) {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
    const sizes: Record<number, string> = {
        1: 'font-sans text-[28px] font-semibold tracking-tight text-[#1a1a1a] leading-tight',
        2: 'font-sans text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[0.01em] text-[#1a1a1a] leading-none',
        3: 'font-sans text-[18px] font-semibold text-[#1a1a1a]',
    };
    return <Tag className={`${sizes[level] ?? sizes[2]} ${className}`}>{children}</Tag>;
}

export function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`font-sans text-[12.5px] leading-[1.9] text-[#666] ${className}`}>{children}</p>;
}

export function Price({ value, className = '' }: { value: number | string; className?: string }) {
    return <span className={`font-sans text-[0.85rem] text-[#1a1a1a] font-medium ${className}`}>{'Rp ' + Number(value).toLocaleString('id-ID')}</span>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#aaa] mb-2">{children}</p>;
}
