import React, { useState } from 'react';
import { useFamilyAuth } from '../context/FamilyAuthContext';

export default function SetupWizard() {
  const { completeSetup } = useFamilyAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Centralized state for all wizard steps
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    question1: 'pet',
    answer1: '',
    question2: 'city',
    answer2: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors when user types
  };

  // Step Navigators with Validation
  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        return setError('Please fill out all fields to continue.');
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        return setError('Please enter a valid email address.');
      }
    }
    
    if (step === 2) {
      if (!formData.answer1 || !formData.answer2) {
        return setError('Please provide answers for both security questions.');
      }
    }

    setStep((prev) => prev + 1);
  };

  const handlePrev = () => setStep((prev) => prev - 1);

  // Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid || formData.password !== formData.confirmPassword) {
      return setError('Please ensure your passwords match and meet the requirements.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          question_1: formData.question1,
          answer_1: formData.answer1,
          question_2: formData.question2,
          answer_2: formData.answer2,
          imap_email: formData.imap_email,
          imap_password: formData.imap_password
      };

      const response = await fetch('/api/auth/setup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create account. Email might be in use.');
      }
      
      const data = await response.json();
      completeSetup(data.user);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Password Validation Checks
  const hasLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);
  const isPasswordValid = hasLength && hasNumber && hasSpecial;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
        
        {/* Header & Progress Indicator */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm mb-4 mx-auto flex items-center justify-center bg-white dark:bg-slate-800">
            <img src="/logo.png" alt="LocalCent" className="w-24 h-24 max-w-none object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to LocalCent</h1>
          <p className="text-sm text-slate-500">Let's set up your secure admin account.</p>
          
          <div className="flex justify-center items-center gap-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 w-12 rounded-full transition-colors duration-300 ${
                  step >= i ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm rounded-lg border border-rose-100 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* --- STEP 1: Basic Info --- */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1. Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* --- STEP 2: Security Questions --- */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2. Security Recovery</h2>
            <p className="text-xs text-slate-500 mb-4">If you lose your password and email access, these will recover your account.</p>
            
            <div>
              <select 
                name="question1" 
                value={formData.question1} 
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-sm mb-2 focus:outline-none"
              >
                <option value="pet">What was the name of your first pet?</option>
                <option value="mother_maiden">What is your mother's maiden name?</option>
                <option value="car">What was the make of your first car?</option>
              </select>
              <input
                type="text"
                name="answer1"
                placeholder="Your Answer"
                value={formData.answer1}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <select 
                name="question2" 
                value={formData.question2} 
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-sm mb-2 focus:outline-none"
              >
                <option value="city">In what city were you born?</option>
                <option value="school">What was the name of your first school?</option>
              </select>
              <input
                type="text"
                name="answer2"
                placeholder="Your Answer"
                value={formData.answer2}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* --- STEP 3: Password --- */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">3. Secure Your Vault</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Master Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Real-time Validation UI */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-4 space-y-1 text-sm">
              <div className={`flex items-center gap-2 ${hasLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span>{hasLength ? '✓' : '○'}</span> At least 8 characters
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span>{hasNumber ? '✓' : '○'}</span> Contains a number
              </div>
              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span>{hasSpecial ? '✓' : '○'}</span> Contains a special character (!@#$%)
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 4: Email Sync (Optional) --- */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">4. Email Sync (Optional)</h2>
            <p className="text-xs text-slate-500 mb-4">Configure IMAP so LocalCent can automatically fetch your credit card statements. You can also skip this and set it up later.</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="imap_email"
                placeholder="e.g. statements@gmail.com"
                value={formData.imap_email || ''}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Password</label>
              <input
                type="password"
                name="imap_password"
                placeholder="IMAP App Password"
                value={formData.imap_password || ''}
                onChange={handleChange}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isPasswordValid || isSubmitting}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isPasswordValid && !isSubmitting ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Setup'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
