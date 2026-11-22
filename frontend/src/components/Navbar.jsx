import React, { useState } from 'react'
import { Activity, Shield, Users, FileText, Lock, Menu, X } from 'lucide-react'

export default function Navbar({ currentUser, onOpenAuth, onLogout, activeView, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (view) => {
    if (onNavigate) {
      onNavigate(view)
    }
    setMobileOpen(false)
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNav('overview')}
          >
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Vita</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Healthcare Patient &amp; Clinical Portal</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleNav('overview')}
              className={`transition-colors ${activeView === 'overview' ? 'text-sky-600 font-bold' : 'hover:text-slate-900'
                }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleNav('patient-portal')}
              className={`transition-colors flex items-center gap-1.5 ${activeView === 'patient-portal' ? 'text-sky-600 font-bold' : 'hover:text-slate-900'
                }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              Patient Portal
            </button>
            <button
              type="button"
              onClick={() => handleNav('medical-reports')}
              className={`transition-colors flex items-center gap-1.5 ${activeView === 'medical-reports' ? 'text-sky-600 font-bold' : 'hover:text-slate-900'
                }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              Medical Reports
            </button>
            <button
              type="button"
              onClick={() => handleNav('privacy-centre')}
              className={`transition-colors flex items-center gap-1.5 ${activeView === 'privacy-centre' ? 'text-sky-600 font-bold' : 'hover:text-slate-900'
                }`}
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Privacy Centre
            </button>
            <button
              type="button"
              onClick={() => handleNav('staff-portal')}
              className={`transition-colors flex items-center gap-1.5 ${activeView === 'staff-portal' ? 'text-sky-600 font-bold' : 'hover:text-slate-900'
                }`}
            >
              <Lock className="w-4 h-4 text-slate-400" />
              Staff Portal
            </button>
          </div>

          {/* Right Status / Auth Trigger */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                    {currentUser.full_name || currentUser.email}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-4 space-y-1">
          <button
            type="button"
            onClick={() => handleNav('overview')}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-sky-600 hover:bg-white"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleNav('patient-portal')}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => handleNav('medical-reports')}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Medical Reports
          </button>
          <button
            type="button"
            onClick={() => handleNav('privacy-centre')}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Privacy Centre
          </button>
          <button
            type="button"
            onClick={() => handleNav('staff-portal')}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-white"
          >
            Staff Portal
          </button>
          <div className="pt-2 border-t border-slate-200 mt-2">
            {currentUser ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="text-sm font-bold text-slate-800">{currentUser.full_name || currentUser.email}</div>
                  <div className="text-xs text-slate-500 font-mono">{currentUser.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onLogout()
                  }}
                  className="text-xs text-rose-600 font-semibold px-2 py-1 bg-white border border-rose-200 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  onOpenAuth()
                }}
                className="w-full text-center py-2 px-3 rounded-lg bg-sky-600 text-white font-semibold text-sm shadow-xs"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
