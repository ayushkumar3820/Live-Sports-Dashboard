const API_BASE = '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error || error.message || 'API error');
  }
  return response.json();
};

export async function getMatches({ limit = 20 } = {}) {
  const url = new URL(`${API_BASE}/matches`, window.location.origin);
  if (limit) url.searchParams.set('limit', limit);
  const res = await fetch(url);
  const data = await handleResponse(res);
  return data.data;
}

export async function createMatch(formData) {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function getCommentary(matchId, { limit = 50 } = {}) {
  const url = new URL(`${API_BASE}/matches/${matchId}/commentary`, window.location.origin);
  if (limit) url.searchParams.set('limit', limit);
  const res = await fetch(url);
  const data = await handleResponse(res);
  return data.data;
}

export async function addCommentary(matchId, formData) {
  const res = await fetch(`${API_BASE}/matches/${matchId}/commentary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await handleResponse(res);
  return data;
}
