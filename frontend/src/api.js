const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  resorts: {
    list: () => request('/resorts'),
    get: (id) => request(`/resorts/${id}`),
    create: (data) => request('/resorts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/resorts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/resorts/${id}`, { method: 'DELETE' })
  },
  runs: {
    list: (resortId) => request(resortId ? `/runs?resort_id=${resortId}` : '/runs'),
    get: (id) => request(`/runs/${id}`),
    create: (data) => request('/runs', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (data) => request('/runs/bulk', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/runs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/runs/${id}`, { method: 'DELETE' })
  },
  ratings: {
    list: (runId) => request(runId ? `/ratings?run_id=${runId}` : '/ratings'),
    create: (data) => request('/ratings', { method: 'POST', body: JSON.stringify(data) })
  },
  notes: {
    list: (runId) => request(runId ? `/notes?run_id=${runId}` : '/notes'),
    create: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) })
  },
  comparisons: {
    list: () => request('/comparisons'),
    create: (data) => request('/comparisons', { method: 'POST', body: JSON.stringify(data) })
  }
};
