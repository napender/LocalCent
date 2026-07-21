import React from 'react';
import { FamilyAuthProvider, useFamilyAuth } from './context/FamilyAuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AppContent() {
    const { isAuthenticated, isLoading } = useFamilyAuth();

    if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">Loading...</div>;

    if (!isAuthenticated) {
        return <Login />;
    }

    return <Dashboard />;
}

function App() {
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <>
            {isOffline && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white mb-2">Network Disconnected</h2>
                    <p className="text-slate-300">You are currently disconnected from the home network. Reconnect to sync data.</p>
                </div>
            )}
            <FamilyAuthProvider>
                <AppContent />
            </FamilyAuthProvider>
        </>
    );
}

export default App;
