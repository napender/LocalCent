import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-slideUp">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};
import AiSettings from '../settings/AiSettings';
import EmailSyncSettings from '../settings/EmailSyncSettings';
import { apiClient } from '../../services/api';

export default function OnboardingChecklist() {
    const [status, setStatus] = useState({
        has_api_key: false,
        has_android_sync: false,
        has_ios_sync: false,
        has_email_sync: false,
        progress_percentage: 0,
        is_complete: false
    });
    const [isVisible, setIsVisible] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    // Initial check for dismissed state
    useEffect(() => {
        const dismissed = localStorage.getItem('onboarding_dismissed') === 'true';
        if (dismissed) {
            setIsVisible(false);
        }
    }, []);

    const fetchStatus = async () => {
        const { ok, data } = await apiClient('/api/dashboard/onboarding/');
        if (ok) {
            setStatus(data);
            if (data.is_complete && !localStorage.getItem('onboarding_dismissed')) {
                // Auto dismiss when 100% complete
                setTimeout(() => {
                    handleDismiss();
                }, 3000);
            }
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (!isVisible) return;

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_dismissed', 'true');
    };

    if (!isVisible) return null;

    const tasks = [
        {
            id: 'android',
            label: 'Configure Android SMS Sync',
            description: 'Send SMS receipts from your Android phone',
            isComplete: status.has_android_sync,
        },
        {
            id: 'ios',
            label: 'Configure iOS SMS Sync',
            description: 'Set up Apple Shortcuts to sync receipts',
            isComplete: status.has_ios_sync,
        },
        {
            id: 'api_key',
            label: 'Add AI API Key',
            description: 'Enable AI-powered transaction categorization',
            isComplete: status.has_api_key,
        },
        {
            id: 'email',
            label: 'Configure Email Sync',
            description: 'Set up IMAP auto-fetch for statements',
            isComplete: status.has_email_sync,
        }
    ];

    return (
        <>
            <div className="mb-8 shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Getting Started</h2>
                        <div className="flex items-center gap-4">
                            <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                    style={{ width: `${status.progress_percentage}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {status.progress_percentage}% Complete
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleDismiss}
                        className="p-2 -m-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                        title="Dismiss"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => !task.isComplete && setActiveModal(task.id)}
                            className={`p-4 flex items-center gap-4 transition ${task.isComplete ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-60' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                task.isComplete 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                            }`}>
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-medium ${task.isComplete ? 'text-slate-600 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                    {task.label}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
                            </div>
                            {!task.isComplete && (
                                <svg className="w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={activeModal === 'android'} onClose={() => setActiveModal(null)} title="Android SMS Sync Setup">
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4">
                    <p>To automatically sync transactions from your Android phone, we recommend using an automation app like <strong>SmsForwarder</strong>, <strong>Tasker</strong>, or <strong>MacroDroid</strong>.</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Install your preferred automation app from the Play Store.</li>
                        <li>Create a new rule/macro triggered by incoming SMS from your bank.</li>
                        <li>
                            Set the action to send an HTTP POST request to your LocalCent server:
                            <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs break-all">
                                {window.location.protocol}//{window.location.hostname}:8000/api/webhooks/sms/
                            </code>
                        </li>
                        <li>
                            Configure the request body (JSON) to include:
                            <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                                <li><code>message</code>: The full text of the SMS</li>
                                <li><code>source</code>: <code>SMS_ANDROID</code></li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'ios'} onClose={() => setActiveModal(null)} title="iOS SMS Sync Setup">
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4">
                    <p>On iOS, you can use the built-in <strong>Shortcuts</strong> app to automatically forward bank receipts.</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Open the Shortcuts app and go to the <strong>Automation</strong> tab.</li>
                        <li>Tap <strong>+</strong> and select <strong>Message</strong>.</li>
                        <li>Set the Sender to your bank's number/name and choose "Run Immediately".</li>
                        <li>Tap "Next" and select "New Blank Automation".</li>
                        <li>Add the action <strong>"Get contents of URL"</strong>.</li>
                        <li>
                            Set the URL to:
                            <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs break-all">
                                {window.location.protocol}//{window.location.hostname}:8000/api/webhooks/sms/
                            </code>
                        </li>
                        <li>Expand the action and set Method to <strong>POST</strong>.</li>
                        <li>
                            Add Request Body (JSON) with:
                            <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                                <li><code>message</code> (Text): <em>Shortcut Input</em></li>
                                <li><code>source</code> (Text): <code>SMS_IOS</code></li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'api_key'} onClose={() => setActiveModal(null)} title="Add AI API Key">
                <AiSettings />
            </Modal>

            <Modal isOpen={activeModal === 'email'} onClose={() => setActiveModal(null)} title="Configure Email Sync">
                <EmailSyncSettings />
            </Modal>
        </>
    );
}
