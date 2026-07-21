import React, { useState, useEffect } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';

export default function Login() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const { login } = useFamilyAuth();

    useEffect(() => {
        if (pin.length === 4) {
            handleLogin(pin);
        }
    }, [pin]);

    const handleLogin = async (completePin) => {
        const res = await login(completePin);
        if (!res.success) {
            setError(true);
            setTimeout(() => {
                setError(false);
                setPin('');
            }, 600);
        }
    };

    const handleKeyPress = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <div className="w-full max-w-sm p-8 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-slate-800 dark:text-slate-200 font-normal">Local</span>
                        <span className="text-indigo-600 dark:text-indigo-400 relative">Cent<span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span></span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Enter PIN to access</p>
                </div>
                
                {/* Dots Indicator */}
                <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
                    {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                pin.length > i 
                                    ? (error ? 'bg-rose-500 border-rose-500' : 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500') 
                                    : (error ? 'border-rose-500/50' : 'border-slate-300 dark:border-slate-700')
                            }`}
                        />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num.toString())}
                            className="h-16 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-2xl font-semibold transition flex items-center justify-center border border-slate-200 dark:border-slate-800/50 shadow-sm"
                        >
                            {num}
                        </button>
                    ))}
                    <div /> {/* Empty slot */}
                    <button
                        onClick={() => handleKeyPress('0')}
                        className="h-16 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-2xl font-semibold transition flex items-center justify-center border border-slate-200 dark:border-slate-800/50 shadow-sm"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="h-16 rounded-full hover:bg-slate-200 dark:hover:bg-slate-900 active:bg-slate-300 dark:active:bg-slate-800 transition flex items-center justify-center text-slate-500 dark:text-slate-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                    </button>
                </div>
                
                {error && <p className="mt-8 text-rose-500 font-medium animate-pulse">Incorrect PIN</p>}
            </div>
        </div>
    );
}
