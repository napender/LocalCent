import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function SettingsForm() {
    const [settings, setSettings] = useState({
        monthly_budget_target: 10000.00
    });
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
                monthly_budget_target: data.monthly_budget_target || 10000.00
            });
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
            setMessage('Settings saved successfully!');
            fetchSettings(); // Refresh masked key
        } else {
            setMessage('Error: ' + error);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return <div className="text-slate-500 dark:text-zinc-400 p-8 text-center animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">General Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Monthly Budget Target (₹)</label>
                    <input
                        type="number"
                        name="monthly_budget_target"
                        value={settings.monthly_budget_target}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                        min="0"
                        step="100"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Data Management</h3>
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `/api/export/transactions/`;
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Transactions (CSV)
                        </button>
                    </div>
                </div>

                <div className="pt-6 flex items-center justify-between">
                    <span className={`text-sm ${message.includes('Error') ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {message}
                    </span>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition text-white font-semibold shadow-sm"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
