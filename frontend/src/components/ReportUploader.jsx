import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  Lock
} from 'lucide-react'
import { reportsApi } from '../services/api'

export default function ReportUploader({ patientId, onUploadSuccess, onClose }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [reportType, setReportType] = useState('Lab Report')
  const [doctorName, setDoctorName] = useState('Dr. Ananya Rao (CMO)')
  const [isSensitive, setIsSensitive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0])
    }
  }

  const selectFile = (selected) => {
    setFile(selected)
    setError(null)
    if (!title) {
      const cleanTitle = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select or drop a file to upload.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('report_type', reportType)
      formData.append('doctor_name', doctorName.trim())
      formData.append('patient_id', patientId || 'PAT-100001')
      formData.append('is_sensitive', isSensitive ? 'true' : 'false')

      const res = await reportsApi.uploadReport(formData)
      setSuccess(true)
      if (onUploadSuccess) {
        onUploadSuccess(res)
      }
      setTimeout(() => {
        if (onClose) onClose()
      }, 1000)
    } catch (err) {
      setError(err.message || 'File upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-xl w-full mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Upload Medical Document</h3>
            <p className="text-[11px] text-slate-400">Upload diagnostic report or clinical document</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-sky-500 bg-sky-50/80 scale-[0.99]'
              : file
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.html,.svg"
          />

          {file ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-sm">{file.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
              </div>
              <span className="text-[10px] text-sky-600 underline font-medium">Click to choose a different file</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Drag and drop medical report here, or <span className="text-sky-600 underline">browse</span>
              </div>
              <div className="text-[11px] text-slate-400">PDF, PNG, JPG, or diagnostic documents</div>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lipid Profile & Liver Function Diagnostic"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Radiology">Radiology / Imaging</option>
                <option value="Clinical Summary">Clinical Summary</option>
                <option value="Spirometry">Spirometry / Pulmonary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physician / Facility</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Ananya Rao"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sensitive_check"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
            />
            <label htmlFor="sensitive_check" className="text-xs text-slate-700 cursor-pointer flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mark as Restricted Sensitive Document (Clinical Privacy Guard)</span>
            </label>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Document uploaded and indexed successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Upload to MediVault Storage</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
