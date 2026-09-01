import * as React from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { SidePanel } from '@/components/ui/side-panel';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { ChoiceFormPanel } from './choice-form-panel';
import type { ChoiceItem } from './choice-row';
import { formatPrice } from '@/lib/format';

export interface OptionItem {
    key: string;
    label: string;
    mode: 'dropdown' | 'normal';
    required: boolean;
    is_base: boolean;
    position: number;
    choices: ChoiceItem[];
}

interface Props {
    option: OptionItem;
    index: number;
    total: number;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onChoicesChange: (next: ChoiceItem[]) => void;
    className?: string;
}

export function VariantPanel({ option, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onChoicesChange, className = '' }: Props) {
    const [choiceMode, setChoiceMode] = React.useState<'create' | 'edit' | null>(null);
    const [editingChoiceIdx, setEditingChoiceIdx] = React.useState<number | null>(null);
    const [choiceDirty, setChoiceDirty] = React.useState(false);
    const [showChoiceUnsaved, setShowChoiceUnsaved] = React.useState(false);
    const [confirmChoiceDelete, setConfirmChoiceDelete] = React.useState<number | null>(null);

    const isChoicePanelOpen = choiceMode !== null;
    const editingChoice = editingChoiceIdx !== null ? option.choices[editingChoiceIdx] ?? null : null;

    function updateChoices(next: ChoiceItem[]) {
        onChoicesChange(next.map((c, i) => ({ ...c, position: i })));
    }

    function openCreateChoice() {
        setEditingChoiceIdx(null);
        setChoiceDirty(false);
        setChoiceMode('create');
    }

    function openEditChoice(idx: number) {
        setEditingChoiceIdx(idx);
        setChoiceDirty(false);
        setChoiceMode('edit');
    }

    function doCloseChoicePanel() {
        setChoiceMode(null);
        setEditingChoiceIdx(null);
        setChoiceDirty(false);
        setShowChoiceUnsaved(false);
    }

    function requestCloseChoicePanel() {
        if (choiceDirty) setShowChoiceUnsaved(true);
        else doCloseChoicePanel();
    }

    function handleSaveChoice(draft: ChoiceItem) {
        if (choiceMode === 'create') {
            const next = [...option.choices, { ...draft, position: option.choices.length }];
            updateChoices(next);
        } else if (choiceMode === 'edit' && editingChoiceIdx !== null) {
            const next = option.choices.map((c, i) => (i === editingChoiceIdx ? { ...draft, position: i } : c));
            updateChoices(next);
        }
        doCloseChoicePanel();
    }

    function handleDeleteChoice(idx: number) {
        updateChoices(option.choices.filter((_, i) => i !== idx));
        setConfirmChoiceDelete(null);
    }

    return (
        <div className={cn('bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6', className)}>
            {/* Header: Varian - {label} */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                            Varian — {option.label || option.key || `#${index + 1}`}
                        </h3>
                        <span className="font-sans text-[8px] uppercase tracking-[0.12em] text-[#888] bg-[#f5f5f5] border border-[#e6e6e6] rounded-full px-2 py-0.5">{option.mode === 'dropdown' ? 'Dropdown' : 'Pill'}</span>
                        {option.is_base && (
                            <span className="font-sans text-[8px] uppercase tracking-[0.12em] text-white bg-[#1a1a1a] border border-[#1a1a1a] rounded-full px-2 py-0.5">
                                Dasar
                            </span>
                        )}
                        {option.required && (
                            <span className="font-sans text-[9px] uppercase tracking-[0.12em] text-[#888] bg-[#f5f5f5] border border-[#e6e6e6] rounded-full px-2 py-0.5">
                                Wajib
                            </span>
                        )}
                    </div>
                    <p className="font-sans text-[11px] text-[#888] mt-1 truncate">
                        key: <span className="font-mono text-[#555]">{option.key || '—'}</span> · {option.choices.length} pilihan
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button variant="secondary" size="icon-sm" onClick={onMoveUp} disabled={option.is_base || index === 0} aria-label="Pindah ke atas">
                        <ChevronUp size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onMoveDown} disabled={option.is_base || index === total - 1} aria-label="Pindah ke bawah">
                        <ChevronDown size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onEdit} aria-label="Edit varian">
                        <Pencil size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={onDelete} aria-label="Hapus varian" className="text-[#888] hover:border-red-400 hover:text-red-500">
                        <Trash2 size={12} strokeWidth={1.8} />
                    </Button>
                </div>
            </div>

            {/* Choices - table like reviews */}
            <div className="mt-5 border-t border-[#f5f5f5] pt-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">Pilihan ({option.choices.length})</span>
                    <Button variant="secondary" size="sm" onClick={openCreateChoice} className="text-[10px]">
                        <Plus size={12} strokeWidth={1.8} />
                        Tambah Pilihan
                    </Button>
                </div>

                <Table<ChoiceItem & Record<string, unknown>>
                    columns={[
                        { key: 'name', header: 'Nama', cellClassName: 'px-3 py-2 font-sans text-[12px] font-medium text-[#1a1a1a] max-w-[140px] truncate', headerClassName: 'px-3 py-2', render: (_v, row) => (row as ChoiceItem).name || '—' },
                        { key: 'key', header: 'Key', cellClassName: 'px-3 py-2 font-mono text-[11px] text-[#888] max-w-[120px] truncate', headerClassName: 'px-3 py-2', render: (_v, row) => (row as ChoiceItem).key || '—' },
                        {
                            key: 'price',
                            header: 'Harga',
                            headerClassName: 'px-3 py-2',
                            cellClassName: 'px-3 py-2 font-sans text-[11px] text-[#555] whitespace-nowrap',
                            render: (_v, row) => {
                                const c = row as ChoiceItem;
                                return c.price === null || c.price === undefined ? <span className="text-[#aaa]">Default</span> : formatPrice(c.price as number);
                            },
                        },
                        {
                            key: 'stock',
                            header: 'Stok',
                            headerClassName: 'px-3 py-2',
                            render: (_v, row) => {
                                const c = row as ChoiceItem;
                                return <span className={`font-sans text-[11px] whitespace-nowrap ${c.stock === 0 ? 'text-red-500 font-medium' : 'text-[#1a1a1a]'}`}>{c.stock}</span>;
                            },
                        },
                        {
                            key: 'actions',
                            header: 'Aksi',
                            headerClassName: 'text-right px-3 py-2',
                            cellClassName: 'px-3 py-2',
                            render: (_v, row, idx) => {
                                const choiceIdx = idx as unknown as number;
                                return (
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="secondary"
                                            size="icon-sm"
                                            onClick={() => {
                                                const next = [...option.choices];
                                                const [m] = next.splice(choiceIdx, 1);
                                                next.splice(choiceIdx - 1, 0, m);
                                                updateChoices(next);
                                            }}
                                            disabled={choiceIdx === 0}
                                            aria-label="Pindah ke atas"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0 group-hover:disabled:opacity-40 transition-opacity disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp size={10} strokeWidth={1.8} />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon-sm"
                                            onClick={() => {
                                                const next = [...option.choices];
                                                const [m] = next.splice(choiceIdx, 1);
                                                next.splice(choiceIdx + 1, 0, m);
                                                updateChoices(next);
                                            }}
                                            disabled={choiceIdx === option.choices.length - 1}
                                            aria-label="Pindah ke bawah"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0 group-hover:disabled:opacity-40 transition-opacity disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown size={10} strokeWidth={1.8} />
                                        </Button>
                                        <Button variant="secondary" size="icon-sm" onClick={() => openEditChoice(choiceIdx)} aria-label="Edit pilihan" className="h-6 w-6">
                                            <Pencil size={10} strokeWidth={1.8} />
                                        </Button>
                                        <Button variant="outline" size="icon-sm" onClick={() => setConfirmChoiceDelete(choiceIdx)} aria-label="Hapus pilihan" className="text-[#888] hover:border-red-400 hover:text-red-500 h-6 w-6">
                                            <Trash2 size={10} strokeWidth={1.8} />
                                        </Button>
                                    </div>
                                );
                            },
                        },
                    ]}
                    data={option.choices as unknown as (ChoiceItem & Record<string, unknown>)[]}
                    rowKey={(row, idx) => `${(row as ChoiceItem).key}-${idx}`}
                    emptyText="Belum ada pilihan"
                    hidePagination
                    maxHeight="280px"
                    stickyHeader
                    wrapperClassName="rounded-xl"
                />


            </div>

            <SidePanel
                open={isChoicePanelOpen}
                onOpenChange={(open) => {
                    if (!open) requestCloseChoicePanel();
                }}
                title={choiceMode === 'create' ? 'Tambah Pilihan' : 'Edit Pilihan'}
                subtitle={option.label || option.key}
                width="md"
            >
                {choiceMode === 'create' ? (
                    <ChoiceFormPanel mode="create" onClose={requestCloseChoicePanel} onSave={handleSaveChoice} onDirtyChange={setChoiceDirty} />
                ) : choiceMode === 'edit' && editingChoice ? (
                    <ChoiceFormPanel
                        key={`${editingChoice.key}-${editingChoiceIdx}`}
                        mode="edit"
                        initial={editingChoice}
                        onClose={requestCloseChoicePanel}
                        onSave={handleSaveChoice}
                        onDirtyChange={setChoiceDirty}
                    />
                ) : null}
            </SidePanel>

            <ConfirmDialog
                open={showChoiceUnsaved}
                title="Batalkan perubahan?"
                message="Perubahan pilihan belum disimpan. Yakin ingin menutup tanpa menyimpan?"
                confirmText="Tutup"
                cancelText="Lanjutkan Edit"
                variant="danger"
                onCancel={() => setShowChoiceUnsaved(false)}
                onConfirm={doCloseChoicePanel}
            />

            <ConfirmDialog
                open={confirmChoiceDelete !== null}
                title="Hapus pilihan?"
                message={`Pilihan "${confirmChoiceDelete !== null ? option.choices[confirmChoiceDelete]?.name || option.choices[confirmChoiceDelete]?.key : ''}" akan dihapus.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmChoiceDelete(null)}
                onConfirm={() => {
                    if (confirmChoiceDelete !== null) handleDeleteChoice(confirmChoiceDelete);
                }}
            />
        </div>
    );
}
