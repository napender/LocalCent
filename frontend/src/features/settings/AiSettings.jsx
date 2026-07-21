import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function AiSettings() {
    const [settings, setSettings] = useState({
        active_ai_provider: 'openai',
        openai_api_key: '',
        anthropic_api_key: '',
        gemini_api_key: '',
        deepseek_api_key: '',
        groq_api_key: '',
        ai_model_mode: 'simple',
        ai_model_tier: 'fast',
        ai_custom_model: ''
    });
    const [maskedKeys, setMaskedKeys] = useState({
        openai: '',
        anthropic: '',
        gemini: '',
        deepseek: '',
        groq: ''
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
                active_ai_provider: data.active_ai_provider || 'openai',
                openai_api_key: '',
                anthropic_api_key: '',
                gemini_api_key: '',
                deepseek_api_key: '',
                groq_api_key: '',
                ai_model_mode: data.ai_model_mode || 'simple',
                ai_model_tier: data.ai_model_tier || 'fast',
                ai_custom_model: data.ai_custom_model || ''
            });
            setMaskedKeys({
                openai: data.openai_api_key_masked || '',
                anthropic: data.anthropic_api_key_masked || '',
                gemini: data.gemini_api_key_masked || '',
                deepseek: data.deepseek_api_key_masked || '',
                groq: data.groq_api_key_masked || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'api_key') {
            setSettings(prev => ({ ...prev, [`${prev.active_ai_provider}_api_key`]: value }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
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
            setMessage('AI settings saved successfully!');
            fetchSettings(); 
        } else {
            setMessage('Error: ' + error);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const getModelTierLabel = (tier, provider) => {
        if (tier === 'fast') {
            switch(provider) {
                case 'openai': return 'Fast & Cheap (gpt-4o-mini)';
                case 'anthropic': return 'Fast & Cheap (claude-3-haiku)';
                case 'gemini': return 'Fast & Cheap (gemini-1.5-flash)';
                case 'deepseek': return 'Fast & Cheap (deepseek-chat)';
                case 'groq': return 'Fast & Cheap (llama-3.1-8b)';
                default: return 'Fast & Cheap';
            }
        } else {
            switch(provider) {
                case 'openai': return 'Powerful & Smart (gpt-4o)';
                case 'anthropic': return 'Powerful & Smart (claude-3-5-sonnet)';
                case 'gemini': return 'Powerful & Smart (gemini-1.5-pro)';
                case 'deepseek': return 'Powerful & Smart (deepseek-reasoner)';
                case 'groq': return 'Powerful & Smart (llama-3.1-70b)';
                default: return 'Powerful & Smart';
            }
        }
    };

    if (loading) {
        return <div className="text-slate-500 dark:text-zinc-400 p-8 text-center animate-pulse">Loading AI settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 mt-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">AI Advisor Configuration</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">AI Provider</label>
                        <select
                            name="active_ai_provider"
                            value={settings.active_ai_provider}
                            onChange={handleChange}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                        >
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="gemini">Google (Gemini)</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="groq">Groq</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">API Key</label>
                        <input
                            type="password"
                            name="api_key"
                            value={settings[`${settings.active_ai_provider}_api_key`]}
                            onChange={handleChange}
                            placeholder={maskedKeys[settings.active_ai_provider] ? `Current: ${maskedKeys[settings.active_ai_provider]} (Leave blank to keep)` : "Enter API Key"}
                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-slate-900 dark:text-white">Model Selection</label>
                            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, ai_model_mode: 'simple' }))}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${settings.ai_model_mode === 'simple' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                                >
                                    Simple
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, ai_model_mode: 'advanced' }))}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${settings.ai_model_mode === 'advanced' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                                >
                                    Advanced
                                </button>
                            </div>
                        </div>

                        {settings.ai_model_mode === 'simple' ? (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">Model Tier</label>
                                <select
                                    name="ai_model_tier"
                                    value={settings.ai_model_tier}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                                >
                                    <option value="fast">{getModelTierLabel('fast', settings.active_ai_provider)}</option>
                                    <option value="smart">{getModelTierLabel('smart', settings.active_ai_provider)}</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">Custom Model String</label>
                                <input
                                    type="text"
                                    name="ai_custom_model"
                                    value={settings.ai_custom_model}
                                    onChange={handleChange}
                                    placeholder="e.g. gpt-4o-2024-05-13"
                                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                                />
                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">
                                    Exactly matches the model ID passed to the provider API. Leave blank to fallback.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className={`text-sm ${message.includes('Error') ? 'text-rose-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {message}
                    </span>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition text-white font-semibold shadow-sm"
                    >
                        {saving ? 'Saving...' : 'Save AI Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
