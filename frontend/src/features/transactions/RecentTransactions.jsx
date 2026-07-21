import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

const CATEGORIES = [
    "Uncategorized",
    "Food & Dining",
    "Transport",
    "Utilities",
    "Shopping",
    "Salary",
    "Entertainment",
    "Health",
    "Housing",
    "Other"
];

const getCategoryColor = (category) => {
    switch(category) {
        case "Food & Dining": return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
        case "Transport": return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
        case "Utilities": return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400";
        case "Shopping": return "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400";
        case "Salary": return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
        case "Entertainment": return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
        case "Health": return "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400";
        case "Housing": return "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400";
        default: return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"; // Uncategorized or Other
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export default function RecentTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingTxId, setUpdatingTxId] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { ok, data } = await apiClient('/api/transactions/');
            if (ok && Array.isArray(data)) {
                setTransactions(data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (txId, newCategory) => {
        setUpdatingTxId(txId);
        try {
            const { ok } = await apiClient(`/api/transactions/${txId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ category: newCategory, create_rule: true })
            });
            
            if (ok) {
                // Optimistically update the UI
                setTransactions(prev => prev.map(tx => 
                    tx.id === txId ? { ...tx, category: newCategory } : tx
                ));
            } else {
                alert("Failed to update category.");
            }
        } catch (error) {
            console.error("Error updating category", error);
        } finally {
            setUpdatingTxId(null);
        }
    };

    if (loading && transactions.length === 0) {
        return <div className="p-6 text-center text-slate-400 animate-pulse">Loading transactions...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
                <button 
                    onClick={fetchTransactions} 
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition"
                >
                    Refresh
                </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="text-slate-500 dark:text-slate-400 text-sm mb-2">Waiting for incoming transactions...</div>
                        <div className="text-slate-400 dark:text-slate-500 text-xs">Setup your iOS Shortcut or Android Tasker to point to your local IP.</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition gap-4">
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900 dark:text-slate-200">{tx.merchant_name}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {new Date(tx.timestamp).toLocaleString()} • {tx.account_last_4}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                    {/* Category Select */}
                                    <div className="relative">
                                        <select 
                                            value={tx.category || "Uncategorized"} 
                                            onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                                            disabled={updatingTxId === tx.id}
                                            className={`appearance-none text-xs font-semibold px-3 py-1.5 rounded-full outline-none cursor-pointer transition ${getCategoryColor(tx.category)} ${updatingTxId === tx.id ? 'opacity-50' : 'hover:brightness-110'}`}
                                            title="Change category & teach the AI"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cat}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className={`font-bold tabular-nums whitespace-nowrap ${tx.transaction_type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {tx.transaction_type === 'CREDIT' ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
