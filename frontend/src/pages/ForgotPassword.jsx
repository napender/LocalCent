import React, { useState } from 'react';


export default function ForgotPassword({ onBack }) {
    // Steps: 
    // 0 = Choose Method
    // 1 = Enter Email (for security questions)
    // 2 = Answer Questions
    // 3 = Enter Email (for email link)
    const [step, setStep] = useState(0);
    
    // State
    const [email, setEmail] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [newPassword, setNewPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
    const isPasswordValid = hasLength && hasNumber && hasSpecial;

    const handleSendEmailLink = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/auth/forgot-password/email/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                setEmailSent(true);
            } else {
                setError(data.error || "Failed to send email.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFetchQuestions = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/auth/recover/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                setQuestions(data.questions);
                setStep(2);
            } else {
                setError(data.error || "User not found.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        setIsSubmitting(true);
        
        const formattedAnswers = questions.map(q => ({
            id: q.id,
            answer: answers[q.id] || ''
        }));
        
        try {
            const res = await fetch('/api/auth/reset-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, answers: formattedAnswers, new_password: newPassword })
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to reset password.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
                    <p className="text-slate-500 mb-6">Your password has been successfully updated.</p>
                    <button onClick={onBack} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">Return to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => {
                        if (step === 0 || emailSent || success) {
                            onBack();
                        } else {
                            setStep(0);
                            setError(null);
                        }
                    }} 
                    className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mb-6 flex items-center"
                >
                    &larr; Back
                </button>
                
                <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                <p className="text-slate-500 mb-6 text-sm">
                    {step === 0 && "How would you like to reset your password?"}
                    {step === 1 && "Enter your email address to find your account."}
                    {step === 2 && "Answer your security questions to set a new password."}
                    {step === 3 && !emailSent && "Enter your email address to receive a reset link."}
                    {emailSent && "Check your inbox for the recovery link!"}
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 0 && (
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => setStep(3)}
                            className="w-full py-4 px-6 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-left rounded-xl transition flex flex-col group"
                        >
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Send Email Link</span>
                            <span className="text-sm text-slate-500">We'll send a secure reset link to your inbox.</span>
                        </button>
                        <button 
                            onClick={() => setStep(1)}
                            className="w-full py-4 px-6 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-left rounded-xl transition flex flex-col group"
                        >
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Answer Security Questions</span>
                            <span className="text-sm text-slate-500">Answer the questions you set up during initial registration.</span>
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleFetchQuestions}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                placeholder="your@email.com"
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 transition">
                            {isSubmitting ? 'Searching...' : 'Find Account'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        {questions.map((q, idx) => (
                            <div key={q.id} className="mb-4">
                                <label className="block text-sm font-medium mb-1">Question {idx + 1}</label>
                                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2 font-medium bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg">{q.question_text}</div>
                                <input
                                    type="text"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                    placeholder="Your answer"
                                />
                            </div>
                        ))}
                        
                        <div className="mb-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mb-2"
                                placeholder="••••••••"
                            />
                            <div className="text-xs text-slate-500 flex gap-2">
                                <span className={hasLength ? 'text-emerald-500' : ''}>8+ chars</span> &bull;
                                <span className={hasNumber ? 'text-emerald-500' : ''}>1 number</span> &bull;
                                <span className={hasSpecial ? 'text-emerald-500' : ''}>1 special char</span>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting || !isPasswordValid} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 transition">
                            {isSubmitting ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {step === 3 && !emailSent && (
                    <form onSubmit={handleSendEmailLink}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                                placeholder="your@email.com"
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 transition">
                            {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
                        </button>
                    </form>
                )}

                {step === 3 && emailSent && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            If an account exists with the email <strong>{email}</strong>, a reset link has been sent.
                        </p>
                        <button onClick={onBack} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition">
                            Return to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
