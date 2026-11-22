import React, { useState, useEffect } from 'react'
import ModeBanner from './components/ModeBanner'
import Navbar from './components/Navbar'
import Auth from './pages/Auth'
import PatientDashboard from './pages/PatientDashboard'
import Reports from './pages/Reports'
import { authApi, tokenService } from './services/api'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileText,
  Users,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Database,
  FileLock2,
  LogIn,
  UserCheck
} from 'lucide-react'

export default function App() {
  const [mode, setMode] = useState('LAB_VULNERABLE')
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')
  const [currentUser, setCurrentUser] = useState(() => tokenService.getUser())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeView, setActiveView] = useState('overview')

  // Fetch initial mode and verify session from backend
  useEffect(() => {
    fetchMode()
    if (tokenService.getToken()) {
      verifySession()
    }
  }, [])

  const verifySession = async () => {
    try {
      const user = await authApi.getMe()
      setCurrentUser(user)
    } catch {
      // Token expired or invalid
      tokenService.clearAuth()
      setCurrentUser(null)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    setCurrentUser(null)
  }

  const fetchMode = async () => {
    try {
      const res = await fetch('/api/mode')
      if (res.ok) {
        const data = await res.json()
        if (data.app_mode) {
          setMode(data.app_mode)
          setServerStatus('connected')
          return
        }
      }
      setServerStatus('offline')
    } catch {
      setServerStatus('offline')
    }
  }

  const handleToggleMode = async () => {
    setLoading(true)
    const nextMode = mode === 'LAB_VULNERABLE' ? 'LAB_REMEDIATED' : 'LAB_VULNERABLE'
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode }),
      })
      if (res.ok) {
        const data = await res.json()
        setMode(data.app_mode || nextMode)
        setServerStatus('connected')
      } else {
        // Fallback for offline dev testing
        setMode(nextMode)
      }
    } catch {
      // Fallback for offline dev testing
      setMode(nextMode)
    } finally {
      setLoading(false)
    }
  }

  const isVulnerable = mode === 'LAB_VULNERABLE'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Educational Mode Banner */}
      <ModeBanner mode={mode} loading={loading} onToggle={handleToggleMode} />

      {/* Global Navigation Bar */}
      <Navbar
        mode={mode}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        activeView={activeView}
        onNavigate={setActiveView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Active View: Patient Portal */}
        {activeView === 'patient-portal' ? (
          currentUser ? (
            <PatientDashboard
              currentUser={currentUser}
              mode={mode}
              onNavigate={setActiveView}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Synthetic Patient Portal Access</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sign in with a seeded synthetic account (such as <span className="font-semibold text-slate-800">Patient 01 (Aarav Sharma)</span> or <span className="font-semibold text-slate-800">Patient 02 (Priya Patel)</span>) to access clinical vitals, allergies, conditions, and synthetic health ID cards.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Demo Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('overview')}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Back to Overview
                </button>
              </div>
            </div>
          )
        ) : activeView === 'medical-reports' ? (
          <Reports
            currentUser={currentUser}
            mode={mode}
            onNavigate={setActiveView}
          />
        ) : (
          <>
            {/* Notice Card: Hackathon & Synthetic Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Synthetic Healthcare Lab Environment: </span>
            This application is an educational prototype built exclusively with fictional patients, demo credentials,
            and watermarked documents. It does not integrate with real UIDAI Aadhaar, PM-JAY, or healthcare databases.
            Never input real personally identifiable information (PII).
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-4">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Backend Connection: {serverStatus === 'connected' ? 'FastAPI Online' : 'Local Standalone'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              MediVault Healthcare Privacy &amp; Security Lab
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore how architectural oversights in healthcare portals compromise sensitive patient health records,
              dummy identity numbers, and consent rights—and inspect the remediated secure-by-default architecture.
            </p>
          </div>

          {/* Mode Highlights Card */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-5 rounded-xl border transition-all ${
                isVulnerable
                  ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className={`w-5 h-5 ${isVulnerable ? 'text-rose-600' : 'text-slate-400'}`} />
                <h3 className="font-bold text-sm text-slate-900">LAB_VULNERABLE State (12 Flaws)</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  IDOR on Patient Records (`GET /api/patients/:id`)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Unauthenticated Static PDF & Backup Serving (`/public/backups/`)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Plaintext Dummy Aadhaar & Password Hashes Leaked in JSON
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Dark-Pattern Bundled Consent & Soft-Delete Retention
                </li>
              </ul>
            </div>

            <div
              className={`p-5 rounded-xl border transition-all ${
                !isVulnerable
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-5 h-5 ${!isVulnerable ? 'text-emerald-600' : 'text-slate-400'}`} />
                <h3 className="font-bold text-sm text-slate-900">LAB_REMEDIATED State (Hardened)</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Strict Token Ownership & Role-Based Access Control
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Authenticated PDF Streaming & File Signature Validation
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Sanitized DTOs & Masked Identifiers (`XXXX-XXXX-0001`)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Hard-Deletion Purge, Granular Consent & Incident Log Correlation
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Portal Feature Modules */}
        <div id="overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setActiveView('patient-portal')}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-sky-300 group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Patient Dashboard</h4>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-normal">
              Manage clinical summary, vitals, allergies, and synthetic ID references.
            </p>
          </div>

          <div
            onClick={() => setActiveView('medical-reports')}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-purple-300 group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Medical Reports</h4>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-normal">
              Upload, preview, and download watermarked dummy lab reports and prescriptions.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Privacy Centre</h4>
            <p className="mt-1 text-xs text-slate-500 leading-normal">
              Inspect purpose limitation, configure granular consent, and submit data-rights requests.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Staff Portal</h4>
            <p className="mt-1 text-xs text-slate-500 leading-normal">
              Staff patient queue, clinical record inspector, and breach simulation panel.
            </p>
          </div>
        </div>
      </>
    )}
  </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            MediVault — Healthcare Privacy &amp; Security Lab Prototype
          </p>
          <p>
            Educational Hackathon Project. All names, profiles, and health records are synthetically generated.
          </p>
        </div>
      </footer>

      {/* Authentication Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <Auth
              onSuccess={(user) => {
                setCurrentUser(user)
                setShowAuthModal(false)
              }}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
