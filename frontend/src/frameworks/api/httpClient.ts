import axios, { InternalAxiosRequestConfig } from 'axios';
import store from '../../appStore/store';
import { logout, setAuth } from '../../appStore/authSlice';
import { RootState } from '../../appStore/store';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _checkedAuth?: boolean;
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];
let lastLoginTime = 0;
const MIN_TIME_SINCE_LOGIN = 2000;
let networkErrorCount = 0;
const MAX_NETWORK_ERRORS = 3;
let lastNetworkError = 0;
const NETWORK_ERROR_RESET_TIME = 60000;
let unauthorizedCount = 0;
const MAX_UNAUTHORIZED_COUNT = 3;
let lastRefreshAttempt = 0;
const MIN_REFRESH_INTERVAL = 30000;
let shouldAttemptRefresh = true;

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

httpClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    if (config.data instanceof FormData && config.url?.includes('/videos')) {
      config.timeout = 60000;
      delete config.headers['Content-Type'];
    } else if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    if (config.url?.includes('/auth/login')) {
      lastLoginTime = Date.now();
      networkErrorCount = 0;
      unauthorizedCount = 0;
      shouldAttemptRefresh = true;
    }

    const state: RootState = store.getState();
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register') || config.url?.includes('/auth/refresh-token') || config.url?.includes('/auth/me');
    if (!isAuthEndpoint && !state.auth.user && !config._checkedAuth) {
      try {
        config._checkedAuth = true;
        const meResponse = await httpClient.get('/auth/me');
        if (meResponse.data && meResponse.data.user && meResponse.data.collection) {
          store.dispatch(setAuth({ user: meResponse.data.user, collection: meResponse.data.collection }));
        }
      } catch (err) {
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => {
    networkErrorCount = 0;
    unauthorizedCount = 0;
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.error('🔒 Received 401 Unauthorized from backend');
    }
    if (error.message === 'Network Error') {
      const now = Date.now();

      if (now - lastNetworkError > NETWORK_ERROR_RESET_TIME) {
        networkErrorCount = 0;
      }

      networkErrorCount++;
      lastNetworkError = now;

      console.error(`⚠️ Network error #${networkErrorCount}/${MAX_NETWORK_ERRORS}`);

      if (networkErrorCount >= MAX_NETWORK_ERRORS) {
        shouldAttemptRefresh = false;
        import('react-hot-toast').then((toast) => {
          toast.default.error('Network connectivity issues detected. Please check your connection.');
        });
        return Promise.reject(error);
      }
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout error');
      import('react-hot-toast').then((toast) => {
        toast.default.error('Request timed out. For video uploads, this might take a few minutes. Please try again.');
      });
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401) {
      unauthorizedCount++;
      if (unauthorizedCount >= MAX_UNAUTHORIZED_COUNT) {
        store.dispatch(logout());
        shouldAttemptRefresh = false;
        return Promise.reject(error);
      }
    }

    const now = Date.now();
    const shouldSkipRefresh =
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest._retry ||
      now - lastLoginTime < MIN_TIME_SINCE_LOGIN ||
      networkErrorCount >= MAX_NETWORK_ERRORS ||
      unauthorizedCount >= MAX_UNAUTHORIZED_COUNT ||
      now - lastRefreshAttempt < MIN_REFRESH_INTERVAL ||
      !shouldAttemptRefresh;

    if (error.response?.status === 401 && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => httpClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      lastRefreshAttempt = now;

      try {
        const state = store.getState();
        const userId = state.auth.user?.id;
        if (!userId) {
          try {
            await httpClient.post('/auth/logout');
          } catch (logoutErr) {
            console.error('Logout API error (from httpClient):', logoutErr);
          }
          store.dispatch(logout());
          shouldAttemptRefresh = false;
          return Promise.reject(error);
        }
        const response = await httpClient.post('/auth/refresh-token', { userId });

        networkErrorCount = 0;
        unauthorizedCount = 0;
        shouldAttemptRefresh = true;

        store.dispatch(setAuth({
          user: response.data.data.user,
          collection: response.data.data.collection
        }));

        processQueue();
        return httpClient(originalRequest);
      } catch (refreshError: unknown) {
        if (refreshError && typeof refreshError === 'object' && 'message' in refreshError && refreshError.message === 'Network Error') {
          console.error('⚠️ Network error during token refresh');
          networkErrorCount++;

          if (networkErrorCount >= MAX_NETWORK_ERRORS) {
            shouldAttemptRefresh = false;
          }

          processQueue(refreshError);
          return Promise.reject(refreshError);
        }

        if (refreshError && typeof refreshError === 'object' && 'response' in refreshError && refreshError.response && typeof refreshError.response === 'object' && 'status' in refreshError.response && refreshError.response.status === 401) {
          shouldAttemptRefresh = false;
          store.dispatch(logout());
          processQueue(refreshError);
          return Promise.reject(refreshError);
        }

        console.error('❌ Token refresh failed:', refreshError);
        if (refreshError && typeof refreshError === 'object' && 'message' in refreshError) {
          console.error('⚠️ Refresh token request failed:', refreshError.message);
        }
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (
      error.response?.status === 404 &&
      error.config.url?.includes('/admission/applications/user')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Server error:', error.response.data);
      import('react-hot-toast').then((toast) => {
        toast.default.error('A server error occurred. Please try again later.');
      });
    }

    return Promise.reject(error);
  }
);

export default httpClient;