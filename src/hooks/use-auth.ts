import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  loginControllerLogin,
  loginControllerGetLoggedUser,
  userControllerCreate,
  userControllerUpdate,
} from '@/_gen/api/auth/sdk.gen'
import type {
  LoginRequestBody,
  CreateUserDto,
  UpdateUserDto,
} from '@/_gen/api/auth/types.gen'
import { useAuthStore } from '@/stores/auth.store'

const TENANT_ID = import.meta.env.VITE_TENANT_ID as string

export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (body: LoginRequestBody) =>
      loginControllerLogin({
        body,
        headers: { 'tenant-id': TENANT_ID },
      }),
    onSuccess: (result) => {
      if (result.data) {
        setAuth(result.data)
      } else {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
      }
    },
    onError: () => {
      toast.error('Erro ao fazer login. Tente novamente.')
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: CreateUserDto) =>
      userControllerCreate({
        body,
        headers: { 'tenant-id': TENANT_ID },
      }),
    onError: () => {
      toast.error('Erro ao criar conta. Verifique os dados e tente novamente.')
    },
  })
}

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthStore()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const result = await loginControllerGetLoggedUser({
        headers: { 'tenant-id': TENANT_ID },
      })
      if (result.data) {
        setUser(result.data)
        return result.data
      }
      throw new Error('Failed to fetch user')
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateUser(userId: string) {
  return useMutation({
    mutationFn: (body: UpdateUserDto) =>
      userControllerUpdate({
        body,
        path: { id: userId },
        headers: { 'tenant-id': TENANT_ID },
      }),
    onSuccess: () => {
      toast.success('Dados atualizados com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar dados. Tente novamente.')
    },
  })
}
