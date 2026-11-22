import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  HeartPulse,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Download,
  AlertCircle,
  Clock,
  Activity,
  CheckCircle2,
  Stethoscope,
  Pill,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { staffApi, reportsApi } from '../services/api'

export default function PatientRecordDrawer({ patientId, onClose, currentUser }) {
  const [patient, setPatient] = useState(null)
  const [clinical, setClinical] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'clinical' | 'reports'

  useEffect(() => {
    if (patientId) {
      loadPatientDetails()
    }
  }, [patientId])

  const loadPatientDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const [recordData, clinicalData] = await Promise.all([
        staffApi.getPatientRecord(patientId),
        staffApi.getClinicalHistory(patientId).catch(() => null)
      ])
      setPatient(recordData)
      setClinical(clinicalData)
    } catch (err) {
      setError(err.message || 'Unable to load patient record.')
    } finally {
      setLoading(false)
    }
  }

  if (!patientId) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {patient?.full_name ? patient.full_name.charAt(0) : <User className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {patient?.full_name || 'Loading Record...'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                      {patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {patient?.date_of_birth ? `DOB: ${patient.date_of_birth}` : 'Electronic Health Record'} • {patient?.gender || 'Patient'}
                    {patient?.blood_group && ` • Blood: ${patient.blood_group}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close record drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mt-5 border-t border-slate-800/80 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Overview &amp; Demographics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clinical')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'clinical'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinical Notes &amp; History</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Diagnostic Reports ({patient?.reports?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Fetching clinical file...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold">Error Loading Patient Record</div>
                  <div>{error}</div>
                </div>
              </div>
            ) : patient ? (
              <>
                {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</div>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{patient.blood_group || 'Not specified'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allergies</div>
                        <div className="text-sm font-bold text-amber-700 mt-0.5 truncate">{patient.allergies || 'None Recorded'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {patient.is_active ? 'Active Record' : 'Inactive'}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Files Attached</div>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">{patient.reports?.length || 0} Documents</div>
                      </div>
                    </div>

                    {/* Contact & Personal Details */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        Patient Contact &amp; Demographic Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                            <span className="font-semibold text-slate-800">{patient.phone || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block text-[10px]">Email Address</span>
                            <span className="font-semibold text-slate-800">{patient.email || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 sm:col-span-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block text-[10px]">Residential Address</span>
                            <span className="font-semibold text-slate-800">{patient.address || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 sm:col-span-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                            <span className="font-semibold text-slate-800">{patient.emergency_contact || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Government Scheme & Identity References */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-600" />
                        Identity &amp; Scheme Verification Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700">Aadhaar Reference</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                              Verified
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                            {patient.aadhaar_ref || 'Not Linked'}
                          </div>
                          <p className="text-[10px] text-slate-400">National Health ID Record</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700">Ayushman Bharat PM-JAY</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                              Active
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                            {patient.ayushman_ref || 'Not Linked'}
                          </div>
                          <p className="text-[10px] text-slate-400">Pradhan Mantri Jan Arogya Yojana</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CLINICAL NOTES & HISTORY */}
                {activeTab === 'clinical' && (
                  <div className="space-y-5">
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-sky-900">Confidential Physician Clinical File</h4>
                          <p className="text-[11px] text-sky-700">Access logged in operational audit registry</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-white text-sky-800 border border-sky-200 rounded-lg text-[10px] font-semibold">
                        Staff Authorization Confirmed
                      </span>
                    </div>

                    {/* Chronic Conditions & Allergies */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-sky-600" />
                        Diagnoses &amp; Chronic Conditions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions ? (
                          patient.conditions.split(',').map((cond, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {cond.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No active chronic conditions recorded.</span>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <h4 className="text-[11px] font-bold text-slate-700 mb-2">Prescribed Medications</h4>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                          {patient.medications || 'No active outpatient prescription.'}
                        </div>
                      </div>
                    </div>

                    {/* Attending Physician Clinical Notes */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                        Attending Physician Notes &amp; Observations
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                        {patient.medical_notes || 'No confidential clinical notes documented for this patient.'}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Documented by Attending Medical Staff</span>
                        <span>Record ID: {patient.patient_id}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: DIAGNOSTIC REPORTS */}
                {activeTab === 'reports' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Electronic Diagnostic Reports &amp; Files
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {patient.reports?.length || 0} Files Recorded
                      </span>
                    </div>

                    {!patient.reports || patient.reports.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-700">No Attached Diagnostic Documents</div>
                        <p className="text-[11px] text-slate-500">
                          Diagnostic reports uploaded by clinical staff or the patient will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patient.reports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {report.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-semibold text-slate-700">{report.report_type}</span>
                                  {report.doctor_name && <span>• {report.doctor_name}</span>}
                                  {report.created_at && (
                                    <span>• {new Date(report.created_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {report.file_name} {report.file_size ? `(${(report.file_size / 1024).toFixed(1)} KB)` : ''}
                                </div>
                              </div>
                            </div>

                            <a
                              href={reportsApi.getDownloadUrl(report.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Operational Access Logged for Staff: {currentUser?.email || 'Authenticated User'}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
