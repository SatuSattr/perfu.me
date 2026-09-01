function csrfToken(): string | null {
    const el = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return el?.content ?? null;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

export interface UploadResult {
    media: { id: number; path: string; type: string; mime: string | null; position: number }[];
    uploaded: { id: number; path: string; type: string; mime: string | null; position: number };
    image: string | null;
    detail_image: string | null;
}

export function uploadMedia(
    productSlug: string,
    file: File,
    position: number | undefined,
    onProgress?: (p: UploadProgress) => void,
    signal?: AbortSignal,
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `/products/${encodeURIComponent(productSlug)}/media/upload`;

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        const token = csrfToken();
        if (token) xhr.setRequestHeader('X-CSRF-TOKEN', token);

        // CSRF via cookie already handled, but ensure credentials
        xhr.withCredentials = true;

        if (signal) {
            const abort = () => xhr.abort();
            if (signal.aborted) abort();
            else signal.addEventListener('abort', abort, { once: true });
            xhr.addEventListener('loadend', () => signal.removeEventListener('abort', abort));
        }

        xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable || !onProgress) return;
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress({ loaded: e.loaded, total: e.total, percent });
        };

        xhr.onload = () => {
            const text = xhr.responseText;
            let json: unknown = null;
            try {
                json = text ? JSON.parse(text) : null;
            } catch {
                // non-json (e.g. PostTooLarge html)
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(json as UploadResult);
            } else {
                const msg =
                    (json as { message?: string })?.message ||
                    (json as { errors?: Record<string, string[]> })?.errors?.file?.[0] ||
                    `Upload gagal (${xhr.status})`;
                const err = new Error(msg) as Error & { status?: number; response?: unknown };
                err.status = xhr.status;
                err.response = json ?? text;
                reject(err);
            }
        };

        xhr.onerror = () => {
            const err = new Error('Koneksi gagal saat upload.') as Error & { status?: number };
            err.status = 0;
            reject(err);
        };

        xhr.onabort = () => {
            const err = new Error('Upload dibatalkan.') as Error & { name: string };
            err.name = 'AbortError';
            reject(err);
        };

        const form = new FormData();
        form.append('file', file);
        if (position !== undefined) form.append('position', String(position));

        xhr.send(form);
    });
}
