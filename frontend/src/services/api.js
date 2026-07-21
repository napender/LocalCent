export const apiClient = async (endpoint, options = {}) => {
    // Read the user from localStorage
    const storedUser = localStorage.getItem('localcent_user');
    let headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (storedUser) {
        const user = JSON.parse(storedUser);
        // Inject custom Auth token header. Assuming pin acts as a simple session identifier for now.
        // In a real production app, this would be a JWT or session token.
        if (user.id) {
             headers['Authorization'] = `Bearer ${user.id}`;
        }
    }

    const config = {
        ...options,
        headers,
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
