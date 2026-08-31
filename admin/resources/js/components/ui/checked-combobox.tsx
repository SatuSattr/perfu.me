import { Search, Check, X } from 'lucide-react';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface CheckedComboboxOption {
    code: string;
    name: string;
    count?: number;
}

export interface CheckedComboboxGroup {
    label: string;
    options: CheckedComboboxOption[];
    maxSelected?: number;
}

interface CheckedComboboxProps {
    label?: string;
    placeholder?: string;
    buttonLabel?: string;
    value: string[];
    onChange: (next: string[]) => void;
    options?: CheckedComboboxOption[];
    groups?: CheckedComboboxGroup[];
    maxSelected?: number;
    searchable?: boolean;
    className?: string;
    buttonClassName?: string;
}

export function CheckedCombobox({
    label,
    placeholder = '',
    buttonLabel = 'Filter',
    value,
    onChange,
    options = [],
    groups,
    maxSelected,
    searchable = true,
    className = '',
    buttonClassName = '',
}: CheckedComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const isSingleFlat = maxSelected === 1 && !groups;
    const activeCount = value.length;

    const filteredGroups = useMemo(() => {
        if (!groups) return null;
        if (!searchable || !query.trim()) return groups;
        const q = query.toLowerCase();
        return groups
            .map((g) => ({
                ...g,
                options: g.options.filter((o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)),
            }))
            .filter((g) => g.options.length > 0);
    }, [groups, query, searchable]);

    const filteredFlat = useMemo(() => {
        if (groups) return [];
        if (!searchable || !query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter((o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
    }, [options, query, searchable, groups]);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    function toggle(code: string, groupMax?: number) {
        const exists = value.includes(code);
        if (exists) {
            onChange(value.filter((v) => v !== code));
            return;
        }
        const effectiveMax = groupMax ?? maxSelected;
        if (effectiveMax === 1) {
            // Single per group or single overall: replace within group if grouped, else replace overall
            if (groups && groupMax === 1) {
                // Find which group this code belongs to
                const group = groups.find((g) => g.options.some((o) => o.code === code));
                if (group) {
                    const groupCodes = new Set(group.options.map((o) => o.code));
                    onChange([...value.filter((v) => !groupCodes.has(v)), code]);
                    return;
                }
            }
            if (isSingleFlat) {
                onChange([code]);
                return;
            }
        }
        if (groupMax !== undefined && groupMax !== 1) {
            const group = groups?.find((g) => g.options.some((o) => o.code === code));
            if (group) {
                const groupCodes = new Set(group.options.map((o) => o.code));
                const selectedInGroup = value.filter((v) => groupCodes.has(v)).length;
                if (selectedInGroup >= groupMax) return;
            }
        }
        if (maxSelected !== undefined && !isSingleFlat && value.length >= maxSelected) return;
        onChange([...value, code]);
    }

    const isSingleForOption = (groupMax?: number) => (groupMax ?? maxSelected) === 1 || isSingleFlat;

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={label ?? buttonLabel}
                className={cn(
                    'inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors duration-200',
                    open || activeCount > 0 ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-[#e6e6e6] text-[#666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
                    buttonClassName,
                )}
            >
                <SlidersHorizontal size={14} strokeWidth={1.5} className="shrink-0" />
                {buttonLabel}
                {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#1a1a1a] text-white text-[10px] font-medium leading-none">{activeCount}</span>
                )}
            </button>

            {open && (
                <div role="dialog" aria-label={label ?? buttonLabel} className="absolute right-0 top-full mt-2 w-[300px] sm:w-[340px] bg-white border border-[#e6e6e6] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-50 flex flex-col">
                    <div className="p-3">
                        {label && <p className="font-sans text-[11px] font-medium text-[#1a1a1a]">{label}</p>}
                        {searchable && (
                            <div className="relative mt-3">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={placeholder}
                                    autoFocus
                                    className="w-full border border-[#e6e6e6] rounded-lg pl-3 pr-8 py-2 font-sans text-[12px] text-[#1a1a1a] placeholder:text-[#aaa] outline-none focus:border-[#1a1a1a] focus:outline-none transition-colors duration-200"
                                />
                                <Search size={14} strokeWidth={1.8} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                            <span className="font-sans text-[11px] text-[#1a1a1a]">{activeCount} selected</span>
                            {activeCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onChange([])}
                                    className="inline-flex items-center gap-1 font-sans text-[11px] text-[#888] hover:text-[#1a1a1a] transition-colors"
                                >
                                    <X size={12} strokeWidth={1.8} />
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-[#f5f5f5] max-h-[260px] overflow-y-auto">
                        {groups ? (
                            filteredGroups && filteredGroups.length > 0 ? (
                                filteredGroups.map((group) => (
                                    <div key={group.label} className="py-2">
                                        <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa] px-3 py-1.5">{group.label}</p>
                                        {group.options.map((opt) => {
                                            const checked = value.includes(opt.code);
                                            const single = isSingleForOption(group.maxSelected);
                                            return (
                                                <label
                                                    key={opt.code}
                                                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#fafafa] cursor-pointer transition-colors"
                                                >
                                                    {single ? (
                                                        <>
                                                            <span className="flex-1 font-sans text-[12px] text-[#1a1a1a] truncate">{opt.name}</span>
                                                            {checked ? <Check size={14} strokeWidth={2} className="text-[#1a1a1a] shrink-0" /> : <span className="w-[14px] shrink-0" />}
                                                            <input type="checkbox" checked={checked} onChange={() => toggle(opt.code, group.maxSelected)} className="sr-only" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggle(opt.code, group.maxSelected)}
                                                                className="w-[15px] h-[15px] rounded border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 accent-[#1a1a1a]"
                                                            />
                                                            <span className="flex-1 font-sans text-[12px] text-[#1a1a1a] truncate">{opt.name}</span>
                                                        </>
                                                    )}
                                                    {opt.count !== undefined && <span className="font-sans text-[11px] text-[#888] min-w-[12px] text-right">{opt.count}</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <p className="font-sans text-[12px] text-[#aaa] text-center py-6">Tidak ada hasil</p>
                            )
                        ) : filteredFlat.length === 0 ? (
                            <p className="font-sans text-[12px] text-[#aaa] text-center py-6">Tidak ada hasil</p>
                        ) : (
                            filteredFlat.map((opt) => {
                                const checked = value.includes(opt.code);
                                const single = isSingleFlat;
                                return (
                                    <label
                                        key={opt.code}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#fafafa] cursor-pointer transition-colors"
                                    >
                                        {single ? (
                                            <>
                                                <span className="flex-1 font-sans text-[12px] text-[#1a1a1a] truncate">{opt.name}</span>
                                                {checked ? <Check size={14} strokeWidth={2} className="text-[#1a1a1a] shrink-0" /> : <span className="w-[14px] shrink-0" />}
                                                <input type="checkbox" checked={checked} onChange={() => toggle(opt.code)} className="sr-only" />
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggle(opt.code)}
                                                    className="w-[15px] h-[15px] rounded border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 accent-[#1a1a1a]"
                                                />
                                                <span className="flex-1 font-sans text-[12px] text-[#1a1a1a] truncate">{opt.name}</span>
                                            </>
                                        )}
                                        {opt.count !== undefined && <span className="font-sans text-[11px] text-[#888] min-w-[12px] text-right">{opt.count}</span>}
                                    </label>
                                );
                            })
                        )}
                    </div>

                    <div className="p-3 border-t border-[#f5f5f5] flex items-center justify-end">
                        <button type="button" onClick={() => setOpen(false)} className="font-sans text-[12px] font-medium text-[#1a1a1a] hover:text-[#888] px-2 py-1 transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
