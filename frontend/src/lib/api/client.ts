import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || error;
    const status = error.response?.status;

    console.error('[API Error]', {
      status,
      url: error.config?.url,
      message: errorData?.message || error.message,
      data: errorData
    });

    // Only redirect to login if response explicitly says "Unauthenticated" (true 401)
    // Don't redirect on connection errors or other 4xx/5xx errors
    if (status === 401 && errorData?.message?.includes('Unauthenticated')) {
      console.warn('[API] 401 Unauthenticated - User token expired or invalid');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Emit custom event for App to handle logout
      window.dispatchEvent(new Event('unauthorized'));
    }

    throw errorData;
  }
);

export default apiClient;
