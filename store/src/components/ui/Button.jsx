import { cn } from '../../lib/format';

// Reusable Button matching Perfu.me design language
// variants: primary (bg #1a1a1a), secondary (outline), ghost, pill, icon
export function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#1a1a1a] text-white hover:bg-[#333] border border-[#1a1a1a]',
    secondary: 'bg-white text-[#1a1a1a] border border-[#e0e0e0] hover:bg-[#f5f5f5]',
    outline: 'bg-transparent border border-black/60 text-black hover:bg-white/10',
    ghost: 'bg-transparent border border-transparent text-[#888] hover:text-[#111] hover:border-[#1a1a1a]',
    pill: 'bg-white text-[#888] border border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a] rounded-full',
    'pill-active': 'bg-[#1a1a1a] text-white border border-[#1a1a1a] rounded-full',
  };
  const sizes = {
    sm: 'text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded',
    md: 'text-[11px] uppercase tracking-[0.12em] px-6 py-3 rounded',
    pill: 'text-[10px] uppercase tracking-[0.14em] px-4 py-2 rounded-full',
    icon: 'w-9 h-9 rounded-lg border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a]',
    'icon-sm': 'w-8 h-8 rounded-full bg-white/80 border border-[#e6e6e6] text-[#555] hover:bg-white',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

// Helper for link styled as button
export function ButtonLink({ variant='secondary', size='sm', className, children, ...props}) {
  const base='inline-flex items-center justify-center font-sans font-medium no-underline transition-colors duration-200';
  const variants={
    secondary:'bg-white text-[#1a1a1a] border border-[#e0e0e0] hover:bg-[#f5f5f5]',
    primary:'bg-[#1a1a1a] text-white hover:bg-[#333]'
  };
  const sizes={ sm:'text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded text-center', md:'text-[11px] uppercase tracking-[0.12em] px-6 py-3 rounded' };
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props}>{children}</a>
}
