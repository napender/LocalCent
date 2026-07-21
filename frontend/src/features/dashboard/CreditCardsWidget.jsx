import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

export default function CreditCardsWidget() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        // Note: The backend dashboard_summary endpoint was updated to include credit_cards
        const { ok, data } = await apiClient('/api/dashboard/summary/');
        if (ok && data.credit_cards) {
            setCards(data.credit_cards);
        }
        setLoading(false);
    };

    if (loading && cards.length === 0) {
        return <div className="p-6 text-center text-slate-400 animate-pulse">Loading cards...</div>;
    }

    if (cards.length === 0) {
        return null; // Don't show the widget if there are no credit cards configured
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Credit Cards</h2>
            </div>
            
            <div className="p-5">
                <div className="space-y-3">
                    {cards.map(card => {
                        const dueSoon = card.days_until_due <= 5;
                        const overdue = card.days_until_due < 0;
                        
                        return (
                            <div key={card.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                        {card.bank_name} <span className="text-slate-500 text-xs ml-1">({card.last_four})</span>
                                    </div>
                                    <div className={`text-xs mt-0.5 ${overdue ? 'text-rose-600 dark:text-rose-500' : dueSoon ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500'}`}>
                                        {overdue 
                                            ? `Overdue by ${Math.abs(card.days_until_due)} days` 
                                            : `Due in ${card.days_until_due} days (${card.due_date})`}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 mb-0.5">Unbilled</div>
                                    <div className="font-bold tabular-nums text-slate-900 dark:text-slate-200">
                                        {formatCurrency(card.unbilled_amount)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
