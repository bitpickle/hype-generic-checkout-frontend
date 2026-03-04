import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserDataResponseDto, UserTokenResponseDto } from '@/_gen/api/auth/types.gen'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  user: UserDataResponseDto | null
  isAuthenticated: boolean

  setAuth: (tokens: UserTokenResponseDto) => void
  setUser: (user: UserDataResponseDto) => void
  updateAccessToken: (token: string, expiresIn: number) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,

      setAuth: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      updateAccessToken: (token, expiresIn) =>
        set({
          accessToken: token,
          expiresAt: Date.now() + expiresIn * 1000,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
