export function Badge({ children, className = '' }) {
  return (
    <span
      className={`font-sans text-[9px] uppercase tracking-[0.12em] text-[#888] bg-[#f5f5f5] px-2 py-1 rounded shrink-0 ${className}`}
    >
      {children}
    </span>
  );
}

export function Pill({ children, className = '' }) {
  return (
    <span className={`font-sans text-[9px] uppercase tracking-[0.16em] text-[#888] border border-[#e6e6e6] rounded-full px-3 py-1 ${className}`}>
      {children}
    </span>
  );
}

export function CategoryBadge({ children }) {
  return <Badge>{children}</Badge>;
}
