import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/ui/search-bar';
import { CheckedCombobox } from '@/components/ui/checked-combobox';
import { ReviewCard, type ReviewItem } from './review-card';

interface Props {
    reviews: ReviewItem[];
    onChange: (next: ReviewItem[]) => void;
    productSlug?: string | null;
    className?: string;
}

const PER_PAGE = 5;

export function ReviewsSection({ reviews, onChange, productSlug, className = '' }: Props) {
    const [q, setQ] = useState('');
    const [qDebounced, setQDebounced] = useState('');
    const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
    const [stars, setStars] = useState<string>('');
    const [page, setPage] = useState(1);
    const [apiData, setApiData] = useState<{ data: ReviewItem[]; last_page: number; total: number } | null>(null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editedMap, setEditedMap] = useState<Record<string, ReviewItem>>({});

    const storageKey = productSlug ? `perfu:edited-reviews:${productSlug}` : null;

    useEffect(() => {
        if (!storageKey) return;
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) setEditedMap(JSON.parse(raw));
        } catch {}
    }, [storageKey]);

    useEffect(() => {
        if (!storageKey) return;
        try {
            if (Object.keys(editedMap).length > 0) localStorage.setItem(storageKey, JSON.stringify(editedMap));
            else localStorage.removeItem(storageKey);
        } catch {}
    }, [editedMap, storageKey]);

    const isEditWithSlug = !!productSlug;

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setQDebounced(q), 300);
        return () => clearTimeout(t);
    }, [q]);

    // Fetch via API when productSlug exists (dynamic background, no reload)
    useEffect(() => {
        if (!isEditWithSlug) return;
        let ignore = false;
        async function fetchReviews() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: qDebounced,
                    sort,
                    stars: stars ? String(stars) : '',
                    page: String(page),
                    per_page: String(PER_PAGE),
                });
                const res = await fetch(`/products/${productSlug}/reviews?${params.toString()}`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!res.ok) throw new Error('fetch failed');
                const json = await res.json();
                if (!ignore) {
                    setApiData({
                        data: (json.data as ReviewItem[]) ?? [],
                        last_page: json.last_page ?? 1,
                        total: json.total ?? 0,
                    });
                    setCounts((json.counts as Record<string, number>) ?? {});
                }
            } catch {
                if (!ignore) setApiData(null);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        void fetchReviews();
        return () => {
            ignore = true;
        };
    }, [isEditWithSlug, productSlug, qDebounced, sort, stars, page]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
        setEditingIdx(null);
    }, [qDebounced, sort, stars]);

    // Only one edit at a time — reset when page changes
    useEffect(() => {
        setEditingIdx(null);
    }, [page]);

    // Client-side fallback when no API (create page) or API failed
    const filteredLocal = useMemo(() => {
        let list = [...reviews];
        if (qDebounced.trim()) {
            const qq = qDebounced.toLowerCase();
            list = list.filter((r) => r.name.toLowerCase().includes(qq) || r.message.toLowerCase().includes(qq));
        }
        if (stars) {
            const starList = stars
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => n >= 1 && n <= 5);
            if (starList.length > 0) list = list.filter((r) => starList.includes(r.rating));
        }
        list.sort((a, b) => {
            const ta = a.date ? new Date(a.date).getTime() : 0;
            const tb = b.date ? new Date(b.date).getTime() : 0;
            return sort === 'latest' ? tb - ta : ta - tb;
        });
        return list;
    }, [reviews, qDebounced, sort, stars]);

    const useApi = isEditWithSlug && apiData !== null;
    const baseListRaw = useApi ? apiData!.data : filteredLocal.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const localCounts = useMemo(() => {
        const c: Record<string, number> = {};
        for (const r of reviews) {
            const k = String(r.rating);
            c[k] = (c[k] ?? 0) + 1;
        }
        return c;
    }, [reviews]);

    const starCounts = useApi ? counts : localCounts;

    // Unsaved new reviews (no id) that are in local form but not in API — show at top
    const unsavedNew = useMemo(() => {
        if (!useApi || !apiData) return [];
        return reviews.filter((r) => r.id === undefined || !apiData.data.some((a) => String(a.id) === String(r.id)));
    }, [reviews, apiData, useApi]);

    // Override API data with editedMap (optimal: O(n) map lookup) and mark isEdited
    const displayList = useMemo(() => {
        if (!useApi) return baseListRaw as (ReviewItem & { _isEdited: boolean })[];
        const overridden = baseListRaw.map((r) => {
            const key = r.id !== undefined ? String(r.id) : '';
            const edited = key ? editedMap[key] : undefined;
            if (edited) {
                const isSame = edited.name === r.name && edited.rating === r.rating && edited.date === r.date && edited.message === r.message;
                if (isSame) return { ...r, _isEdited: false } as ReviewItem & { _isEdited: boolean };
                return { ...edited, _isEdited: true } as ReviewItem & { _isEdited: boolean };
            }
            return { ...r, _isEdited: false } as ReviewItem & { _isEdited: boolean };
        });
        if (unsavedNew.length === 0) return overridden;
        // Prepend unsaved new reviews (max 5) to current page, keep per_page limit
        const unsavedForPage = unsavedNew.slice(0, PER_PAGE).map((r) => ({ ...r, _isEdited: false, _isNew: true }) as ReviewItem & { _isEdited: boolean });
        const combined = [...unsavedForPage, ...overridden];
        return combined.slice(0, PER_PAGE);
    }, [baseListRaw, editedMap, useApi, unsavedNew]);

    const totalPages = useApi ? Math.max(1, Math.ceil((apiData!.total + unsavedNew.length) / PER_PAGE)) : Math.max(1, Math.ceil(filteredLocal.length / PER_PAGE));
    const total = useApi ? apiData!.total + unsavedNew.length : filteredLocal.length;

    // Cleanup editedMap entries that are now equal to server data (after save)
    useEffect(() => {
        if (!useApi || !apiData) return;
        let changed = false;
        const next = { ...editedMap };
        for (const r of apiData.data) {
            const key = r.id !== undefined ? String(r.id) : '';
            const edited = key ? next[key] : undefined;
            if (edited && edited.name === r.name && edited.rating === r.rating && edited.date === r.date && edited.message === r.message) {
                delete next[key];
                changed = true;
            }
        }
        if (changed) setEditedMap(next);
    }, [apiData, useApi]);

    function add() {
        const newReview: ReviewItem = {
            id: Date.now(),
            name: '',
            rating: 5,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            message: '',
        };
        onChange([...reviews, newReview]);
        setPage(1);
        setEditingIdx(0);
    }

    return (
        <div className={cn('bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6 flex flex-col gap-4', className)}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a] shrink-0">Ulasan</h3>
                <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] hover:bg-[#333] font-sans text-[11px] uppercase tracking-[0.12em] px-4 py-2 rounded-full transition-colors shrink-0 self-start sm:self-auto"
                >
                    <Plus size={14} strokeWidth={1.8} />
                    Tambah Ulasan
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 min-w-0">
                    <SearchBar value={q} onChange={setQ} onSearch={() => setQDebounced(q)} placeholder="Cari nama atau pesan..." className="w-full h-9" />
                </div>
                <div className="flex gap-2 shrink-0">
                    <CheckedCombobox
                        label="Urutkan"
                        buttonLabel="Filter"
                        value={[sort]}
                        onChange={(next) => setSort((next[0] as 'latest' | 'oldest') ?? 'latest')}
                        options={[
                            { code: 'latest', name: 'Terbaru' },
                            { code: 'oldest', name: 'Terlama' },
                        ]}
                        maxSelected={1}
                        searchable={false}
                        className="min-w-[130px]"
                    />
                    <CheckedCombobox
                        label="Filter Bintang"
                        buttonLabel="Filter"
                        value={stars ? stars.split(',').filter(Boolean) : []}
                        onChange={(next) => setStars(next.join(','))}
                        groups={[
                            {
                                label: 'Rating',
                                options: [
                                    { code: '5', name: '5 ★', count: starCounts['5'] ?? 0 },
                                    { code: '4', name: '4 ★', count: starCounts['4'] ?? 0 },
                                    { code: '3', name: '3 ★', count: starCounts['3'] ?? 0 },
                                    { code: '2', name: '2 ★', count: starCounts['2'] ?? 0 },
                                    { code: '1', name: '1 ★', count: starCounts['1'] ?? 0 },
                                ],
                            },
                        ]}
                        searchable={false}
                        className="min-w-[110px]"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-[#e6e6e6] border-t-[#1a1a1a] rounded-full animate-spin" />
                </div>
            ) : displayList.length === 0 ? (
                <p className="font-sans text-[12px] text-[#aaa] text-center py-6 bg-[#fafafa] rounded-xl border border-dashed border-[#e6e6e6]">Belum ada ulasan</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {displayList.map((r, idx) => {
                        const realIdx = useApi ? -1 : filteredLocal.indexOf(r as ReviewItem);
                        const targetIdx = realIdx >= 0 ? realIdx : reviews.findIndex((x) => x.name === (r as ReviewItem).name && x.message === (r as ReviewItem).message) ?? idx;
                        const isEditing = editingIdx === idx;
                        const reviewWithMeta = r as ReviewItem & { _isEdited?: boolean };
                        const isEdited = !!(reviewWithMeta as unknown as { _isEdited: boolean })._isEdited;
                        return (
                            <ReviewCard
                                key={`${(r as ReviewItem).name}-${(r as ReviewItem).date}-${idx}-${(r as ReviewItem).id ?? 'new'}`}
                                review={r as ReviewItem}
                                isEditing={isEditing}
                                isEdited={isEdited}
                                onEditingChange={(v) => setEditingIdx(v ? idx : null)}
                                onSave={(next) => {
                                    const nextWithId = r.id ? { ...next, id: r.id } : next;
                                    if (r.id) {
                                        setEditedMap((prev) => ({ ...prev, [String(r.id)]: nextWithId }));
                                    }
                                    if (useApi && r.id) {
                                        const nextReviews = [...reviews];
                                        const found = nextReviews.findIndex((x) => x.id === r.id);
                                        if (found >= 0) nextReviews[found] = nextWithId;
                                        else nextReviews.push(nextWithId);
                                        onChange(nextReviews);
                                    } else {
                                        const nextReviews = reviews.map((x, i) => (i === targetIdx ? nextWithId : x));
                                        if (targetIdx === -1) nextReviews.push(nextWithId);
                                        onChange(nextReviews);
                                    }
                                    setEditingIdx(null);
                                }}
                                onDelete={() => {
                                    if (r.id) {
                                        setEditedMap((prev) => {
                                            const nxt = { ...prev };
                                            delete nxt[String(r.id)];
                                            return nxt;
                                        });
                                    }
                                    if (useApi && r.id) {
                                        onChange(reviews.filter((x) => x.id !== r.id));
                                    } else {
                                        onChange(reviews.filter((_, i) => i !== targetIdx));
                                    }
                                    setEditingIdx(null);
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f5f5f5]">
                    <span className="font-sans text-[11px] text-[#888]">
                        Hal {page} dari {totalPages} · {total} ulasan
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-full border border-[#e6e6e6] bg-white text-[#555] hover:border-[#1a1a1a] font-sans text-[11px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Prev
                        </button>
                        <span className="font-sans text-[11px] text-[#888] px-2">
                            {page}/{totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded-full border border-[#e6e6e6] bg-white text-[#555] hover:border-[#1a1a1a] font-sans text-[11px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
