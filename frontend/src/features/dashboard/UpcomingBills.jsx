import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function UpcomingBills() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    
    // Modal state for adding a bill
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newBill, setNewBill] = useState({ merchant_name: '', expected_amount: '', next_due_date: '' });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        const { ok, data } = await apiClient('/api/bills/');
        if (ok) {
            setBills(data);
        }
        setLoading(false);
    };

    const handleScan = async () => {
        setScanning(true);
        const { ok, data } = await apiClient('/api/bills/scan/', { method: 'POST' });
        if (ok) {
            alert(`Scan complete. ${data.detected_count} new recurring bills detected.`);
            fetchBills();
        } else {
            alert('Failed to scan for bills.');
        }
        setScanning(false);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const { ok } = await apiClient('/api/bills/', {
            method: 'POST',
            body: JSON.stringify(newBill)
        });
        
        if (ok) {
            setIsAddModalOpen(false);
            setNewBill({ merchant_name: '', expected_amount: '', next_due_date: '' });
            fetchBills();
        } else {
            alert('Failed to add bill.');
        }
    };

    const isDueSoon = (dateStr) => {
        const due = new Date(dateStr);
        const now = new Date();
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 5;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading && bills.length === 0) {
        return <div className="p-6 text-center text-slate-400 animate-pulse">Loading subscriptions...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Upcoming Bills
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleScan}
                        disabled={scanning}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition disabled:opacity-50"
                    >
                        {scanning ? 'Scanning...' : 'Scan Auto'}
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        + Add
                    </button>
                </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
                {bills.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No recurring bills detected. Scan to auto-detect or add manually.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bills.map((bill) => {
                            const dueSoon = !bill.is_paid_this_month && isDueSoon(bill.next_due_date);
                            
                            return (
                                <div key={bill.id} className={`flex justify-between items-center p-4 rounded-xl border ${bill.is_paid_this_month ? 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/30' : dueSoon ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/50'}`}>
                                    <div className={bill.is_paid_this_month ? 'opacity-50 line-through text-slate-500' : ''}>
                                        <div className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                                            {bill.merchant_name}
                                            {bill.is_auto_detected && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full not-italic normal-case no-underline">Auto</span>}
                                        </div>
                                        <div className={`text-xs mt-1 ${dueSoon ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500'}`}>
                                            Due: {new Date(bill.next_due_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <div className={`font-bold tabular-nums ${bill.is_paid_this_month ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {formatCurrency(bill.expected_amount)}
                                        </div>
                                        {bill.is_paid_this_month && (
                                            <div className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1 font-semibold">
                                                Paid
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Manual Bill Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Fixed Expense</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Merchant / Bill Name</label>
                                <input required type="text" value={newBill.merchant_name} onChange={e => setNewBill({...newBill, merchant_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount (₹)</label>
                                <input required type="number" step="0.01" value={newBill.expected_amount} onChange={e => setNewBill({...newBill, expected_amount: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Next Due Date</label>
                                <input required type="date" value={newBill.next_due_date} onChange={e => setNewBill({...newBill, next_due_date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">Save Bill</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
