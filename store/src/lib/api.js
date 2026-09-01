const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 8000);

function apiUrl(path) {
  // path should start with /v1/...
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export function resolveImage(path) {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  let p = path;
  // migrate old store static prefix /assets/products → /storage/products (deleted static files)
  if (p.startsWith('/assets/products')) p = p.replace('/assets/products', '/storage/products');
  if (p.startsWith('/assets/')) {
    // fallback for any other /assets → keep as-is for vite public (hero/brand)
    return p;
  }
  if (p.startsWith('/storage')) {
    const base = API_BASE.replace(/\/api\/?$/, '');
    return `${base}${p}`;
  }
  return p;
}

export async function apiFetch(path, { signal, timeout = TIMEOUT } = {}) {
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort('timeout'), timeout);
  const effectiveSignal = signal ? withCombinedSignal(signal, ctrl.signal) : ctrl.signal;

  try {
    const res = await fetch(apiUrl(path), {
      signal: effectiveSignal,
      headers: { Accept: 'application/json' },
    });

    if (res.status === 429) {
      const retry = res.headers.get('Retry-After');
      const err = new Error('rate_limited');
      err.status = 429;
      err.retryAfter = retry ? Number(retry) : 60;
      throw err;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(text || `API ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function withCombinedSignal(a, b) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });
  return ctrl.signal;
}

export function fetchProducts(params = {}, opts) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const q = qs.toString();
  return apiFetch(`/v1/products${q ? `?${q}` : ''}`, opts);
}

export function fetchProduct(slug, opts) {
  return apiFetch(`/v1/products/${encodeURIComponent(slug)}`, opts).then((j) => j.data ?? j);
}

export function fetchFeatured(per_page = 6, opts) {
  return fetchProducts({ featured: '1', per_page, sort: 'latest' }, opts);
}
