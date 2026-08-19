// API Client Helper for connecting to the FastAPI Python Backend

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  method: string,
  path: string,
  body?: any,
  isMultipart = false
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("aglow_token") : null;
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let requestBody: any = undefined;

  if (body) {
    if (isMultipart) {
      requestBody = body; // Let the browser set Content-Type with boundary for FormData
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      let message = "An error occurred";
      try {
        const errJson = await response.json();
        message = errJson.detail || errJson.message || message;
      } catch (e) {
        // Response wasn't JSON
        message = await response.text() || message;
      }
      
      throw {
        status: response.status,
        message,
      } as ApiError;
    }

    // Handle empty response (like 204 or delete status)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: any) {
    if (error.status) throw error; // Re-throw structured ApiError
    throw {
      status: 500,
      message: error.message || "Failed to communicate with the server",
    } as ApiError;
  }
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: any, isMultipart = false) => request<T>("POST", path, body, isMultipart),
  put: <T>(path: string, body?: any) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  url: (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
};
