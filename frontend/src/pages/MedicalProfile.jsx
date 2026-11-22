import React, { useState, useEffect } from 'react'
import {
  Heart,
  AlertTriangle,
  Pill,
  FileText,
  User,
  Shield,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react'
import { patientApi } from '../services/api'

export default function MedicalProfile({ initialProfile, onProfileUpdated, mode }) {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    blood_group: '',
    allergies: '',
    conditions: '',
    medications: '',
    medical_notes: '',
    aadhaar_demo_ref: '',
    ayushman_demo_ref: '',
  })

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        full_name: initialProfile.full_name || '',
        date_of_birth: initialProfile.date_of_birth || '',
        gender: initialProfile.gender || 'Male',
        phone: initialProfile.phone || '',
        email: initialProfile.email || '',
        address: initialProfile.address || '',
        emergency_contact: initialProfile.emergency_contact || '',
        blood_group: initialProfile.blood_group || '',
        allergies: initialProfile.allergies || '',
        conditions: initialProfile.conditions || '',
        medications: initialProfile.medications || '',
        medical_notes: initialProfile.medical_notes || '',
        aadhaar_demo_ref: initialProfile.aadhaar_demo_ref || '',
        ayushman_demo_ref: initialProfile.ayushman_demo_ref || '',
      })
    }
  }, [initialProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!initialProfile?.patient_id) return

    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const updated = await patientApi.updateProfile(initialProfile.patient_id, formData)
      setSaveSuccess(true)
      if (onProfileUpdated) {
        onProfileUpdated(updated)
      }
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message || 'Failed to save patient profile updates.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Educational Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Synthetic Clinical Data: </span>
          All physiological vitals, clinical conditions, allergies, and national scheme IDs displayed
          here are synthetic test fixtures. Never enter real medical diagnoses or Aadhaar numbers.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Editable Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinical &amp; Personal Profile</h3>
                <p className="text-xs text-slate-500">Update synthetic patient vitals, emergency contacts, and conditions</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {initialProfile?.patient_id || 'PAT-DEMO'}
              </span>
            </div>

            {/* Alerts */}
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Profile updates saved successfully to SQLite database!</span>
              </div>
            )}
            {saveError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                Contact &amp; Emergency
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Synthetic)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-98765-43210"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person &amp; Phone</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    placeholder="e.g. Sunita Sharma (+91-98765-43219)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address (Fictional)</label>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 402 Palm Grove Enclave, Sector 14, Gurgaon, HR"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Clinical Health Information */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                Clinical Vitals &amp; Medical History
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies (comma separated)</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, Shellfish, Latex"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Conditions &amp; Diagnoses</label>
                  <input
                    type="text"
                    name="conditions"
                    value={formData.conditions}
                    onChange={handleChange}
                    placeholder="e.g. Type-2 Diabetes, Mild Hypertension"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Active Prescriptions &amp; Dosages</label>
                  <input
                    type="text"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="e.g. Metformin 500mg (BID), Amlodipine 5mg (OD)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor &amp; Clinical Progress Notes</label>
                  <textarea
                    rows={3}
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    placeholder="Physician consultation remarks and observations..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Synthetic National Schemes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                Synthetic Health ID &amp; Insurance Schemes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Synthetic Aadhaar Reference</label>
                  <input
                    type="text"
                    name="aadhaar_demo_ref"
                    value={formData.aadhaar_demo_ref}
                    onChange={handleChange}
                    placeholder="DEMO-AADHAAR-0001"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Synthetic Ayushman Bharat PM-JAY Ref</label>
                  <input
                    type="text"
                    name="ayushman_demo_ref"
                    value={formData.ayushman_demo_ref}
                    onChange={handleChange}
                    placeholder="DEMO-PM-JAY-0001"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Updates</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Visual Digital Health Identity Card Mockup */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-800 to-sky-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Diagonal synthetic watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 rotate-[-25deg]">
              <span className="text-3xl font-extrabold tracking-widest text-white border-4 border-white px-4 py-1">
                SYNTHETIC LAB
              </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-teal-700/60 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-teal-300">
                    National Health Digital ID
                  </div>
                  <div className="text-xs font-extrabold tracking-tight">MediVault Health Card</div>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                Synthetic
              </span>
            </div>

            {/* Body */}
            <div className="mt-4 flex items-start gap-4 relative z-10">
              <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-200 flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-white">{formData.full_name || 'Patient Name'}</div>
                <div className="text-teal-200 text-[11px] font-mono">
                  ID: {initialProfile?.patient_id || 'PAT-DEMO-001'}
                </div>
                <div className="text-[11px] text-teal-300">
                  DOB: {formData.date_of_birth || '1988-06-15'} • {formData.gender}
                </div>
                <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 mt-1">
                  Blood Group: {formData.blood_group || 'B+'}
                </div>
              </div>
            </div>

            {/* Scheme numbers */}
            <div className="mt-5 pt-3 border-t border-teal-700/60 grid grid-cols-2 gap-2 text-[11px] font-mono relative z-10">
              <div>
                <div className="text-[9px] text-teal-300 font-sans uppercase">Aadhaar Reference</div>
                <div className="font-bold text-teal-100 truncate">
                  {formData.aadhaar_demo_ref || 'DEMO-AADHAAR-0001'}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-teal-300 font-sans uppercase">Ayushman PM-JAY</div>
                <div className="font-bold text-teal-100 truncate">
                  {formData.ayushman_demo_ref || 'DEMO-PM-JAY-0001'}
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="mt-4 pt-2 flex items-center justify-between text-[10px] text-teal-300 relative z-10">
              <div className="flex items-center gap-1">
                <QrCode className="w-4 h-4 text-white" />
                <span>QR Verified (Synthetic)</span>
              </div>
              <span className="font-mono text-[9px]">VALID IN LOCAL LAB</span>
            </div>
          </div>

          {/* Quick info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h5 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              Profile Verification Details
            </h5>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Account Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active / Verified
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Linked User Account</span>
                <span className="font-mono text-slate-800">{initialProfile?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Registration Date</span>
                <span className="text-slate-800">
                  {initialProfile?.created_at ? new Date(initialProfile.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Active Lab Policy</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {mode || 'LAB_VULNERABLE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
