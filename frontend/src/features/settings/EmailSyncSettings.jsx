import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function EmailSyncSettings() {
    const [settings, setSettings] = useState({
        imap_email: '',
        imap_password: ''
    });
    const [maskedPassword, setMaskedPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { ok, data } = await apiClient('/api/settings/');
        if (ok) {
            setSettings({
                imap_email: data.imap_email || '',
                imap_password: '' 
            });
            setMaskedPassword(data.imap_password_masked || '');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        const { ok, error } = await apiClient('/api/settings/', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        if (ok) {
            setMessage('Email Sync settings saved successfully!');
            fetchSettings(); 
        } else {
            setMessage('Error: ' + error);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };
    const handleSync = async () => {
        setMessage('Triggering sync...');
        const { ok, error } = await apiClient('/api/settings/sync-email/', { method: 'POST' });
        if (ok) {
            setMessage('Sync started in background! Check Dashboard shortly.');
        } else {
            setMessage('Error: ' + error);
        }
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) {
        return <div className="text-slate-500 dark:text-zinc-400 p-8 text-center animate-pulse">Loading email settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 mt-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Auto-Fetch (IMAP)</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                LocalCent can automatically fetch and parse statements from your email. To keep your account secure, <strong>never use your actual email password</strong>. Instead, generate a secure "App Password".
            </p>
            
            <div className="mb-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">How to get an App Password (Recommended)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-indigo-800/80 dark:text-indigo-200/80">
                    <li>Go to your Google Account Security settings.</li>
                    <li>Search for "App Passwords" (usually under 2-Step Verification).</li>
                    <li>Create a new app called "LocalCent" and it will give you a 16-letter code.</li>
                    <li>Paste that code below. You can revoke it at any time from your Google account.</li>
                </ol>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="imap_email"
                            value={settings.imap_email}
                            onChange={handleChange}
                            placeholder="e.g. statements@gmail.com"
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                            App-Specific Password <span className="text-xs text-rose-500 font-normal ml-1">(NOT your real email password)</span>
                        </label>
                        <input
                            type="password"
                            name="imap_password"
                            value={settings.imap_password}
                            onChange={handleChange}
                            placeholder={maskedPassword ? `Current: ${maskedPassword} (Leave blank to keep)` : "Enter 16-letter App Password"}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className={`text-sm ${message.includes('Error') ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {message}
                    </span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSync}
                            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-900 dark:text-white font-semibold shadow-sm"
                        >
                            Sync Now
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition text-white font-semibold shadow-sm"
                        >
                            {saving ? 'Saving...' : 'Save Email Sync'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Alternative: Manual Upload</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
                    If you don't feel comfortable linking your email, you can always upload your bank statements manually. Just download the PDF from your bank and drag-and-drop it securely on the Dashboard.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Go to Manual Upload
                </button>
            </div>
        </div>
    );
}
