import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Auth from './pages/Auth'
import PatientDashboard from './pages/PatientDashboard'
import Reports from './pages/Reports'
import StaffDashboard from './pages/StaffDashboard'
import Home from './pages/Home'
import PrivacyCentre from './pages/PrivacyCentre'
import { authApi, tokenService } from './services/api'
import {
  Users,
  LogIn
} from 'lucide-react'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => tokenService.getUser())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Global Navigation Bar */}
      <Navbar
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
              onNavigate={setActiveView}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Patient Portal Access</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Please sign in with your patient account credentials to access clinical summaries, vitals, allergies, conditions, and health identification details.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Access Portal</span>
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
            onNavigate={setActiveView}
          />
        ) : activeView === 'privacy-centre' ? (
          <PrivacyCentre
            currentUser={currentUser}
            onNavigate={setActiveView}
          />
        ) : activeView === 'staff-portal' ? (
          <StaffDashboard
            currentUser={currentUser}
            onNavigate={setActiveView}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        ) : (
          <Home
            currentUser={currentUser}
            onNavigate={setActiveView}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            MediVault — Healthcare Patient Portal &amp; Clinical Services Platform
          </p>
          <p>
            Dedicated to patient care, electronic health record management, and secure services.
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
