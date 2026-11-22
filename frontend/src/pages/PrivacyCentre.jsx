import React, { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  Send,
  HelpCircle,
  Database,
  Activity,
  Mail,
  User,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react'
import { privacyApi } from '../services/api'

export default function PrivacyCentre({ currentUser, onNavigate }) {
  const [consents, setConsents] = useState([])
  const [loadingConsents, setLoadingConsents] = useState(false)
  const [consentError, setConsentError] = useState(null)
  const [updatingPurpose, setUpdatingPurpose] = useState(null)
  const [consentSuccessMsg, setConsentSuccessMsg] = useState(null)

  // Rights Request Form State
  const [rightsType, setRightsType] = useState('export')
  const [rightsDetails, setRightsDetails] = useState('')
  const [submittingRights, setSubmittingRights] = useState(false)
  const [rightsSuccess, setRightsSuccess] = useState(null)
  const [rightsError, setRightsError] = useState(null)

  // Grievance Form State
  const [grievanceSubject, setGrievanceSubject] = useState('')
  const [grievanceDesc, setGrievanceDesc] = useState('')
  const [grievanceEmail, setGrievanceEmail] = useState('')
  const [submittingGrievance, setSubmittingGrievance] = useState(false)
  const [grievanceSuccess, setGrievanceSuccess] = useState(null)
  const [grievanceError, setGrievanceError] = useState(null)

  useEffect(() => {
    if (currentUser) {
      fetchConsents()
    }
  }, [currentUser])

  const fetchConsents = async () => {
    setLoadingConsents(true)
    setConsentError(null)
    try {
      const data = await privacyApi.getConsents()
      setConsents(data || [])
    } catch (err) {
      setConsentError(err.message || 'Unable to load consent preferences.')
    } finally {
      setLoadingConsents(false)
    }
  }

  const handleToggleConsent = async (purpose, currentGranted) => {
    setUpdatingPurpose(purpose)
    setConsentSuccessMsg(null)
    try {
      const updated = await privacyApi.updateConsent(purpose, !currentGranted)
      setConsents(updated || [])
      setConsentSuccessMsg(`Consent preference for "${purpose.replace(/_/g, ' ')}" updated successfully.`)
      setTimeout(() => setConsentSuccessMsg(null), 4000)
    } catch (err) {
      setConsentError(err.message || 'Failed to update consent preference.')
    } finally {
      setUpdatingPurpose(null)
    }
  }

  const handleRightsSubmit = async (e) => {
    e.preventDefault()
    setSubmittingRights(true)
    setRightsError(null)
    setRightsSuccess(null)

    try {
      const res = await privacyApi.submitRightsRequest({
        request_type: rightsType,
        details: rightsDetails.trim() || undefined,
      })
      setRightsSuccess(res.message || 'Your data rights request has been received.')
      setRightsDetails('')
    } catch (err) {
      setRightsError(err.message || 'Failed to submit data rights request.')
    } finally {
      setSubmittingRights(false)
    }
  }

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault()
    setSubmittingGrievance(true)
    setGrievanceError(null)
    setGrievanceSuccess(null)

    try {
      const res = await privacyApi.submitGrievance({
        subject: grievanceSubject.trim(),
        description: grievanceDesc.trim(),
        contact_email: grievanceEmail.trim() || undefined,
      })
      setGrievanceSuccess(res.message || 'Your grievance has been submitted successfully.')
      setGrievanceSubject('')
      setGrievanceDesc('')
      setGrievanceEmail('')
    } catch (err) {
      setGrievanceError(err.message || 'Failed to submit privacy grievance.')
    } finally {
      setSubmittingGrievance(false)
    }
  }

  const dataCategories = [
    {
      category: 'Identity & Demographic Data',
      examples: 'Full Name, Date of Birth, Gender, Address, Phone Number, Email Address',
      purpose: 'Patient identification, clinical registration, and emergency contact verification',
      retention: 'Retained during active patient relationship',
    },
    {
      category: 'Clinical Health Records',
      examples: 'Diagnoses, Vital Signs, Recorded Allergies, Chronic Conditions, Prescriptions, Doctor Notes',
      purpose: 'Direct delivery of healthcare services, medical consultations, and clinical continuity',
      retention: 'Retained in accordance with national healthcare records regulations',
    },
    {
      category: 'Diagnostic Documents & Files',
      examples: 'Laboratory Test Reports, Blood Panels, Spirometry Tests, Imaging Summaries',
      purpose: 'Diagnostic review, medical decision-making, and specialist referral consultations',
      retention: 'Archived permanently within patient electronic health repository',
    },
    {
      category: 'Operational Access Logs',
      examples: 'Timestamp, User Identifier, Endpoint Accessed, Action Type, Resulting Status',
      purpose: 'Information security monitoring, unauthorized access detection, and compliance auditing',
      retention: 'Maintained for operational security audit trails',
    },
  ]

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Digital Personal Data Protection (DPDP) Aligned
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Data Privacy &amp; Governance Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We uphold transparency in processing your health information. Configure your consent choices, review data categories, exercise statutory rights, or contact our Data Protection Officer.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-center text-xs space-y-1.5 shrink-0">
            <span className="font-bold text-slate-700">Data Protection Officer:</span>
            <span className="text-slate-600">Suresh Menon</span>
            <span className="text-slate-400 font-mono text-[11px]">privacy@medivault.test</span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1">DPDP Compliance Bureau</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: GRANULAR CONSENT MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" />
              Granular Consent Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Manage individual processing authorizations for clinical care, diagnostic sharing, and analytics.
            </p>
          </div>
          {currentUser && (
            <button
              type="button"
              onClick={fetchConsents}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingConsents ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {consentSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{consentSuccessMsg}</span>
          </div>
        )}

        {consentError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{consentError}</span>
          </div>
        )}

        {!currentUser ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <Lock className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">Authentication Required to Manage Consents</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Please sign in with your patient account to review your active consent ledger and toggle data processing permissions.
            </p>
          </div>
        ) : loadingConsents ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Loading consent ledger...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consents.map((item) => (
              <div
                key={item.purpose}
                className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {item.purpose.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.is_granted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.is_granted ? 'Granted' : 'Revoked'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description || 'Data processing authorized under standard clinical protocol.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.granted_at ? `Granted: ${new Date(item.granted_at).toLocaleDateString()}` : 'Default Choice'}
                  </span>
                  <button
                    type="button"
                    disabled={updatingPurpose === item.purpose}
                    onClick={() => handleToggleConsent(item.purpose, item.is_granted)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      item.is_granted
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {updatingPurpose === item.purpose
                      ? 'Updating...'
                      : item.is_granted
                      ? 'Revoke Permission'
                      : 'Grant Consent'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: HEALTH DATA CATEGORIES BREAKDOWN */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Health Data Categories &amp; Processing Scope
          </h2>
          <p className="text-xs text-slate-500">
            Transparent breakdown of data categories collected, purpose of processing, and statutory retention standards.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Data Category</th>
                <th className="py-3 px-4 font-bold">Information Elements</th>
                <th className="py-3 px-4 font-bold">Purpose of Processing</th>
                <th className="py-3 px-4 font-bold">Retention Horizon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataCategories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {cat.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{cat.examples}</td>
                  <td className="py-3 px-4 text-slate-700">{cat.purpose}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">{cat.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3 & 4: DATA RIGHTS REQUESTS & GRIEVANCES (GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 3: DATA PRINCIPAL RIGHTS FORM */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-600" />
              Exercise Data Principal Rights
            </h2>
            <p className="text-xs text-slate-500">
              Submit a formal request for health record export, record correction, or data portability.
            </p>
          </div>

          {rightsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{rightsSuccess}</span>
            </div>
          )}

          {rightsError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rightsError}</span>
            </div>
          )}

          <form onSubmit={handleRightsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Type</label>
              <select
                value={rightsType}
                onChange={(e) => setRightsType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="export">Data Access &amp; Full Health Record Export</option>
                <option value="correction">Correction of Inaccurate Clinical Record</option>
                <option value="erasure">Erasure / Processing Objection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Specification &amp; Scope (Optional)
              </label>
              <textarea
                rows={3}
                value={rightsDetails}
                onChange={(e) => setRightsDetails(e.target.value)}
                placeholder="Specify documents, date ranges, or details of the correction requested..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingRights || !currentUser}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingRights ? 'Submitting Request...' : 'Submit Rights Request'}</span>
            </button>
            {!currentUser && (
              <p className="text-[11px] text-amber-700 text-center font-medium">
                Please sign in to submit a formal Data Principal rights request.
              </p>
            )}
          </form>
        </div>

        {/* SECTION 4: GRIEVANCE FILING WITH DPO */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              File Privacy Grievance or Inquiry
            </h2>
            <p className="text-xs text-slate-500">
              Directly contact our appointed Data Protection Officer regarding data privacy concerns.
            </p>
          </div>

          {grievanceSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{grievanceSuccess}</span>
            </div>
          )}

          {grievanceError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{grievanceError}</span>
            </div>
          )}

          <form onSubmit={handleGrievanceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={grievanceSubject}
                onChange={(e) => setGrievanceSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding data disclosure or retention policy"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                placeholder={currentUser?.email || 'name@example.com'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={grievanceDesc}
                onChange={(e) => setGrievanceDesc(e.target.value)}
                placeholder="Describe your privacy concern or compliance inquiry in detail..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingGrievance || !currentUser}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingGrievance ? 'Sending Grievance...' : 'Submit to Data Protection Officer'}</span>
            </button>
            {!currentUser && (
              <p className="text-[11px] text-amber-700 text-center font-medium">
                Please sign in to file a grievance with the Data Protection Officer.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* SECTION 5: SECURITY & COMPLIANCE SAFEGUARDS */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Security &amp; Administrative Safeguards</h3>
            <p className="text-xs text-slate-400">Technical measures protecting healthcare data confidentiality</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          MediVault maintains role-based clinical access controls, continuous operational audit logging, and document protection standards aligned with digital personal data protection mandates. All inquiries and data principal rights submissions are processed under institutional governance guidelines.
        </p>
      </div>
    </div>
  )
}
