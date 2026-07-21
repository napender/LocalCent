import React, { createContext, useContext, useState, useEffect } from 'react';


const FamilyAuthContext = createContext();

export const FamilyAuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check setup status
                const statusRes = await fetch('/api/auth/status/');
                const statusData = await statusRes.json();
                setIsSetupComplete(statusData.is_setup_complete);

                const storedUser = localStorage.getItem('localcent_user');
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth init error", error);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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

    // Helper for setup wizard to set state after completion
    const completeSetup = (user) => {
        setIsSetupComplete(true);
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('localcent_user', JSON.stringify(user));
    };

    return (
        <FamilyAuthContext.Provider value={{ currentUser, isAuthenticated, isSetupComplete, isLoading, login, logout, completeSetup }}>
            {children}
        </FamilyAuthContext.Provider>
    );
};

export const useFamilyAuth = () => useContext(FamilyAuthContext);
