import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../../services/api';

export default function AIAnalysisModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAnalysis();
        }
    }, [isOpen]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setAnalysis('');
        setError('');
        
        const { ok, data, error: apiError } = await apiClient('/api/ai/analyze/', {
            method: 'POST',
            body: JSON.stringify({ timeframe: 'current_month' })
        });
        
        if (ok && data.success) {
            setAnalysis(data.analysis);
        } else {
            setError(data?.error || apiError || "Failed to fetch AI analysis.");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-slate-900 dark:text-white">AI Financial Advisor</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
                            <div className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">Analyzing your spending patterns...</div>
                        </div>
                    ) : error ? (
                        <div className="text-center p-6 bg-rose-50 dark:bg-red-950/20 border border-rose-100 dark:border-red-900/50 rounded-xl">
                            <p className="text-rose-600 dark:text-red-400 mb-4">{error}</p>
                            {error.includes("API Key") && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">Please go to Settings to configure your AI provider and API Key.</p>
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 text-right">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
