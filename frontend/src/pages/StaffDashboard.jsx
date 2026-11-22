import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  Activity,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  LogIn
} from 'lucide-react'
import { staffApi } from '../services/api'
import PatientRecordDrawer from '../components/PatientRecordDrawer'

export default function StaffDashboard({ currentUser, onNavigate, onOpenAuth }) {
  const [patients, setPatients] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'security-feed'
  const [logFilter, setLogFilter] = useState('ALL') // 'ALL' | 'SUCCESS' | 'ALERTS'
  const [error, setError] = useState(null)

  // Verify staff role privileges
  const isStaffUser =
    currentUser &&
    ['staff_basic', 'staff_clinical', 'admin_dpo'].includes(currentUser.role)

  useEffect(() => {
    if (isStaffUser) {
      fetchPatients()
      fetchAuditLogs()
    }
  }, [isStaffUser])

  const fetchPatients = async (query = '') => {
    setLoadingPatients(true)
    setError(null)
    try {
      const data = await staffApi.listPatients(query)
      setPatients(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch patient directory.')
    } finally {
      setLoadingPatients(false)
    }
  }

  const fetchAuditLogs = async () => {
    setLoadingLogs(true)
    try {
      const data = await staffApi.listAuditLogs(100)
      setAuditLogs(data || [])
    } catch (err) {
      console.error('Audit log fetch error:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchPatients(searchTerm)
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    if (val === '') {
      fetchPatients('')
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === 'ALL') return true
    if (logFilter === 'SUCCESS') return log.status === 'SUCCESS'
    if (logFilter === 'ALERTS')
      return log.status === 'BREACH_ALERT' || log.status === 'UNAUTHORIZED' || log.status === 'FAILED'
    return true
  })

  // Role Badge Helper
  const renderRoleBadge = () => {
    if (!currentUser) return null
    if (currentUser.role === 'staff_clinical') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight">Clinical Physician &amp; Medical Officer</span>
            <span className="block text-[10px] text-emerald-600 leading-tight">Full Clinical Access Privileges</span>
          </div>
        </div>
      )
    }
    if (currentUser.role === 'staff_basic') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
          <ClipboardList className="w-4 h-4 text-sky-600" />
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight">Front Desk &amp; Patient Administration</span>
            <span className="block text-[10px] text-sky-600 leading-tight">Patient Directory &amp; Intake Staff</span>
          </div>
        </div>
      )
    }
    if (currentUser.role === 'admin_dpo') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight">Data Protection &amp; Privacy Officer</span>
            <span className="block text-[10px] text-purple-600 leading-tight">Compliance &amp; Operational Security</span>
          </div>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
        <Lock className="w-3.5 h-3.5" />
        <span>{currentUser.role}</span>
      </div>
    )
  }

  // If user is not authenticated as staff
  if (!currentUser || !isStaffUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Staff &amp; Clinical Authentication Required
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            This module provides administrative patient registry search, clinical chart inspection, and operational audit monitoring. Access requires valid healthcare staff credentials.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Staff Account</span>
            </button>
          )}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              Return to Overview
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Clinical Staff Portal • Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Staff &amp; Clinical Management Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Electronic patient directory, comprehensive record inspection, and real-time operational audit log monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {renderRoleBadge()}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 font-mono">
                {currentUser.patient_id || currentUser.id}
              </div>
              <div className="text-[11px] text-slate-400">{currentUser.email}</div>
            </div>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Patients</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{patients.length}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Clinical Records</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">
              {patients.filter((p) => p.is_active).length}
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attached Reports</span>
            <div className="text-lg font-bold text-sky-700 mt-0.5">
              {patients.reduce((acc, p) => acc + (p.reports_count || 0), 0)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Events Logged</span>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{auditLogs.length}</div>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'directory'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patient Registry &amp; Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security-feed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'security-feed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Operational &amp; Security Audit Feed</span>
            {auditLogs.some((l) => l.status === 'BREACH_ALERT') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>

        {activeTab === 'directory' && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, ID, phone, or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                fetchPatients('')
              }}
              title="Refresh Directory"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPatients ? 'animate-spin' : ''}`} />
            </button>
          </form>
        )}

        {activeTab === 'security-feed' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setLogFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  logFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('SUCCESS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  logFilter === 'SUCCESS' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Access Reads
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('ALERTS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  logFilter === 'ALERTS' ? 'bg-white text-rose-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Security Alerts
              </button>
            </div>
            <button
              type="button"
              onClick={fetchAuditLogs}
              title="Refresh Audit Feed"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT: 1. PATIENT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {error && (
            <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {loadingPatients ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading patient directory...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Patient Records Found</div>
              <p className="text-[11px] text-slate-500">
                {searchTerm ? `No records matched query "${searchTerm}".` : 'No patients registered in directory.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Patient ID</th>
                    <th className="py-3 px-4 font-bold">Patient Name</th>
                    <th className="py-3 px-4 font-bold">Contact Info</th>
                    <th className="py-3 px-4 font-bold">Blood / Vitals</th>
                    <th className="py-3 px-4 font-bold">Active Diagnoses</th>
                    <th className="py-3 px-4 font-bold">Health ID Scheme</th>
                    <th className="py-3 px-4 font-bold text-center">Reports</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((pat) => (
                    <tr
                      key={pat.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPatientId(pat.patient_id)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {pat.patient_id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{pat.full_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {pat.date_of_birth ? `DOB: ${pat.date_of_birth}` : ''} {pat.gender ? `• ${pat.gender}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{pat.phone || '—'}</div>
                        <div className="text-[11px] text-slate-400">{pat.email || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{pat.blood_group || '—'}</div>
                        {pat.allergies && (
                          <div className="text-[10px] text-amber-700 font-medium truncate max-w-[120px]">
                            {pat.allergies}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 max-w-[150px] truncate">
                          {pat.conditions || 'None documented'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-mono text-[11px]">
                          {pat.aadhaar_ref || pat.ayushman_ref || '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pat.aadhaar_ref ? 'Aadhaar Card' : pat.ayushman_ref ? 'PM-JAY Scheme' : 'Unlinked'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          {pat.reports_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPatientId(pat.patient_id)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Record</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. SECURITY & AUDIT EVENT FEED */}
      {activeTab === 'security-feed' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Operational Security &amp; Access Log Stream
              </h3>
              <p className="text-xs text-slate-500">
                Live chronological record of staff logins, clinical data access, report uploads, and access alerts.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredLogs.length} events
            </span>
          </div>

          {loadingLogs ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Streaming audit events...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No audit log entries matching the selected criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {filteredLogs.map((log) => {
                const isAlert =
                  log.status === 'BREACH_ALERT' ||
                  log.status === 'UNAUTHORIZED' ||
                  log.status === 'FAILED'
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      isAlert ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isAlert
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isAlert ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          {log.target_resource_id && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Target: {log.target_resource_id}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isAlert
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {log.details || log.endpoint || 'Audit activity logged.'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Actor: {log.actor_id || log.actor_email || 'System'} {log.endpoint ? `• ${log.endpoint}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Patient Drawer Modal */}
      {selectedPatientId && (
        <PatientRecordDrawer
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
