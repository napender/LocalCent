import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';

export default function Login({ onForgotPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useFamilyAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        const res = await login(email, password);
        if (!res.success) {
            setError(res.message || "Invalid credentials");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <div className="w-full max-w-md p-8 flex flex-col items-center">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm mb-4 mx-auto flex items-center justify-center bg-white dark:bg-slate-800">
                        <img src="/logo.png" alt="LocalCent" className="w-24 h-24 max-w-none object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-slate-800 dark:text-slate-200 font-normal">Local</span>
                        <span className="text-indigo-600 dark:text-indigo-400 relative">Cent<span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span></span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="your@email.com"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••••"
                        />
                        <div className="flex justify-end mt-2">
                            <button 
                                type="button" 
                                onClick={onForgotPassword}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
