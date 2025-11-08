export function joinUrl(base: string, extra: string): string {
  const b = (base || '').trim();
  const e = (extra || '').trim();
  if (!e) return b;
  const baseHasSlash = b.endsWith('/');
  const extraHasSlash = e.startsWith('/');
  if (baseHasSlash && extraHasSlash) return b + e.slice(1);
  if (!baseHasSlash && !extraHasSlash) return b + '/' + e;
  return b + e;
}

export function withQuery(raw: string, q: Record<string, string | undefined>): string {
  try {
    const u = new URL(raw);
    Object.entries(q).forEach(([k, v]) => {
      if (v == null || v === '') return;
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    });
    return u.toString();
  } catch {
    const hasQ = raw.includes('?');
    const kv = Object.entries(q)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (!kv) return raw;
    return raw + (hasQ ? '&' : '?') + kv;
  }
}
