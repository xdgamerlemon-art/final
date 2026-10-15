const API_URL = import.meta.env.VITE_API_URL || '/api';
export async function api(path, options = {}) {
  const token = localStorage.getItem('artisan-token');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
export const jsonBody = (body) => ({ body: JSON.stringify(body) });
