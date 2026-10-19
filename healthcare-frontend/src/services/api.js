export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
    const base = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
    let response;
    try {
        response = await fetch(base + path, {
            method,
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: 'Bearer ' + token } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
            signal: AbortSignal.timeout(15000),
        });
    } catch {
        throw new ApiError('Cannot reach the server. Check that the backend is running and try again.', 0);
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401 && token && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:expired'));
        }
        throw new ApiError(data?.message || 'The server could not complete this request. Try again.', response.status);
    }
    if (!data) throw new ApiError('Unexpected server response. Check your API configuration.', 0);
    return data;
}
