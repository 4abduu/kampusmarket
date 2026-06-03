// Get API base URL dari env, dengan fallback ke current origin + /api
// JANGAN hardcode localhost!
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  // Fallback: gunakan current origin jika development environment
  if (import.meta.env.DEV) {
    return "http://localhost:8000/api";
  }

  // Production: gunakan domain saat ini + /api
  // Ini lebih aman karena akan otomatis pakai domain yang benar
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/api`;
};

export const API_BASE_URL = getApiBaseUrl(); 