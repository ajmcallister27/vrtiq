const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'vrtIQ_token';
const LEGACY_TOKEN_KEY = 'base44_access_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

function buildUrl(path, query) {
  // If given a full URL, use it directly
  if (path.startsWith('http')) {
    const url = new URL(path);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === 'object') {
          url.searchParams.set(key, JSON.stringify(value));
        } else {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  // Otherwise, build a URL against the configured base.
  const base = BASE_URL.startsWith('http') ? BASE_URL : `${window.location.origin}${BASE_URL}`;
  const sanitizedBase = base.replace(/\/?$/, '');
  const sanitizedPath = path.replace(/^\//, '');
  const url = new URL(`${sanitizedBase}/${sanitizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'object') {
        url.searchParams.set(key, JSON.stringify(value));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function request(path, { method = 'GET', body, query, headers = {} } = {}) {
  const url = buildUrl(path, query);
  const token = getToken();

  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  if (res.status === 401) {
    clearToken();
    window.location.hash = '#/Login';
    throw new Error('Unauthorized');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

function makeEntityMethods(entityName) {
  const basePath = `/entities/${entityName}`;

  return {
    list(sort, limit) {
      const query = {};
      if (sort) query._sort = sort;
      if (limit !== undefined) query._limit = limit;
      return request(basePath, { query });
    },
    filter(q, sort, limit) {
      const query = {};
      if (q !== undefined) query._query = JSON.stringify(q);
      if (sort) query._sort = sort;
      if (limit !== undefined) query._limit = limit;
      return request(basePath, { query });
    },
    get(id) {
      return request(`${basePath}/${id}`);
    },
    create(data) {
      return request(basePath, { method: 'POST', body: data });
    },
    update(id, data) {
      return request(`${basePath}/${id}`, { method: 'PUT', body: data });
    },
    delete(id) {
      return request(`${basePath}/${id}`, { method: 'DELETE' });
    }
  };
}

export const api = {
  request,
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    signup: (email, password, full_name) => request('/auth/signup', { method: 'POST', body: { email, password, full_name } }),
  },
  editRequests: {
    create: (data) => request('/edit-requests', { method: 'POST', body: data }),
    listPending: () => request('/edit-requests/pending'),
    delete: (id) => request(`/edit-requests/${id}`, { method: 'DELETE' }),
  },
  entities: {
    Resort: makeEntityMethods('Resort'),
    Lift: makeEntityMethods('Lift'),
    Run: makeEntityMethods('Run'),
    DifficultyRating: makeEntityMethods('DifficultyRating'),
    ConditionNote: makeEntityMethods('ConditionNote'),
    CrossResortComparison: makeEntityMethods('CrossResortComparison'),
    LiftWaitReport: makeEntityMethods('LiftWaitReport'),
    LiftStatusUpdate: makeEntityMethods('LiftStatusUpdate'),
    User: makeEntityMethods('User')
  },
  integrations: {
    invokeLLM: (data) => request('/integrations/Core/InvokeLLM', { method: 'POST', body: data }),
    importSkiresort: (data) => request('/integrations/skiresort/import', { method: 'POST', body: data }),
    uploadFile: (formData) => {
      const token = getToken();
      return fetch(buildUrl('/integrations/Core/UploadFile'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      }).then(async (res) => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          const message = data?.message || res.statusText || 'Request failed';
          const error = new Error(message);
          error.status = res.status;
          error.data = data;
          throw error;
        }
        return data;
      });
    },
    uploadPrivateFile: (formData) => {
      const token = getToken();
      return fetch(buildUrl('/integrations/Core/UploadPrivateFile'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      }).then(async (res) => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          const message = data?.message || res.statusText || 'Request failed';
          const error = new Error(message);
          error.status = res.status;
          error.data = data;
          throw error;
        }
        return data;
      });
    }
  }
};
