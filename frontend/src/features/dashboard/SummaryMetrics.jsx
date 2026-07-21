import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function SummaryMetrics() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        const { ok, data } = await apiClient('/api/dashboard/summary/');
        if (ok) {
            setMetrics(data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!metrics) {
        return <div className="text-red-400 text-sm mb-8">Failed to load metrics.</div>;
    }

    const { total_income, total_spent, remaining_budget, monthly_budget_target } = metrics;
    const progressPercent = Math.min((total_spent / (monthly_budget_target || 1)) * 100, 100);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Income Card */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm">
                <div className="text-emerald-600 dark:text-emerald-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Income</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(total_income)}</div>
            </div>

            {/* Spent Card */}
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 shadow-sm">
                <div className="text-rose-600 dark:text-rose-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Spent</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(total_spent)}</div>
            </div>

            {/* Budget Card */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 shadow-sm">
                <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">Remaining Budget</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{formatCurrency(remaining_budget)}</div>
                
                {/* Progress Bar */}
                <div className="w-full bg-indigo-100 dark:bg-slate-950 rounded-full h-2 mb-1 overflow-hidden">
                    <div 
                        className={`h-2 rounded-full ${progressPercent > 90 ? 'bg-rose-500' : progressPercent > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="text-right text-xs text-indigo-700/70 dark:text-slate-500">{progressPercent.toFixed(1)}% of {formatCurrency(monthly_budget_target)}</div>
            </div>
        </div>
    );
}
