function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const apiClient = async (endpoint, options = {}) => {
    let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Attach CSRF token for state-changing methods
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrftoken = getCookie('csrftoken');
        if (csrftoken) {
            headers['X-CSRFToken'] = csrftoken;
        }
    }

    const config = {
        ...options,
        headers,
        // credentials: 'omit' is default for fetch, but if we are proxying to localhost 
        // through Vite or hitting it directly we might need include or same-origin for cookies to work
        credentials: 'include' 
    };

    try {
        const response = await fetch(endpoint, config);

        if (response.status === 401) {
            // Global Error Handling for Unauthorized
            localStorage.removeItem('localcent_user');
            window.location.href = '/'; // Reload to trigger Login screen
            return null;
        }

        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('API Client Error:', error);
        return { ok: false, status: 500, error: error.message };
    }
};
