export function formatPrice(n: number | string | null | undefined): string {
    return 'Rp ' + Number(n ?? 0).toLocaleString('id-ID');
}
