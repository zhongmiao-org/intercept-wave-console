import { buildUrl, httpRequest } from '../services/http';
import type { CodeData } from '../types/upstream';

export async function listOrders(base: string) {
  const url = buildUrl(base, '/order-api/orders');
  return httpRequest<any[]>(url, { method: 'GET' });
}

export async function createOrder(base: string, payload: any) {
  const url = buildUrl(base, '/order-api/orders');
  const init: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
  return httpRequest<CodeData<any>>(url, init);
}

export async function submitOrder(base: string, id: string | number) {
  const url = buildUrl(base, `/order-api/order/${id}/submit`);
  return httpRequest<{ message: string }>(url, { method: 'GET' });
}

