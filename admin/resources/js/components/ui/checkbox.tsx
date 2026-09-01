import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: string;
    description?: string;
    error?: string;
    labelClassName?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
    label,
    description,
    error,
    id,
    className = '',
    labelClassName = '',
    checked,
    defaultChecked,
    disabled,
    onChange,
    onCheckedChange,
    ...props
}: CheckboxProps) {
    const autoId = React.useId();
    const inputId = id ?? `checkbox-${autoId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const isControlled = checked !== undefined;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={inputId} className={cn('flex items-start gap-2.5 cursor-pointer select-none group', disabled && 'opacity-50 cursor-not-allowed')}>
                <span className="relative flex shrink-0 mt-[3px]">
                    <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        defaultChecked={defaultChecked}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={errorId}
                        onChange={(e) => {
                            onChange?.(e);
                            onCheckedChange?.(e.target.checked);
                        }}
                        className="peer sr-only"
                        {...props}
                    />
                    <span
                        className={cn(
                            'w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-colors duration-200',
                            'bg-white border-[#e6e6e6] group-hover:border-[#1a1a1a]',
                            isControlled
                                ? checked
                                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                                    : 'bg-white'
                                : 'peer-checked:bg-[#1a1a1a] peer-checked:border-[#1a1a1a] peer-checked:text-white',
                            error && 'border-red-400 group-hover:border-red-400',
                            disabled && 'bg-[#f5f5f5] border-[#e6e6e6] group-hover:border-[#e6e6e6]',
                        )}
                    >
                        <Check
                            size={10}
                            strokeWidth={2.8}
                            className={cn(
                                'transition-opacity duration-200 text-white',
                                isControlled ? (checked ? 'opacity-100' : 'opacity-0') : 'opacity-0 peer-checked:opacity-100',
                            )}
                        />
                    </span>
                </span>
                {(label || description) && (
                    <span className="flex-1 min-w-0 leading-[1.5]">
                        {label && <span className={cn('font-sans text-[12px] text-[#1a1a1a]', labelClassName)}>{label}</span>}
                        {description && <span className="font-sans text-[12px] text-[#888]"> — {description}</span>}
                    </span>
                )}
            </label>
            {error && (
                <span id={errorId} className="font-sans text-[11px] text-red-500 ml-[26px]" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
