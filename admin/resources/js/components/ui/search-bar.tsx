import { Search } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'Search', className = '', ...props }: SearchBarProps) {
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
        }
    }

    return (
        <div
            className={cn(
                'flex items-stretch overflow-hidden rounded-full border bg-white transition-colors duration-200 focus-within:border-[#1a1a1a]',
                'border-[#e6e6e6] w-full h-10',
                className,
            )}
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                aria-label="Search"
                className="flex-1 min-w-0 border-none bg-transparent px-5 font-sans text-[13px] text-[#1a1a1a] placeholder:text-[#aaa] outline-none h-full"
                {...props}
            />
            <button
                type="button"
                onClick={onSearch}
                aria-label="Cari"
                className="shrink-0 self-stretch flex items-center justify-center px-5 sm:px-6 bg-[#f5f5f5] border-l border-[#e6e6e6] hover:bg-[#f0f0f0] hover:text-[#1a1a1a] text-[#555] transition-colors duration-200"
            >
                <Search size={16} strokeWidth={1.8} className="shrink-0" />
            </button>
        </div>
    );
}
