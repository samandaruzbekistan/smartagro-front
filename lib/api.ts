import { clearAuthSession, getAuthToken } from "./auth-storage"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://maktab.ideal-study.uz/api"

interface ApiResponse<T> {
  data: T
  links?: any
  meta?: any
}

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    console.log("[v0] Calling API:", url)

    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    })

    if (res.status === 401) {
      clearAuthSession()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
      throw new Error("Unauthorized")
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    const response: ApiResponse<T> = await res.json()
    return response.data
  } catch (error) {
    console.error(`[API] Error calling ${endpoint}:`, error instanceof Error ? error.message : error)
    throw error
  }
}

// Fields
export const fieldsApi = {
  list: (farmId?: number) => apiCall<any[]>(`/fields${farmId ? `?farm_id=${farmId}` : ""}`),
  get: (id: number) => apiCall(`/fields/${id}`),
  create: (data: any) => apiCall("/fields", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/fields/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/fields/${id}`, { method: "DELETE" }),
  updateGeometry: (id: number, data: any) =>
    apiCall(`/fields/${id}/geometry`, { method: "PUT", body: JSON.stringify(data) }),
  getWeather: (id: number) => apiCall(`/fields/${id}/weather`),
}

// Soil Samples
export const soilsApi = {
  list: (fieldId?: number) => apiCall<any[]>(`/soils${fieldId ? `?field_id=${fieldId}` : ""}`),
  get: (id: number) => apiCall(`/soils/${id}`),
  create: (data: any) => apiCall("/soils", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/soils/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/soils/${id}`, { method: "DELETE" }),
  getAiAnalysis: (id: number) => apiCall(`/soils/${id}/ai-analysis`),
}

// Reports
export const reportsApi = {
  list: (farmId?: number) => apiCall<any[]>(`/reports${farmId ? `?farm_id=${farmId}` : ""}`),
  get: (id: number) => apiCall(`/reports/${id}`),
  create: (data: any) => apiCall("/reports", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/reports/${id}`, { method: "DELETE" }),
}

// Analyses
export const analysesApi = {
  list: (params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiCall<any[]>(`/analyses${query ? `?${query}` : ""}`)
  },
  get: (id: number) => apiCall(`/analyses/${id}`),
  create: (data: any) => apiCall("/analyses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/analyses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/analyses/${id}`, { method: "DELETE" }),
  getReadiness: (id: number) => apiCall(`/analyses/${id}/readiness`),
  getFertilizers: (id: number) => apiCall(`/analyses/${id}/conclusions/fertilizers`),
  getAmounts: (id: number) => apiCall(`/analyses/${id}/conclusions/amounts`),
  getAiAnalysis: (id: number) => apiCall(`/analyses/${id}/ai-analysis`),
}

// Machines
export const machinesApi = {
  list: (farmId?: number) => apiCall<any[]>(`/machines${farmId ? `?farm_id=${farmId}` : ""}`),
  get: (id: number) => apiCall(`/machines/${id}`),
  create: (data: any) => apiCall("/machines", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/machines/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/machines/${id}`, { method: "DELETE" }),
  getMaintenance: (id: number) => apiCall(`/machines/${id}/maintenance`),
  addMaintenance: (id: number, data: any) =>
    apiCall(`/machines/${id}/maintenance`, { method: "POST", body: JSON.stringify(data) }),
  getWorkLogs: (id: number, params?: any) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/machines/${id}/work-logs${query ? `?${query}` : ""}`)
  },
  addWorkLog: (id: number, data: any) =>
    apiCall(`/machines/${id}/work-logs`, { method: "POST", body: JSON.stringify(data) }),
}

// Workers
export const workersApi = {
  list: (farmId?: number) => apiCall<any[]>(`/workers${farmId ? `?farm_id=${farmId}` : ""}`),
  get: (id: number) => apiCall(`/workers/${id}`),
  create: (data: any) => apiCall("/workers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/workers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
}

// Reference Data
export const elementsApi = {
  list: () => apiCall<any[]>("/elements"),
  get: (id: number) => apiCall(`/elements/${id}`),
}

export const plantsApi = {
  list: () => apiCall<any[]>("/plants"),
  get: (id: number) => apiCall(`/plants/${id}`),
}

// Crop Recommendation
export const cropRecommendationApi = {
  getOptions: () => apiCall<any>("/crop-recommendation/options"),
  getRecommendation: (data: { field_id: number; soil_id: number; plant_id: number }) =>
    apiCall("/crop-recommendation", { method: "POST", body: JSON.stringify(data) }),
}

interface AuthSuccessResponse {
  user: {
    id: number
    name: string
    email: string
  }
  token: string
  token_type: string
}

// Helper function for auth API calls through Next.js API routes (bypasses CORS)
async function authApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `/api${endpoint}`
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      clearAuthSession()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
      throw new Error("Unauthorized")
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage =
        errorData.message || errorData.errors?.[Object.keys(errorData.errors || {})[0]]?.[0] || `API error: ${res.status}`
      throw new Error(errorMessage)
    }

    const response = await res.json()
    // If response has a 'data' property, return it; otherwise return the whole response
    // This handles both { data: {...} } and direct {...} response formats
    if (response && typeof response === "object" && "data" in response) {
      return (response.data !== undefined ? response.data : response) as T
    }
    return response as T
  } catch (error) {
    console.error(`[Auth API] Error calling ${endpoint}:`, error instanceof Error ? error.message : error)
    throw error
  }
}

export const authApi = {
  login: async (data: { email: string; password: string }): Promise<AuthSuccessResponse> => {
    // authApiCall already extracts 'data' if present
    const response = await authApiCall<AuthSuccessResponse | { message: string; data: AuthSuccessResponse }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
    // If somehow we still get { data: {...} }, extract it
    if (response && typeof response === "object" && "data" in response && !("user" in response)) {
      return (response as { data: AuthSuccessResponse }).data
    }
    return response as AuthSuccessResponse
  },
  register: async (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<AuthSuccessResponse> => {
    // authApiCall already extracts 'data' if present
    const response = await authApiCall<AuthSuccessResponse | { message: string; data: AuthSuccessResponse }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
    // If somehow we still get { data: {...} }, extract it
    if (response && typeof response === "object" && "data" in response && !("user" in response)) {
      return (response as { data: AuthSuccessResponse }).data
    }
    return response as AuthSuccessResponse
  },
  profile: async (): Promise<AuthSuccessResponse["user"]> => {
    // authApiCall already extracts 'data' if present, so response should be the user object directly
    const response = await authApiCall<AuthSuccessResponse["user"] | { data: AuthSuccessResponse["user"] }>(
      "/auth/profile"
    )
    // If somehow we still get { data: {...} }, extract it
    if (response && typeof response === "object" && "data" in response && !("id" in response)) {
      return (response as { data: AuthSuccessResponse["user"] }).data
    }
    return response as AuthSuccessResponse["user"]
  },
  updateProfile: async (data: { name?: string; email?: string }): Promise<AuthSuccessResponse["user"]> => {
    // authApiCall already extracts 'data' if present, so response should be the user object directly
    const response = await authApiCall<AuthSuccessResponse["user"] | { message?: string; data: AuthSuccessResponse["user"] }>(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    )
    // If somehow we still get { data: {...} }, extract it
    if (response && typeof response === "object" && "data" in response && !("id" in response)) {
      return (response as { data: AuthSuccessResponse["user"] }).data
    }
    return response as AuthSuccessResponse["user"]
  },
  updatePassword: async (data: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> => {
    const response = await authApiCall<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response
  },
  logout: () => authApiCall("/auth/logout", { method: "POST" }),
  logoutAll: () => apiCall("/auth/logout-all", { method: "POST" }), // Keep direct call for now
}

// Expenses API endpoints
export const expensesApi = {
  list: (farmId?: number) => apiCall<any[]>(`/expenses${farmId ? `?farm_id=${farmId}` : ""}`),
  get: (id: number) => apiCall(`/expenses/${id}`),
  create: (data: any) => apiCall("/expenses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiCall(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/expenses/${id}`, { method: "DELETE" }),
}
