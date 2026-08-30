export function formatPrice(n) {
  return 'Rp ' + Number(n ?? 0).toLocaleString('id-ID');
}
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
