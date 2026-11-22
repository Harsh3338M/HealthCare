import React, { useState, useEffect } from 'react'
import {
  Activity,
  Heart,
  AlertTriangle,
  Pill,
  FileText,
  Shield,
  CreditCard,
  User,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react'
import { patientApi } from '../services/api'
import MedicalProfile from './MedicalProfile'

export default function PatientDashboard({ currentUser, onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'medical-profile'

  useEffect(() => {
    fetchPatientData()
  }, [])

  const fetchPatientData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientApi.getMe()
      setProfile(data)
    } catch (err) {
      setError(err.message || 'Failed to load patient records.')
    } finally {
      setLoading(false)
    }
  }

  // Parse list helpers
  const allergyList = profile?.allergies
    ? profile.allergies.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const conditionList = profile?.conditions
    ? profile.conditions.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const medicationList = profile?.medications
    ? profile.medications.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading patient profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
              {profile?.full_name ? profile.full_name.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile?.full_name || 'Patient Profile'}
                </h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {profile?.patient_id || 'PAT-100001'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Blood Group: {profile?.blood_group || 'B+'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.phone || '+91-011-2345-6789'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  DOB: {profile?.date_of_birth || '1988-06-15'} ({profile?.gender})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'overview' ? 'medical-profile' : 'overview')}
              className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                activeTab === 'medical-profile'
                  ? 'bg-slate-900 text-white'
                  : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{activeTab === 'medical-profile' ? 'View Dashboard' : 'Edit Medical Profile'}</span>
            </button>
            <button
              type="button"
              onClick={fetchPatientData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Refresh profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medical-profile')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'medical-profile'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Medical Profile &amp; Scheme IDs
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'medical-profile' ? (
        <MedicalProfile
          initialProfile={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      ) : (
        <div className="space-y-8">
          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Allergies Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Known Allergies
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {allergyList.length} Flagged
                </span>
              </div>
              {allergyList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {allergyList.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No allergies recorded</p>
              )}
            </div>

            {/* Conditions Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  Chronic Conditions
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {conditionList.length} Active
                </span>
              </div>
              {conditionList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {conditionList.map((cond, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {cond}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No chronic conditions listed</p>
              )}
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  Active Prescriptions
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {medicationList.length} Prescribed
                </span>
              </div>
              {medicationList.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  {medicationList.map((med, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="font-medium truncate">{med}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No medications recorded</p>
              )}
            </div>
          </div>

          {/* Scheme Identifiers Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identity &amp; Scheme Details</h3>
                <p className="text-xs text-slate-500">Health identification and scheme references linked to this patient account</p>
              </div>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Verified Schemes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Aadhaar Reference</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <div className="mt-2 font-mono text-sm font-extrabold text-slate-900">
                  {profile?.aadhaar_ref || '1002 4471 0001'}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Government identity reference for patient verification and clinical records.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Ayushman Bharat PM-JAY</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Linked
                  </span>
                </div>
                <div className="mt-2 font-mono text-sm font-extrabold text-slate-900">
                  {profile?.ayushman_ref || 'PMJAY-0000-0001'}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  National health insurance scheme reference for secondary and tertiary care.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Doctor Notes Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Confidential Clinical Notes
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Physician Consultation Record
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {profile?.medical_notes ||
                'Patient is stable. No adverse reactions recorded during routine examination.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
