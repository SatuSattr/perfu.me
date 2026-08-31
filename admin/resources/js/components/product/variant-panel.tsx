import * as React from 'react';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
                        <Badge className="text-[8px]">{option.mode === 'dropdown' ? 'Dropdown' : 'Pill'}</Badge>
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
                    <Button variant="secondary" size="icon-sm" onClick={onMoveUp} disabled={index === 0} aria-label="Pindah ke atas">
                        <ChevronUp size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onMoveDown} disabled={index === total - 1} aria-label="Pindah ke bawah">
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

                <div className="border border-[#e6e6e6] rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fafafa] border-b border-[#e6e6e6]">
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-3 py-2 whitespace-nowrap">Nama</th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-3 py-2 whitespace-nowrap">Key</th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-3 py-2 whitespace-nowrap">Harga</th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-3 py-2 whitespace-nowrap">Stok</th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-3 py-2 whitespace-nowrap text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {option.choices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-8 text-center font-sans text-[12px] text-[#aaa]">
                                            Belum ada pilihan
                                        </td>
                                    </tr>
                                ) : (
                                    option.choices.map((choice, idx) => (
                                        <tr key={`${choice.key}-${idx}`} className="group border-b border-[#f2f2f2] last:border-0 hover:bg-[#fafafa] transition-colors">
                                            <td className="px-3 py-2 font-sans text-[12px] font-medium text-[#1a1a1a] max-w-[140px] truncate">{choice.name || '—'}</td>
                                            <td className="px-3 py-2 font-mono text-[11px] text-[#888] max-w-[120px] truncate">{choice.key || '—'}</td>
                                            <td className="px-3 py-2 font-sans text-[11px] text-[#555] whitespace-nowrap">
                                                {choice.price === null || choice.price === undefined ? <span className="text-[#aaa]">Default</span> : formatPrice(choice.price as number)}
                                            </td>
                                            <td className="px-3 py-2 font-sans text-[11px] text-[#1a1a1a] whitespace-nowrap">{choice.stock}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="secondary" size="icon-sm" onClick={() => {
                                                        const next = [...option.choices];
                                                        const [m] = next.splice(idx, 1);
                                                        next.splice(idx - 1, 0, m);
                                                        updateChoices(next);
                                                    }} disabled={idx === 0} aria-label="Pindah ke atas" className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                                                        <ChevronUp size={10} strokeWidth={1.8} />
                                                    </Button>
                                                    <Button variant="secondary" size="icon-sm" onClick={() => {
                                                        const next = [...option.choices];
                                                        const [m] = next.splice(idx, 1);
                                                        next.splice(idx + 1, 0, m);
                                                        updateChoices(next);
                                                    }} disabled={idx === option.choices.length - 1} aria-label="Pindah ke bawah" className="h-6 w-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                                                        <ChevronDown size={10} strokeWidth={1.8} />
                                                    </Button>
                                                    <Button variant="secondary" size="icon-sm" onClick={() => openEditChoice(idx)} aria-label="Edit pilihan" className="h-6 w-6">
                                                        <Pencil size={10} strokeWidth={1.8} />
                                                    </Button>
                                                    <Button variant="outline" size="icon-sm" onClick={() => setConfirmChoiceDelete(idx)} aria-label="Hapus pilihan" className="text-[#888] hover:border-red-400 hover:text-red-500 h-6 w-6">
                                                        <Trash2 size={10} strokeWidth={1.8} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


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
