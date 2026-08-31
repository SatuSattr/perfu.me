import * as React from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyText?: string;
}

export function Table<T extends Record<string, unknown>>({ columns = [], data = [], emptyText = 'Tidak ada data.' }: TableProps<T>) {
    return (
        <div className="border border-[#e6e6e6] rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#fafafa] border-b border-[#e6e6e6]">
                            {columns.map((col) => (
                                <th key={col.key} className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
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
                            data.map((row, i) => (
                                <tr key={i} className="border-b border-[#f2f2f2] last:border-0 hover:bg-[#fafafa] transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3 font-sans text-[12px] text-[#333]">
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
