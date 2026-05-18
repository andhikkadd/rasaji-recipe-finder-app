import type { Recipe } from '../types';

const API = '/api/admin';

export async function getReviewStats(): Promise<any> {
  const res = await fetch(`${API}/stats`, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getReviewRecipes(status?: string): Promise<Recipe[]> {
  const params = status ? `?status=${status}` : '';
  const res = await fetch(`${API}/recipes/review${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getRecipeForAdmin(id: string): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function approveRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function rejectRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function deleteRecipe(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API}/recipes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
