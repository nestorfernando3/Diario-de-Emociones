const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('diario_token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem('diario_token');
        localStorage.removeItem('diario_user');
        window.location.href = '/';
        throw new Error('Sesión expirada');
    }

    const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : await res.text();

    if (!res.ok) {
        throw new Error(data.error || data || 'Error en la solicitud');
    }

    return data;
}

// Auth
export const authAPI = {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
};

// Entries
export const entriesAPI = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/entries${qs ? '?' + qs : ''}`);
    },
    get: (id) => request(`/entries/${id}`),
    create: (data) => request('/entries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/entries/${id}`, { method: 'DELETE' }),
    export: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/entries/export${qs ? '?' + qs : ''}`);
    },
};

// AI
export const aiAPI = {
    getConfig: () => request('/ai/config'),
    setConfig: (data) => request('/ai/config', { method: 'PUT', body: JSON.stringify(data) }),
    analyze: (data) => request('/ai/analyze', { method: 'POST', body: JSON.stringify(data) }),
};
