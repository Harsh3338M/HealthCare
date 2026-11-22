import React from 'react'
import { ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react'

export default function ModeBanner({ mode, loading, onToggle }) {
  const isVulnerable = mode === 'LAB_VULNERABLE'

  return (
    <div
      role="region"
      aria-label="Security Mode Indicator"
      className={`transition-colors duration-200 border-b px-4 py-2.5 text-sm sm:px-6 shadow-sm ${
        isVulnerable
          ? 'bg-amber-500 text-amber-950 border-amber-600'
          : 'bg-emerald-700 text-emerald-50 border-emerald-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-1.5 rounded-md flex-shrink-0 ${
              isVulnerable ? 'bg-amber-600/30 text-amber-950' : 'bg-emerald-800/40 text-emerald-100'
            }`}
          >
            {isVulnerable ? (
              <ShieldAlert className="w-5 h-5 text-red-900" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isVulnerable
                    ? 'bg-red-700 text-white ring-1 ring-red-800'
                    : 'bg-emerald-900 text-emerald-200 ring-1 ring-emerald-600'
                }`}
              >
                {isVulnerable ? 'LAB_VULNERABLE (Exploits Active)' : 'LAB_REMEDIATED (Hardened)'}
              </span>
              <span className="font-semibold text-xs sm:text-sm">
                {isVulnerable
                  ? 'Intentionally simulating 12 healthcare privacy & security flaws'
                  : 'All security safeguards, RBAC, and data minimization controls active'}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5 hidden sm:block">
              {isVulnerable
                ? 'Educational Hackathon Prototype: Synthetic demo data only. Demonstrating IDOR, static leaks, and storage flaws.'
                : 'Synthetic data is masked (XXXX-XXXX-0001), routes verify token ownership, and audit logs redact sensitive PII.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={onToggle}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${
              isVulnerable
                ? 'bg-amber-950 text-white hover:bg-black focus:ring-amber-900'
                : 'bg-white text-emerald-900 hover:bg-emerald-50 focus:ring-emerald-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {isVulnerable ? 'Switch to Remediated Mode' : 'Switch to Vulnerable Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
