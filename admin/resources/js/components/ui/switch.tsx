import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string;
    description?: string;
    labelClassName?: string;
}

export function Switch({
    checked,
    defaultChecked,
    onCheckedChange,
    label,
    description,
    disabled,
    className = '',
    labelClassName = '',
    id,
    ...props
}: SwitchProps) {
    const autoId = React.useId();
    const switchId = id ?? `switch-${autoId}`;
    const isControlled = checked !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
    const isOn = isControlled ? !!checked : uncontrolled;

    function toggle() {
        if (disabled) return;
        const next = !isOn;
        if (!isControlled) setUncontrolled(next);
        onCheckedChange?.(next);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
        }
    }

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <button
                id={switchId}
                type="button"
                role="switch"
                aria-checked={isOn}
                aria-label={label}
                disabled={disabled}
                onClick={toggle}
                onKeyDown={onKeyDown}
                className={cn(
                    'relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2',
                    isOn ? 'bg-[#1a1a1a]' : 'bg-[#e6e6e6]',
                    disabled && 'opacity-50 cursor-not-allowed',
                )}
                {...props}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] ring-0 transition duration-200 ease-in-out',
                        isOn ? 'translate-x-[18px]' : 'translate-x-[2px]',
                    )}
                />
            </button>
            {(label || description) && (
                <label htmlFor={switchId} className="flex flex-col cursor-pointer select-none" onClick={toggle}>
                    {label && <span className={cn('font-sans text-[12px] font-medium text-[#1a1a1a] leading-none', labelClassName)}>{label}</span>}
                    {description && <span className="font-sans text-[11px] text-[#888] leading-none mt-1">{description}</span>}
                </label>
            )}
        </div>
    );
}
