import React, { useState } from 'react'
import {
  Lock,
  Mail,
  User,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Stethoscope,
  Building,
  KeyRound,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { authApi } from '../services/api'

// Pre-seeded Demo Accounts for Quick Fill
const DEMO_ACCOUNTS = [
  {
    role: 'patient',
    id: 'PAT-DEMO-001',
    label: 'Patient 01',
    name: 'Aarav Sharma',
    email: 'patient01@example.test',
    password: 'Password123!',
    desc: 'Synthetic patient with diabetic clinical history',
    icon: UserCheck,
    color: 'sky',
  },
  {
    role: 'patient',
    id: 'PAT-DEMO-002',
    label: 'Patient 02',
    name: 'Priya Patel',
    email: 'patient02@example.test',
    password: 'Password123!',
    desc: 'Target of IDOR cross-record exposure',
    icon: User,
    color: 'teal',
  },
  {
    role: 'staff_basic',
    id: 'STF-DEMO-001',
    label: 'Reception Desk',
    name: 'Rohan Verma',
    email: 'reception@example.test',
    password: 'Password123!',
    desc: 'Clerk account (Excessive Privileges test)',
    icon: Building,
    color: 'amber',
  },
  {
    role: 'staff_clinical',
    id: 'STF-DEMO-002',
    label: 'Chief Doctor',
    name: 'Dr. Ananya Rao',
    email: 'doctor@example.test',
    password: 'Password123!',
    desc: 'Authorized clinical physician access',
    icon: Stethoscope,
    color: 'indigo',
  },
  {
    role: 'admin_dpo',
    id: 'ADM-DEMO-001',
    label: 'Privacy Officer',
    name: 'Suresh Menon',
    email: 'privacy@example.test',
    password: 'Password123!',
    desc: 'DPO administrator with audit access',
    icon: Shield,
    color: 'purple',
  },
]

export default function Auth({ onSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [activePreset, setActivePreset] = useState(null)

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

  // Handle Quick Demo Preset Fill
  const handleQuickFill = (acc) => {
    setIsLogin(true)
    setEmail(acc.email)
    setPassword(acc.password)
    setActivePreset(acc.label)
    setError(null)
  }

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
        setSuccessMsg(`Synthetic account created for ${res.user?.full_name}!`)
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
              MediVault {isLogin ? 'Authentication' : 'Registration'}
            </h2>
            <p className="text-xs text-slate-400">
              Healthcare Privacy &amp; Security Lab Access (Synthetic Data Only)
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
        {/* Synthetic Data Educational Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Synthetic Testing Credentials Only: </span>
            The pre-seeded accounts below are provided exclusively for simulating healthcare access controls,
            IDOR scenarios, and role separation. Never use real passwords or personal identity numbers.
          </div>
        </div>

        {/* Quick Demo Credential Fill Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Quick-Fill Demo Roles (Pre-seeded)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Password: Password123!</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComp = acc.icon
              const isSelected = activePreset === acc.label
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all relative ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <IconComp className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span className="truncate">{acc.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{acc.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{acc.role}</div>
                </button>
              )
            })}
          </div>
        </div>

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
            Sign In with Existing Demo Account
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false)
              setError(null)
              setActivePreset(null)
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register New Synthetic Patient
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
                Full Name (Synthetic)
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
              Email Address / Demo Identifier
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. patient01@example.test"
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
                placeholder="Password123!"
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
                  <option value="patient">Patient (Synthetic Patient)</option>
                  <option value="staff_basic">Staff Basic (Reception/Clerk)</option>
                  <option value="staff_clinical">Staff Clinical (Doctor/Nurse)</option>
                  <option value="admin_dpo">Admin DPO (Privacy Officer)</option>
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
                  Synthetic Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91-98765-00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
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
                <span>{isLogin ? 'Sign In to Healthcare Portal' : 'Register Synthetic Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
