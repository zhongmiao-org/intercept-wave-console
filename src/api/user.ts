import { buildUrl, httpRequest } from '../services/http';

export async function getUserInfo(base: string) {
  const url = buildUrl(base, '/api/user/info');
  return httpRequest<any>(url, { method: 'GET' });
}

export async function getPosts(base: string) {
  const url = buildUrl(base, '/api/posts');
  return httpRequest<any>(url, { method: 'GET' });
}

