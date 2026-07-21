import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function CardManagement() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCard, setNewCard] = useState({
        bank_name: '',
        account_type: 'Credit',
        last_four_digits: '',
        statement_day: '',
        due_day: '',
        pdf_password: ''
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        const { ok, data } = await apiClient('/api/accounts/');
        if (ok) {
            setAccounts(data);
        }
        setLoading(false);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const { ok } = await apiClient('/api/accounts/', {
            method: 'POST',
            body: JSON.stringify(newCard)
        });
        
        if (ok) {
            setIsModalOpen(false);
            setNewCard({
                bank_name: '',
                account_type: 'Credit',
                last_four_digits: '',
                statement_day: '',
                due_day: '',
                pdf_password: ''
            });
            fetchAccounts();
        } else {
            alert('Failed to add card.');
        }
    };

    if (loading && accounts.length === 0) {
        return <div className="text-slate-500 dark:text-zinc-400 p-8 text-center animate-pulse">Loading cards...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Credit Cards & Statements</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold text-sm shadow-sm"
                >
                    + Add Card
                </button>
            </div>
            
            {accounts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-500 text-sm border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                    No credit cards configured. Add one to track statements.
                </div>
            ) : (
                <div className="space-y-4">
                    {accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                            <div>
                                <div className="font-medium text-slate-900 dark:text-zinc-200">
                                    {acc.bank_name} {acc.account_type}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-500 mt-1 flex gap-3">
                                    <span>Ends in: {acc.last_four_digits || 'N/A'}</span>
                                    <span>Statement: {acc.statement_day || 'N/A'}</span>
                                    <span>Due: {acc.due_day || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="text-xs">
                                {acc.has_pdf_password ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-1 rounded-md">Password Set</span>
                                ) : (
                                    <span className="text-rose-600 dark:text-red-400 bg-rose-50 dark:bg-red-500/20 px-2 py-1 rounded-md">No Password</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Card</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">Bank Name</label>
                                <input required type="text" value={newCard.bank_name} onChange={e => setNewCard({...newCard, bank_name: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="e.g. HDFC" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">Last 4 Digits</label>
                                <input required type="text" maxLength="4" value={newCard.last_four_digits} onChange={e => setNewCard({...newCard, last_four_digits: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="1234" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">Statement Day</label>
                                    <input required type="number" min="1" max="31" value={newCard.statement_day} onChange={e => setNewCard({...newCard, statement_day: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="15" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">Due Day</label>
                                    <input required type="number" min="1" max="31" value={newCard.due_day} onChange={e => setNewCard({...newCard, due_day: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="5" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">Statement PDF Password</label>
                                <input type="password" value={newCard.pdf_password} onChange={e => setNewCard({...newCard, pdf_password: e.target.value})} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="To auto-read email PDFs" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm">Save Card</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
