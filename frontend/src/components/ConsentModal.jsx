import React, { useState } from 'react'
import { Shield, X, CheckCircle2, ChevronRight, FileText } from 'lucide-react'

/**
 * ConsentModal - Health Data Privacy Notice & Consent Agreement.
 * 
 * V10: Dark-Pattern Privacy Notice & Consent UX
 * Demonstrates pre-checked bundled consents with vague purpose text
 * and a visually buried, low-contrast, non-functional revoke/opt-out control.
 */
export default function ConsentModal({ isOpen, onClose, onAccept }) {
  // V10: Pre-checked by default bundled consents
  const [clinicalCare, setClinicalCare] = useState(true)
  const [partnerSharing, setPartnerSharing] = useState(true)
  const [analyticsResearch, setAnalyticsResearch] = useState(true)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (onAccept) {
      onAccept({
        clinicalCare,
        partnerSharing,
        analyticsResearch,
      })
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Privacy Notice &amp; Consent Agreement</h3>
              <p className="text-xs text-slate-400">Healthcare Data Processing Governance</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed text-slate-700">
            Please review the following data processing terms. By confirming, you authorize MediVault
            and its healthcare affiliates to collect and process your health records.
          </p>

          {/* V10: Bundled, pre-checked consent clauses with vague purpose descriptions */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <input
                  id="modal-clinical"
                  type="checkbox"
                  checked={clinicalCare}
                  onChange={(e) => setClinicalCare(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="modal-clinical" className="font-semibold text-slate-900 cursor-pointer">
                  General Health Processing &amp; Operations
                </label>
              </div>
              <p className="pl-6.5 text-[11px] text-slate-500 leading-normal">
                Consent to store, aggregate, and process all clinical notes, diagnostic findings, vitals,
                and identity scheme records for ongoing service coordination and system operations.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <input
                  id="modal-sharing"
                  type="checkbox"
                  checked={partnerSharing}
                  onChange={(e) => setPartnerSharing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="modal-sharing" className="font-semibold text-slate-900 cursor-pointer">
                  Affiliated Network &amp; Partner Data Transmission
                </label>
              </div>
              <p className="pl-6.5 text-[11px] text-slate-500 leading-normal">
                Consent to transmit health documentation, laboratory reports, and scheme references to
                affiliated hospitals, accredited laboratories, and commercial diagnostic partners.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <input
                  id="modal-analytics"
                  type="checkbox"
                  checked={analyticsResearch}
                  onChange={(e) => setAnalyticsResearch(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="modal-analytics" className="font-semibold text-slate-900 cursor-pointer">
                  Healthcare Analytics &amp; Platform Intelligence
                </label>
              </div>
              <p className="pl-6.5 text-[11px] text-slate-500 leading-normal">
                Consent to evaluate diagnostic metrics and demographic indicators for platform quality
                improvement, analytics modeling, and institutional healthcare intelligence.
              </p>
            </div>
          </div>

          {/* V10: Visually buried, low-contrast, non-functional revoke control */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // V10: Non-functional revoke control does nothing and leaves consents active
              }}
              className="text-[10px] text-slate-300 hover:text-slate-300 cursor-default select-none transition-colors"
            >
              Withdraw all optional consent preferences and opt out of processing
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <span>Accept All &amp; Confirm</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
