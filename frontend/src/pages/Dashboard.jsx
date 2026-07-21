import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';
import useDarkMode from '../hooks/useDarkMode';
import OnboardingChecklist from '../features/dashboard/OnboardingChecklist';
import RecentTransactions from '../features/transactions/RecentTransactions';
import SummaryMetrics from '../features/dashboard/SummaryMetrics';
import SettingsForm from '../features/settings/SettingsForm';
import CardManagement from '../features/settings/CardManagement';
import AIAnalysisModal from '../features/ai-analysis/AIAnalysisModal';
import UpcomingBills from '../features/dashboard/UpcomingBills';
import CreditCardsWidget from '../features/dashboard/CreditCardsWidget';
import AiSettings from '../features/settings/AiSettings';
import EmailSyncSettings from '../features/settings/EmailSyncSettings';
import { apiClient } from '../services/api';

export default function Dashboard() {
    const { currentUser, logout } = useFamilyAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, toggleTheme] = useDarkMode();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'transactions', label: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-hidden">
            
            {/* Top Header (Mobile Only) */}
            <header className="md:hidden flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
                <img src="/logo-wide.png" alt="LocalCent" className="w-28 h-auto object-contain object-left" />
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-[100px]">{currentUser?.name}</span>
                    <button onClick={logout} className="p-2 rounded-full bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </header>

            {/* Mobile Action Rail */}
            <div className="md:hidden flex overflow-x-auto gap-2 p-4 pb-0 scrollbar-none items-center bg-slate-50 dark:bg-slate-950">
                <button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-sm font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    Ask AI Advisor
                </button>
            </div>

            {/* Sidebar (Desktop Only) */}
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="mb-8 flex items-center justify-center">
                    <img src="/logo-wide.png" alt="LocalCent" className="w-48 max-w-full h-auto object-contain drop-shadow-md transition-transform hover:scale-105" />
                </div>
                
                <nav className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                    <button 
                        onClick={toggleTheme} 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 w-full"
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser?.role}</span>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-slate-400 hover:text-rose-600 dark:hover:text-rose-400" title="Logout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                {activeTab === 'dashboard' && (
                    <div className="max-w-7xl mx-auto min-h-full flex flex-col">
                        <OnboardingChecklist />
                        <SummaryMetrics />
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
                            {/* Transactions takes 8 cols on large screens */}
                            <div className="md:col-span-8 h-[500px] lg:h-full">
                                <RecentTransactions />
                            </div>
                            
                            {/* Right Column (AI + Bills) */}
                            <div className="md:col-span-4 space-y-6 flex flex-col h-auto lg:h-full">
                                {/* AI Trigger */}
                                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Financial Advisor</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get personalized insights on your spending habits and budget management.</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 text-white font-bold"
                                    >
                                        Analyze Current Month
                                    </button>
                                </div>
                                
                                {/* Upcoming Bills */}
                                <div className="flex-1 min-h-[300px]">
                                    <UpcomingBills />
                                    <CreditCardsWidget />
                                </div>
                            </div>
                        </div>
                        
                        <AIAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="max-w-7xl mx-auto h-[800px] max-h-full">
                        <RecentTransactions />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-7xl mx-auto min-h-[800px] pb-12">
                        <SettingsForm />
                        <AiSettings />
                        <EmailSyncSettings />
                        <CardManagement />
                    </div>
                )}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-900 flex justify-around p-2 z-10 pb-safe">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center p-2 rounded-lg transition ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
