import * as React from 'react';
import { cn } from '@/lib/utils';

type CtaButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    background?: string;
    color?: string;
    outline?: string;
    fontSize?: string;
    fontWeight?: string;
    tracking?: string;
    rounded?: string;
    hover?: string;
};

export function CtaButton({
    children,
    background = 'bg-white',
    color = 'text-[#111]',
    outline = 'border border-transparent',
    fontSize = 'text-[10px]',
    fontWeight = 'font-medium',
    tracking = 'tracking-[0.15em]',
    rounded = 'rounded',
    hover = '',
    className = '',
    ...props
}: CtaButtonProps) {
    const base = 'inline-block px-6 py-2.5 font-sans uppercase no-underline transition-colors duration-200';
    return (
        <a className={cn(base, background, color, outline, fontSize, fontWeight, tracking, rounded, hover, className)} {...props}>
            {children}
        </a>
    );
}

interface GroupProps {
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
    primaryBackground?: string; primaryColor?: string; primaryOutline?: string; primaryFontSize?: string; primaryFontWeight?: string; primaryHover?: string;
    secondaryBackground?: string; secondaryColor?: string; secondaryOutline?: string; secondaryFontSize?: string; secondaryFontWeight?: string; secondaryHover?: string;
    className?: string;
}

export function CtaButtonGroup({
    primaryHref = '#',
    primaryLabel = 'Jelajahi Koleksi',
    secondaryHref = '#',
    secondaryLabel = 'Jadi Reseller',
    primaryBackground = 'bg-white', primaryColor = 'text-[#111]', primaryOutline = 'border border-transparent', primaryFontSize = 'text-[10px]', primaryFontWeight = 'font-medium', primaryHover = 'hover:bg-white/90',
    secondaryBackground = 'bg-transparent', secondaryColor = 'text-white', secondaryOutline = 'border border-white/60', secondaryFontSize = 'text-[10px]', secondaryFontWeight = 'font-medium', secondaryHover = 'hover:bg-white/10',
    className = '',
}: GroupProps) {
    return (
        <div className={`flex gap-3 flex-wrap ${className}`}>
            <CtaButton href={primaryHref} background={primaryBackground} color={primaryColor} outline={primaryOutline} fontSize={primaryFontSize} fontWeight={primaryFontWeight} hover={primaryHover}>{primaryLabel}</CtaButton>
            <CtaButton href={secondaryHref} background={secondaryBackground} color={secondaryColor} outline={secondaryOutline} fontSize={secondaryFontSize} fontWeight={secondaryFontWeight} hover={secondaryHover}>{secondaryLabel}</CtaButton>
        </div>
    );
}

export const HeroActions = CtaButtonGroup;
