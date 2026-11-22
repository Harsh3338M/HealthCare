import React, { useState, useEffect } from 'react'
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  Lock,
  RefreshCw,
  X,
  FileCheck2,
  AlertTriangle
} from 'lucide-react'
import { reportsApi } from '../services/api'
import ReportUploader from '../components/ReportUploader'

export default function Reports({ currentUser, mode, onNavigate }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploader, setShowUploader] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [previewReport, setPreviewReport] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [currentUser])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reportsApi.listReports(currentUser?.patient_id)
      setReports(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load medical reports.')
    } finally {
      setLoading(false)
    }
  }

  const isVulnerable = mode === 'LAB_VULNERABLE'

  // Filter logic
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.doctor_name && rep.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'All' || rep.report_type === selectedType
    return matchesSearch && matchesType
  })

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown Size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Medical Reports &amp; Diagnostic Vault
                </h1>
                <p className="text-xs text-slate-500">
                  Inspect, upload, and stream synthetic laboratory records, prescriptions, and radiology documents
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchReports}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Refresh report list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Medical Document</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, doctor, filename..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {['All', 'Lab Report', 'Prescription', 'Radiology', 'Diagnostic Summary'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedType === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading synthetic diagnostic documents...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No Medical Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are currently no reports matching your filter criteria. Use the button below to upload a sample
            diagnostic test file.
          </p>
          <button
            type="button"
            onClick={() => setShowUploader(true)}
            className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs"
          >
            Upload Sample Diagnostic Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {report.report_type}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{report.doctor_name || 'MediVault Diagnostics'}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{formatFileSize(report.file_size)}</span>
                  <span>
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Synthetic'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewReport(report)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
                <a
                  href={reportsApi.getDownloadUrl(report.id)}
                  download={report.file_name}
                  className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8">
            <ReportUploader
              patientId={currentUser?.patient_id || 'PAT-DEMO-001'}
              onUploadSuccess={() => {
                fetchReports()
                setShowUploader(false)
              }}
              onClose={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPreviewReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{previewReport.title}</h3>
                <p className="text-[11px] text-slate-500 font-mono">ID: {previewReport.id} • {previewReport.file_name}</p>
              </div>
            </div>

            {/* Synthetic Disclaimer */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-900 leading-relaxed">
                <span className="font-bold">Synthetic Laboratory Document: </span>
                This document is a local testing artifact watermarked for educational demonstrations.
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border border-slate-100 rounded-xl p-4 bg-slate-50/60">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Associated Patient ID</span>
                <span className="font-mono font-bold text-slate-800">{previewReport.patient_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Doctor / Institution</span>
                <span className="text-slate-800">{previewReport.doctor_name || 'MediVault Wing'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">File Storage Path</span>
                <span className="font-mono text-[10px] text-slate-800 truncate max-w-[200px]">{previewReport.file_path}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">File Size</span>
                <span className="font-mono text-slate-800">{formatFileSize(previewReport.file_size)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">MIME Type</span>
                <span className="font-mono text-slate-800">{previewReport.mime_type || 'application/pdf'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={reportsApi.getDownloadUrl(previewReport.id)}
                download={previewReport.file_name}
                className="flex-1 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
