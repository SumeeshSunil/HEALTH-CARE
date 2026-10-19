const key = 'healthcare_token';

export function getSavedToken() {
    try { return sessionStorage.getItem(key); } catch { return null; }
}

export function saveToken(token) {
    try {
        if (token) sessionStorage.setItem(key, token);
        else sessionStorage.removeItem(key);
        // Discard the old demo login; never trust a stored user object.
        localStorage.removeItem('user');
    } catch { /* Sign-in can still work in memory if storage is unavailable. */ }
}

export function dashboardFor(role) {
    return { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' }[role] || '/unauthorized';
}
