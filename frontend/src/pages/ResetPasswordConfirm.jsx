import React, { useState } from 'react';

export default function ResetPasswordConfirm({ uid, token, onBack }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Password validations
    const hasLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
    const isPasswordValid = hasLength && hasNumber && hasSpecial && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements and matches.");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/auth/reset-password/confirm/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, new_password: newPassword })
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to reset password. The link may be expired.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
                    <p className="text-slate-500 mb-6">Your password has been successfully updated.</p>
                    <button onClick={onBack} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">Return to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
                <p className="text-slate-500 mb-6 text-sm">
                    Enter your new password below.
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mb-2"
                            placeholder="••••••••"
                        />
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mt-2 border border-slate-100 dark:border-slate-700/50">
                            <ul className="text-xs space-y-1">
                                <li className={`flex items-center ${hasLength ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    <span className="mr-2">{hasLength ? '✓' : '○'}</span> 8+ characters
                                </li>
                                <li className={`flex items-center ${hasNumber ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    <span className="mr-2">{hasNumber ? '✓' : '○'}</span> 1 number
                                </li>
                                <li className={`flex items-center ${hasSpecial ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    <span className="mr-2">{hasSpecial ? '✓' : '○'}</span> 1 special character
                                </li>
                                <li className={`flex items-center ${passwordsMatch ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    <span className="mr-2">{passwordsMatch ? '✓' : '○'}</span> Passwords match
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || !isPasswordValid} 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 transition"
                    >
                        {isSubmitting ? 'Saving...' : 'Reset Password'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={onBack}
                        className="w-full mt-4 py-3 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 rounded-xl font-medium transition"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
