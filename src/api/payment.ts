import { buildUrl, httpRequest } from '../services/http';

export async function checkout(base: string) {
  const url = buildUrl(base, '/pay-api/checkout');
  return httpRequest<any>(url, { method: 'GET' });
}

