import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { clearSession, getToken, getUser } from "./auth-client";

// Module augmentation for custom request options
declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: Record<string, string | number | boolean | null | undefined>;
    skipAuth?: boolean;
  }
}

/**
 * Generate a unique request ID for tracing and logging.
 */
function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
}

/**
 * Safely set a header on Axios headers (supports both AxiosHeaders class and plain objects).
 */
function setHeader(headers: InternalAxiosRequestConfig["headers"], key: string, value: string) {
  if (!headers) return;
  if (typeof (headers as { set?: (k: string, v: string) => void }).set === "function") {
    (headers as { set: (k: string, v: string) => void }).set(key, value);
  } else {
    headers[key] = value;
  }
}

/**
 * Safely set a header only if it doesn't already exist.
 */
function setHeaderIfMissing(
  headers: InternalAxiosRequestConfig["headers"],
  key: string,
  value: string
) {
  if (!headers) return;
  if (typeof (headers as { has?: (k: string) => boolean; set?: (k: string, v: string) => void }).has === "function") {
    const h = headers as { has: (k: string) => boolean; set: (k: string, v: string) => void };
    if (!h.has(key)) {
      h.set(key, value);
    }
  } else if (!headers[key]) {
    headers[key] = value;
  }
}

/**
 * Centralized Axios client instance for WorkHub.
 */
export const api: AxiosInstance = axios.create({
  baseURL: "", // Default to same origin for Next.js API routes
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
  },
});

/**
 * Request Interceptor:
 * Injects auth tokens, metadata headers, and client contextual information.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Authorization Token Injection
    if (!config.skipAuth) {
      const token = getToken();
      if (token) {
        setHeaderIfMissing(config.headers, "Authorization", `Bearer ${token}`);
      }
    }

    // 2. Correlation Request ID
    setHeaderIfMissing(config.headers, "X-Request-Id", generateRequestId());

    // 3. Client Platform & Telemetry Metadata
    setHeaderIfMissing(config.headers, "X-Client-Platform", "web");

    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone) {
          setHeaderIfMissing(config.headers, "X-Client-Timezone", timeZone);
        }
      } catch {
        // Fallback silently if timezone resolution fails
      }
    }

    // 4. Authenticated User Metadata (if available in session)
    const user = getUser();
    if (user?.role) {
      setHeaderIfMissing(config.headers, "X-User-Role", user.role);
    }
    if (user?.id) {
      setHeaderIfMissing(config.headers, "X-User-Id", String(user.id));
    }

    // 5. Custom Metadata Headers (passed via config.metadata)
    if (config.metadata) {
      for (const [metaKey, metaVal] of Object.entries(config.metadata)) {
        if (metaVal !== undefined && metaVal !== null) {
          setHeader(config.headers, `X-Meta-${metaKey}`, String(metaVal));
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Standardizes backend error messages and handles session invalidation.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const backendMessage = data?.error || data?.message;

      // Extract and normalize error message onto the AxiosError instance
      if (backendMessage && typeof backendMessage === "string") {
        error.message = backendMessage;
      }

      // Handle 401 Unauthorized globally for authenticated routes
      if (status === 401 && typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
        const isAuthApi = error.config?.url?.includes("/api/auth/login") ||
                          error.config?.url?.includes("/api/auth/register");

        // Clear invalid/expired session if not already in the auth flow
        if (!isAuthPage && !isAuthApi) {
          clearSession();
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to extract user-friendly error messages from any catch block error.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export default api;
