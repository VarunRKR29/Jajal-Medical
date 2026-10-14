import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Activity, AlertCircle, Lock, Mail, ShieldCheck, ShieldAlert, Wrench, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@jajalmedical.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: Record<string, string[]> };
      setErrorMsg(errorObj.message || 'These credentials do not match our records.');
      if (errorObj.errors) {
        setFieldErrors(errorObj.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
    setErrorMsg(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background medical ambient mesh glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-950/40 via-blue-950/20 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-3">
          <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          MedCase Implant Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Authorized Clinical & Surgical Case Tracking System
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 py-6 sm:py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Authentication Failed</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Medical Staff Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@jajalmedical.com"
                  className={`block w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    fieldErrors.email ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`block w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    fieldErrors.password ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Sign In to Portal <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Assignment Reviewer */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Reviewer Accounts (Dummy)
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@jajalmedical.com')}
                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                  email === 'admin@jajalmedical.com'
                    ? 'border-cyan-500/80 bg-cyan-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded bg-cyan-900/60 text-cyan-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Admin Account (Dr. Sarah)</div>
                    <div className="text-[10px] text-slate-400">admin@jajalmedical.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  Full CRUD
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('viewer@jajalmedical.com')}
                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                  email === 'viewer@jajalmedical.com'
                    ? 'border-amber-500/80 bg-amber-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded bg-amber-900/60 text-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Viewer Account (Nurse Chen)</div>
                    <div className="text-[10px] text-slate-400">viewer@jajalmedical.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                  Read Only
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('engineer@jajalmedical.com')}
                className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                  email === 'engineer@jajalmedical.com'
                    ? 'border-purple-500/80 bg-purple-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded bg-purple-900/60 text-purple-300">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Engineer Role (Bonus)</div>
                    <div className="text-[10px] text-slate-400">engineer@jajalmedical.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                  No Delete
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Medical Device Case Management Platform &bull; Jajal Medical
        </p>
      </div>
    </div>
  );
};
