import React, { useState } from 'react';

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                copied
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {copied ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copied
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                </>
            )}
        </button>
    );
};

export default function SmsSyncSettings() {
    const [activeTab, setActiveTab] = useState('android');
    const webhookUrl = `${window.location.protocol}//${window.location.hostname}:8000/api/webhooks/sms/`;

    return (
        <div className="max-w-2xl mx-auto p-8 mt-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">SMS Sync Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                Automatically forward bank SMS receipts from your phone to LocalCent for hands-free transaction tracking.
            </p>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setActiveTab('android')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'android'
                            ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                    }`}
                >
                    🤖 Android
                </button>
                <button
                    onClick={() => setActiveTab('ios')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'ios'
                            ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                    }`}
                >
                    🍎 iOS
                </button>
            </div>

            {/* Android Tab */}
            {activeTab === 'android' && (
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-6">
                    {/* App Recommendations */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Recommended Apps</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <a
                                href="https://github.com/pppscn/SmsForwarder"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 hover:border-amber-400 dark:hover:border-amber-500/40 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">SmsForwarder</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">Free & Open Source</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Forward SMS to HTTP endpoints. Easiest to configure.</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition">Tasker</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">Paid</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Most powerful Android automation. For advanced users.</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition">MacroDroid</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">Freemium</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Beginner-friendly with a visual macro builder.</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Setup Steps</h4>
                        <ol className="space-y-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">1</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Pick an app above and install it from the Play Store</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We recommend <strong>SmsForwarder</strong> — it's free, open source, and purpose-built for this.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Create a rule triggered by incoming SMS from your bank</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">In SmsForwarder: Add Rule → "SMS" → pick your bank's sender number.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">3</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Set the action: HTTP POST to your LocalCent webhook</p>
                                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Webhook URL</span>
                                            <CopyButton text={webhookUrl} />
                                        </div>
                                        <code className="block text-xs text-indigo-600 dark:text-indigo-400 break-all font-mono">
                                            {webhookUrl}
                                        </code>
                                    </div>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">4</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Set Method to <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">POST</code> and Content-Type to <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">application/json</code></p>
                                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">JSON Body</span>
                                            <CopyButton text={`{"message": "[SMS text]", "source": "SMS_ANDROID"}`} />
                                        </div>
                                        <code className="block text-xs text-slate-700 dark:text-slate-300 break-all font-mono whitespace-pre">
                                            {'{"message": "[SMS text]","source": "SMS_ANDROID"}'}
                                        </code>
                                    </div>
                                    <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <li>• <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">message</code> → The full SMS text body</li>
                                        <li>• <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">source</code> → Always <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">"SMS_ANDROID"</code></li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">5</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Send a test SMS and verify it appears in your Transactions</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <div className="flex gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                        <span className="text-base">💡</span>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> Make sure your phone and this computer are on the <strong>same Wi-Fi network</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* iOS Tab */}
            {activeTab === 'ios' && (
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-6">
                    <div className="flex gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-slate-200">Apple Shortcuts</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Built into every iPhone and iPad. No extra app needed.</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Setup Steps</h4>
                        <ol className="space-y-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">1</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Open <strong>Shortcuts</strong> → <strong>Automation</strong> tab → tap <strong>+</strong></p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Choose <strong>"Message"</strong> as the trigger</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set Sender to your bank's number. Select "Run Immediately" and disable "Notify When Run".</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">3</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Add action: <strong>"Get contents of URL"</strong></p>
                                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Webhook URL</span>
                                            <CopyButton text={webhookUrl} />
                                        </div>
                                        <code className="block text-xs text-indigo-600 dark:text-indigo-400 break-all font-mono">
                                            {webhookUrl}
                                        </code>
                                    </div>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">4</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Configure the request</p>
                                    <ul className="mt-1 space-y-1.5">
                                        <li className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400 w-16 shrink-0">Method:</span>
                                            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">POST</code>
                                        </li>
                                        <li className="flex items-start gap-2 text-xs">
                                            <span className="text-slate-400 w-16 shrink-0 mt-0.5">Body:</span>
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] text-slate-400">JSON</span>
                                                    <CopyButton text={`{"message": "[Shortcut Input]", "source": "SMS_IOS"}`} />
                                                </div>
                                                <code className="block text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre">
                                                    {'{"message": "[Shortcut Input]","source": "SMS_IOS"}'}
                                                </code>
                                            </div>
                                        </li>
                                    </ul>
                                    <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <li>• <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">message</code> → Tap and select <strong>Shortcut Input</strong></li>
                                        <li>• <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">source</code> → Type <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">"SMS_IOS"</code></li>
                                    </ul>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">5</span>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">Run the shortcut to test</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Trigger a real SMS from your bank or test with any message.</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <div className="flex gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                        <span className="text-base">💡</span>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> Apple Shortcuts automations only work when your iPhone is <strong>unlocked and on the same Wi-Fi</strong> as your LocalCent server.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
