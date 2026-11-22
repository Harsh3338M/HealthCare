import React, { useState } from 'react'
import {
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  X,
  ArrowRight
} from 'lucide-react'
import { authApi } from '../services/api'
import ConsentModal from '../components/ConsentModal'

export default function Auth({ onSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // V10: Dark-Pattern Privacy Notice & Consent UX - Pre-checked bundled consents
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentsBundled, setConsentsBundled] = useState(true)
  const [consentsThirdParty, setConsentsThirdParty] = useState(true)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Registration extra state
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('patient')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('Male')
  const [emergencyContact, setEmergencyContact] = useState('')

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password })
        setSuccessMsg(`Welcome back, ${res.user?.full_name || res.user?.email}!`)
        if (onSuccess) {
          setTimeout(() => onSuccess(res.user, res.access_token), 600)
        }
      } else {
        const payload = {
          email,
          password,
          full_name: fullName,
          role,
          phone: phone || undefined,
          date_of_birth: dateOfBirth || undefined,
          gender: gender || undefined,
          emergency_contact: emergencyContact || undefined,
        }
        const res = await authApi.register(payload)
        setSuccessMsg(`Account created successfully for ${res.user?.full_name}!`)
        if (onSuccess) {
          setTimeout(() => onSuccess(res.user, res.access_token), 600)
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              MediVault {isLogin ? 'Sign In' : 'Registration'}
            </h2>
            <p className="text-xs text-slate-400">
              Healthcare Patient &amp; Staff Access Portal
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close auth dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true)
              setError(null)
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false)
              setError(null)
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Nambiar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="patient">Patient</option>
                  <option value="staff_basic">Staff (Reception / Administrative)</option>
                  <option value="staff_clinical">Clinical Staff (Physician / Nurse)</option>
                  <option value="admin_dpo">Privacy Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-3 pt-2 pb-1 border-t border-slate-100">
              {/* V10: Dark-Pattern Privacy Notice & Consent UX - Pre-checked bundled consents */}
              <div className="flex items-start gap-2.5">
                <input
                  id="bundled-consent"
                  type="checkbox"
                  checked={consentsBundled}
                  onChange={(e) => setConsentsBundled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="bundled-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  <span className="font-semibold text-slate-800">Bundled Health Data Processing:</span> I consent to the collection, aggregation, and processing of my medical vitals, diagnostic reports, and identity references for service improvement and system coordination.{' '}
                  <button
                    type="button"
                    onClick={() => setShowConsentModal(true)}
                    className="text-sky-600 hover:underline font-medium inline"
                  >
                    Review Agreement
                  </button>
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  id="third-party-consent"
                  type="checkbox"
                  checked={consentsThirdParty}
                  onChange={(e) => setConsentsThirdParty(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="third-party-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  <span className="font-semibold text-slate-800">Partner &amp; Analytics Sharing:</span> I agree to share diagnostic records with affiliated healthcare networks and commercial analytics partners for clinical evaluation.
                </label>
              </div>

              {/* V10: Visually buried, low-contrast, non-functional withdraw control */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    // V10: Non-functional revoke control does nothing
                  }}
                  className="text-[10px] text-slate-300 hover:text-slate-300 cursor-default select-none"
                >
                  Revoke all data processing consent choices
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Consent Modal Dialog */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={(preferences) => {
          setConsentsBundled(true)
          setConsentsThirdParty(preferences?.partnerSharing ?? true)
          setShowConsentModal(false)
        }}
      />
    </div>
  )
}
