import { Link } from '@inertiajs/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string | React.ReactNode;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    className?: string;
}

export interface PaginationMeta {
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total?: number;
    per_page?: number;
    from?: number | null;
    to?: number | null;
}

interface TableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    data: T[];
    emptyText?: string;
    emptyColSpan?: number;
    pagination?: PaginationMeta | null;
    hidePagination?: boolean;
    paginationLabel?: string;
    paginationMetaText?: string;
    maxHeight?: string;
    stickyHeader?: boolean;
    className?: string;
    wrapperClassName?: string;
    tableClassName?: string;
    rowKey?: keyof T | ((row: T, index: number) => string | number);
    getRowClassName?: (row: T, index: number) => string;
    onRowClick?: (row: T, index: number) => void;
}

function PaginationFooter({ pagination, paginationLabel, paginationMetaText }: { pagination: PaginationMeta; paginationLabel?: string; paginationMetaText?: string }) {
    const isMulti = pagination.last_page > 1;

    if (isMulti) {
        const meta = paginationMetaText ?? `Hal ${pagination.current_page} dari ${pagination.last_page} · ${pagination.total ?? ''} ${paginationLabel ?? 'data'}`.trim();
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e6e6e6] bg-[#fafafa]/50 px-4 py-3">
                <span className="font-sans text-[11px] text-[#888]">{meta}</span>
                <div className="flex items-center gap-1 flex-wrap justify-center">
                    {pagination.links.map((link, i) => {
                        const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                        const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                        const label = isPrev ? 'Prev' : isNext ? 'Next' : link.label.replace(/&[^;]+;/g, '').trim();
                        return (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                preserveScroll
                                className={cn(
                                    'min-w-[36px] h-8 px-3 inline-flex items-center justify-center rounded-full font-sans text-[12px] border transition-colors duration-200',
                                    link.active
                                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                        : 'bg-white text-[#666] border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
                                    !link.url && 'opacity-40 pointer-events-none',
                                )}
                            >
                                <span dangerouslySetInnerHTML={{ __html: label }} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    const singleMeta = paginationMetaText ?? `${pagination.total ?? ''} ${paginationLabel ?? 'data'} · Hal 1 dari 1`.trim();
    // fallback simple single page footer like products/index
    return (
        <div className="flex items-center justify-between border-t border-[#e6e6e6] bg-[#fafafa]/50 px-4 py-3">
            <span className="font-sans text-[11px] text-[#888]">{paginationMetaText ?? singleMeta}</span>
            <span className="font-sans text-[11px] text-[#aaa]">—</span>
        </div>
    );
}

export function Table<T extends Record<string, unknown>>({
    columns = [],
    data = [],
    emptyText = 'Tidak ada data.',
    pagination = null,
    hidePagination = false,
    paginationLabel,
    paginationMetaText,
    maxHeight,
    stickyHeader = false,
    className = '',
    wrapperClassName = '',
    tableClassName = '',
    rowKey,
    getRowClassName,
    onRowClick,
}: TableProps<T>) {
    const scrollClass = maxHeight ? `overflow-y-auto overflow-x-auto` : 'overflow-x-auto';
    const scrollStyle = maxHeight ? { maxHeight } : undefined;

    const showPagination = !hidePagination && pagination != null;

    return (
        <div className={cn('border border-[#e6e6e6] rounded-2xl overflow-hidden bg-white', wrapperClassName, className)}>
            <div className={cn(scrollClass)} style={scrollStyle as React.CSSProperties}>
                <table className={cn('w-full text-left border-collapse', tableClassName)}>
                    <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
                        <tr className="bg-[#fafafa] border-b border-[#e6e6e6]">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap',
                                        col.headerClassName,
                                        col.className,
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center font-sans text-[12px] text-[#aaa]">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => {
                                const key = rowKey ? (typeof rowKey === 'function' ? rowKey(row, i) : String(row[rowKey] ?? i)) : i;
                                return (
                                    <tr
                                        key={key}
                                        onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                                        className={cn(
                                            'group border-b border-[#f2f2f2] last:border-0 hover:bg-[#fafafa] transition-colors',
                                            onRowClick && 'cursor-pointer',
                                            getRowClassName?.(row, i),
                                        )}
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={cn('px-4 py-3 font-sans text-[12px] text-[#333]', col.cellClassName, col.className)}
                                            >
                                                {col.render ? col.render(row[col.key], row, i) : (row[col.key] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {showPagination && pagination && (
                <PaginationFooter pagination={pagination} paginationLabel={paginationLabel} paginationMetaText={paginationMetaText} />
            )}
        </div>
    );
}
