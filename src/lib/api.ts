import { client as authClient } from '@/_gen/api/auth/client.gen';
import { client as ticketsClient } from '@/_gen/api/tickets/client.gen';
import { loginControllerRefreshToken } from '@/_gen/api/auth/sdk.gen';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL as string;
const TENANT_ID = import.meta.env.VITE_TENANT_ID as string;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => {
    cb(token);
  });
  refreshSubscribers = [];
}

function getAuthStore() {
  return useAuthStore.getState();
}

function setupClient(client: typeof authClient | typeof ticketsClient) {
  client.setConfig({
    baseUrl: API_URL,
    headers: {
      'tenant-id': TENANT_ID,
    },
  });

  // Inject bearer token on each request
  client.interceptors.request.use(async (request) => {
    const token = getAuthStore().accessToken;
    if (token) {
      console.log('Attaching token to request:', token); // Debug log to check token value
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  });

  // Handle 401 by refreshing token and retrying
  client.interceptors.response.use(async (response, request) => {
    if (response.status !== 401) return response;

    // Avoid refresh loop for the refresh endpoint itself
    if (request.url.includes('/auth/login/refresh')) return response;

    const { refreshToken, setAuth, logout } = getAuthStore();
    if (!refreshToken) {
      logout();
      return response;
    }

    if (isRefreshing) {
      return new Promise<Response>((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          request.headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(request));
        });
      });
    }

    isRefreshing = true;

    try {
      const result = await loginControllerRefreshToken({
        body: { refresh_token: refreshToken },
        headers: { 'tenant-id': TENANT_ID },
      });

      if (result.data) {
        setAuth(result.data);
        onTokenRefreshed(result.data.access_token);
        request.headers.set('Authorization', `Bearer ${result.data.access_token}`);
        isRefreshing = false;
        return fetch(request);
      } else {
        logout();
        isRefreshing = false;
        return response;
      }
    } catch {
      logout();
      isRefreshing = false;
      return response;
    }
  });
}

export function initApiClients() {
  setupClient(authClient);
  setupClient(ticketsClient);
}
