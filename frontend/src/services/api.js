/**
 * MediVault API Service Layer
 * 
 * Centralized HTTP client for interacting with the FastAPI backend.
 * Handles JWT token storage, request headers, error handling,
 * authentication, and dynamic security mode switching.
 */

const TOKEN_KEY = 'medivault_token'
const USER_KEY = 'medivault_user'

export const tokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
}

async function apiRequest(endpoint, options = {}) {
  const token = tokenService.getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  // Support FormData uploads (do not set Content-Type header manually)
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null
  }

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.detail || data.message)) ||
      (typeof data === 'string' ? data : 'API Request Failed')
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const authApi = {
  login: async (credentials) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (data.access_token) {
      tokenService.setToken(data.access_token)
    }
    if (data.user) {
      tokenService.setUser(data.user)
    }
    return data
  },

  register: async (userData) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (data.access_token) {
      tokenService.setToken(data.access_token)
    }
    if (data.user) {
      tokenService.setUser(data.user)
    }
    return data
  },

  getMe: async () => {
    const user = await apiRequest('/api/auth/me')
    if (user) {
      tokenService.setUser(user)
    }
    return user
  },

  logout: () => {
    tokenService.clearAuth()
  },
}

export const patientApi = {
  getMe: () => apiRequest('/api/patients/me'),
  getPatient: (patientId) => apiRequest(`/api/patients/${patientId}`),
  updateProfile: (patientId, data) =>
    apiRequest(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export const reportsApi = {
  listReports: (patientId) => {
    const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : ''
    return apiRequest(`/api/reports${query}`)
  },
  getReport: (reportId) => apiRequest(`/api/reports/${reportId}`),
  uploadReport: (formData) =>
    apiRequest('/api/reports/upload', {
      method: 'POST',
      body: formData,
    }),
  getDownloadUrl: (reportId) => `/api/reports/${reportId}/download`,
}

export const modeApi = {
  getMode: () => apiRequest('/api/mode'),
  toggleMode: (mode) =>
    apiRequest('/api/mode', {
      method: 'POST',
      body: JSON.stringify(mode ? { mode } : {}),
    }),
}

const api = {
  auth: authApi,
  patient: patientApi,
  reports: reportsApi,
  mode: modeApi,
  token: tokenService,
  request: apiRequest,
}

export default api
