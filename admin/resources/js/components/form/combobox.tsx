import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ComboboxOption {
    code: string;
    name: string;
}

interface ComboboxProps {
    label?: string;
    placeholder?: string;
    value?: ComboboxOption | null;
    onSelect: (opt: ComboboxOption) => void;
    options?: ComboboxOption[];
    error?: string;
    disabled?: boolean;
    typeable?: boolean;
    id?: string;
}

export function Combobox({ label, placeholder, value, onSelect, options = [], error, disabled, typeable = true, id }: ComboboxProps) {
    const [query, setQuery] = useState(value?.name || '');
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const inputId = id || (label ? `combobox-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    useEffect(() => {
        setQuery(value?.name || '');
    }, [value]);

    const filtered = !typeable ? options : query.trim() ? options.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase())) : options;

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filtered.length, query, typeable]);
    useEffect(() => {
        if (!open) setHighlightedIndex(-1);
    }, [open]);

    useEffect(() => {
        if (open && highlightedIndex >= 0 && listRef.current) {
            const el = listRef.current.children[highlightedIndex] as HTMLElement;
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, open]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (disabled) return;
        const hasOptions = filtered.length > 0;
        if (e.key === 'ArrowDown') {
            if (!hasOptions) return;
            e.preventDefault();
            if (!open) {
                setOpen(true);
                setHighlightedIndex(0);
            } else {
                setHighlightedIndex((prev) => (prev + 1) % filtered.length);
            }
        } else if (e.key === 'ArrowUp') {
            if (!hasOptions) return;
            e.preventDefault();
            if (!open) {
                setOpen(true);
                setHighlightedIndex(filtered.length - 1);
            } else {
                setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
            }
        } else if (e.key === 'Enter') {
            if (open && hasOptions && highlightedIndex >= 0 && filtered[highlightedIndex]) {
                e.preventDefault();
                const selected = filtered[highlightedIndex];
                onSelect(selected);
                setQuery(selected.name);
                setOpen(false);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setHighlightedIndex(-1);
        }
    }

    return (
        <div className="flex flex-col" ref={containerRef}>
            {label && (
                <label htmlFor={inputId} className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type="text"
                    placeholder={disabled ? 'Pilih sebelumnya dulu' : placeholder}
                    disabled={disabled}
                    readOnly={!typeable}
                    value={query}
                    onChange={typeable ? (e) => { setQuery(e.target.value); setOpen(true); } : undefined}
                    onFocus={() => { if (!disabled && typeable && filtered.length > 0) setOpen(true); }}
                    onClick={() => { if (!disabled && !typeable && filtered.length > 0) setOpen((v) => !v); }}
                    onKeyDown={handleKeyDown}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="combobox-listbox"
                    aria-autocomplete={typeable ? 'list' : 'none'}
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                    className={`w-full border rounded-lg px-4 py-3 pr-9 text-[13px] font-sans text-[#111] outline-none transition-colors duration-200 bg-white placeholder:text-[#bbb] ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#111]'} ${disabled ? 'opacity-50 cursor-not-allowed bg-[#f9f9f9]' : 'cursor-pointer'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#aaa]">
                    <ChevronDown size={14} strokeWidth={2} />
                </span>
                {open && !disabled && filtered.length > 0 && (
                    <ul id="combobox-listbox" ref={listRef} role="listbox" className="absolute z-30 left-0 right-0 mt-1 bg-white border border-black/12 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-[220px] overflow-auto">
                        {filtered.map((o, idx) => (
                            <li
                                key={o.code}
                                role="option"
                                aria-selected={highlightedIndex === idx}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                                onMouseDown={(e) => { e.preventDefault(); onSelect(o); setQuery(o.name); setOpen(false); }}
                                className={`px-4 py-2.5 text-[13px] font-sans text-[#111] cursor-pointer transition-colors duration-200 ${highlightedIndex === idx ? 'bg-[#f5f5f5]' : 'hover:bg-[#f5f5f5]'}`}
                            >
                                {o.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {error && (
                <span id={errorId} className="mt-1.5 font-sans text-[11px] text-red-500" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
