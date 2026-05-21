import type { Product, ProductListResponse } from './types.js';

const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listProducts() {
  return request<ProductListResponse>('/api/products');
}

export function createProduct(payload: { name: string; url: string; currentPrice: number }) {
  return request<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function deleteProduct(id: string) {
  return request<void>(`/api/products/${id}`, { method: 'DELETE' });
}

export function simulateProduct(id: string) {
  return request<Product>(`/api/products/${id}/simulate`, { method: 'POST' });
}
