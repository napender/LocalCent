import React, { createContext, useContext, useState, useEffect } from 'react';

const FamilyAuthContext = createContext();

export const FamilyAuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('localcent_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (pin) => {
        try {
            const res = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentUser(data);
                setIsAuthenticated(true);
                localStorage.setItem('localcent_user', JSON.stringify(data));
                return { success: true };
            }
            return { success: false, message: data.error || 'Login failed' };
        } catch (error) {
            return { success: false, message: 'Server error. Is the backend running?' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('localcent_user');
    };

    return (
        <FamilyAuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, login, logout }}>
            {children}
        </FamilyAuthContext.Provider>
    );
};

export const useFamilyAuth = () => useContext(FamilyAuthContext);
