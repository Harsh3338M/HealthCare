import React, { useState } from 'react'
import {
  Activity,
  Shield,
  Users,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Stethoscope,
  ClipboardCheck,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react'

export default function Home({ currentUser, onNavigate, onOpenAuth }) {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'How do I access and download my laboratory reports?',
      a: 'Once authenticated through the Patient Portal, navigate to the Medical Reports section. You can view all diagnostic documents, blood profiles, and prescriptions ordered by your attending clinicians, with direct download available for each record.',
    },
    {
      q: 'How are my health records and personal identity details protected?',
      a: 'MediVault implements strict administrative and technical safeguards for patient records. Access to confidential clinical histories is restricted to authorized medical staff, and all file access is recorded in our central operational audit log.',
    },
    {
      q: 'Can I link my Ayushman Bharat PM-JAY or Aadhaar reference?',
      a: 'Yes. You can manage and verify your government healthcare scheme references through the Medical Profile dashboard. Verified references ensure seamless clinical record correlation during hospital visits and specialist consultations.',
    },
    {
      q: 'How do I update my data processing consents or request an export?',
      a: 'Visit our Data Privacy & Governance Centre to view your active consent preferences, toggle permissions for third-party sharing, or submit a formal Data Principal rights request for record export or correction.',
    },
    {
      q: 'Who should I contact if I have questions regarding my patient record?',
      a: 'You can submit an inquiry directly through our Privacy Centre to the Data Protection Officer, or contact our front desk reception staff during clinical consultation hours.',
    },
  ]

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs overflow-hidden relative">
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Accredited Healthcare Clinical Services • Active
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Trusted Healthcare Services &amp; Electronic Health Records
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Access your clinical vitals, diagnostic laboratory reports, and prescription histories, with comprehensive control over your personal data privacy in one unified platform.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigate('patient-portal')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Open Patient Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Patient Portal</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-slate-500" />
                  <span>Register Account</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onNavigate('privacy-centre')}
              className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-sky-600" />
              <span>Privacy Centre</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background graphic */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none hidden lg:flex items-center justify-center">
          <Activity className="w-96 h-96 text-slate-900" />
        </div>
      </div>

      {/* Trust & Quality Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">24/7</div>
          <div className="text-xs text-slate-500 mt-0.5">Clinical Document Access</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">ABDM &amp; PM-JAY</div>
          <div className="text-xs text-slate-500 mt-0.5">Identity Reference Standards</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">Physician-Led</div>
          <div className="text-xs text-slate-500 mt-0.5">Diagnostic Care &amp; Reports</div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">DPDP Aligned</div>
          <div className="text-xs text-slate-500 mt-0.5">Data Principal Privacy Rights</div>
        </div>
      </div>

      {/* Core Healthcare Modules */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comprehensive Health Services &amp; Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a module to manage your health records, view diagnostic files, or configure privacy choices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Patient Portal Card */}
          <div
            onClick={() => onNavigate('patient-portal')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer hover:border-sky-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Patient Dashboard</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Review personal health summaries, blood group, recorded allergies, ongoing conditions, and scheme identity details.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Medical Reports Card */}
          <div
            onClick={() => onNavigate('medical-reports')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer hover:border-purple-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Medical Reports Vault</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Upload diagnostic documents, review clinical laboratory reports, and securely stream verified prescription files.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>View Documents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Privacy Centre Card */}
          <div
            onClick={() => onNavigate('privacy-centre')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer hover:border-emerald-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Privacy &amp; Governance</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Manage data processing consents, submit data export requests, and file inquiries with the Data Protection Officer.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Manage Privacy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Staff Portal Card */}
          <div
            onClick={() => onNavigate('staff-portal')}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer hover:border-amber-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Staff Portal</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Authorized clinician and administrative access for patient registry search, clinical chart review, and audit log monitoring.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Staff Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-1">
            <HelpCircle className="w-4 h-4" />
            Patient Help &amp; Information
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Common questions regarding electronic health records, diagnostic reports, and patient rights.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-sky-600 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed pr-8">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
