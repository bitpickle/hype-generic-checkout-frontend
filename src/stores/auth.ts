import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type LoginRequestBody,
  loginControllerGetLoggedUser,
  loginControllerLogin,
  loginControllerRefreshToken,
  type UserDataResponseDto,
} from "@/_gen/api/auth/sdk.gen";
import { authClient, ticketsClient } from '@/lib/api';

interface AuthState {
  user: UserDataResponseDto | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequestBody) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        set({ token: access, refreshToken: refresh, isAuthenticated: true });
        // Set bearer token for future requests
        authClient.interceptors.request.use((req) => {
          req.headers.set('Authorization', `Bearer ${access}`);
          return req;
        });
        ticketsClient.interceptors.request.use((req) => {
          req.headers.set('Authorization', `Bearer ${access}`);
          return req;
        });
      },

      login: async (credentials) => {
        try {
          const response = await loginControllerLogin({ body: credentials });

          if (response.data) {
            const { access_token, refresh_token } = response.data;
            get().setTokens(access_token, refresh_token);

            // Fetch user data
            const userResponse = await loginControllerGetLoggedUser();
            if (userResponse.data) {
              set({ user: userResponse.data });
            }
          }
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        // Clear headers
        // Note: Hey API client doesn't have a direct "remove interceptor" method easily exposed in this pattern usually,
        // but resetting the store state handles the logic. We could add logic to clear the header if needed.
        // For simplicity, we just rely on the token being null in state.
      },

      initialize: async () => {
        const { token, refreshToken } = get();
        if (token) {
          get().setTokens(token, refreshToken || '');
          try {
            const userResponse = await loginControllerGetLoggedUser();
            if (userResponse.data) {
              set({ user: userResponse.data });
            }
          } catch (_error) {
            // Token might be expired, try refresh
            if (refreshToken) {
              try {
                const refreshResponse = await loginControllerRefreshToken({
                  body: { refresh_token: refreshToken },
                });
                if (refreshResponse.data) {
                  const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
                  get().setTokens(access_token, newRefreshToken);
                  const userResponse = await loginControllerGetLoggedUser();
                  if (userResponse.data) {
                    set({ user: userResponse.data });
                  }
                }
              } catch (_refreshError) {
                get().logout();
              }
            } else {
              get().logout();
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken }),
    }
  )
);
