// RAM cache for wilayah data - avoids reading .json repeatedly
const ramCache = new Map();
const inflight = new Map();

function cacheKey(path) {
  return path;
}

export async function fetchWilayah(path, signal) {
  const key = cacheKey(path);
  if (ramCache.has(key)) {
    return ramCache.get(key);
  }
  if (inflight.has(key)) {
    return inflight.get(key);
  }
  const p = fetch(`/data/wilayah${path}`, { signal })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
      const json = await res.json();
      const data = json.data || [];
      ramCache.set(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((e) => {
      inflight.delete(key);
      throw e;
    });
  inflight.set(key, p);
  return p;
}

export function clearWilayahCache() {
  ramCache.clear();
  inflight.clear();
}

export function getWilayahCacheSize() {
  return ramCache.size;
}
