import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { motion } from 'motion/react'
import { LogOut, User, Mail, Edit2, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentUser, useUpdateUser } from '@/hooks/use-auth'
import { useCheckoutStore } from '@/stores/checkout.store'
import { useCartStore } from '@/stores/cart.store'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_main/profile')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: '/profile' } })
    }
  },
  component: ProfilePage,
})

const editSchema = z.object({
  firstName: z.string().min(2, 'Nome obrigatório'),
  lastName: z.string().min(2, 'Sobrenome obrigatório'),
  email: z.string().email('E-mail inválido'),
})

type EditValues = z.infer<typeof editSchema>

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: userData, isLoading } = useCurrentUser()
  const effectiveUser = userData ?? user
  const [isEditing, setIsEditing] = useState(false)

  const updateUser = useUpdateUser(effectiveUser?.id ?? '')

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: effectiveUser?.email ?? '',
    },
    values: {
      firstName: (effectiveUser as { firstName?: string } | null)?.firstName ?? effectiveUser?.name?.split(' ')[0] ?? '',
      lastName: (effectiveUser as { lastName?: string } | null)?.lastName ?? effectiveUser?.name?.split(' ').slice(1).join(' ') ?? '',
      email: effectiveUser?.email ?? '',
    },
  })

  const handleLogout = () => {
    logout()
    useCheckoutStore.getState().resetCheckout()
    useCartStore.getState().clearCart()
    navigate({ to: '/login' })
  }

  const handleSave = form.handleSubmit(async (values) => {
    await updateUser.mutateAsync(values)
    setIsEditing(false)
  })

  const initials = getInitials(effectiveUser?.name ?? '')

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="flex flex-col flex-1 pb-2">
        {/* Header */}
        <div className="px-5 pt-10 pb-6">
          <h1 className="text-2xl font-bold text-foreground font-display">Meu perfil</h1>
        </div>

        {isLoading ? (
          <div className="px-5 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-6">
            {/* Avatar + name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary-foreground font-display">
                  {initials}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-lg font-bold text-foreground font-body truncate">
                  {effectiveUser?.name ?? `${(effectiveUser as { firstName?: string } | null)?.firstName ?? ''} ${(effectiveUser as { lastName?: string } | null)?.lastName ?? ''}`.trim()}
                </span>
                <span className="text-sm text-muted-foreground font-body truncate">
                  {effectiveUser?.email}
                </span>
              </div>
            </motion.div>

            {/* Edit form */}
            {isEditing ? (
              <motion.form
                onSubmit={handleSave}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="font-body">Nome</Label>
                    <Input
                      {...form.register('firstName')}
                      className={cn(form.formState.errors.firstName && 'border-destructive')}
                    />
                    {form.formState.errors.firstName && (
                      <span className="text-xs text-destructive font-body">
                        {form.formState.errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="font-body">Sobrenome</Label>
                    <Input
                      {...form.register('lastName')}
                      className={cn(form.formState.errors.lastName && 'border-destructive')}
                    />
                    {form.formState.errors.lastName && (
                      <span className="text-xs text-destructive font-body">
                        {form.formState.errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="font-body">E-mail</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...form.register('email')}
                      type="email"
                      className={cn('pl-9', form.formState.errors.email && 'border-destructive')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <span className="text-xs text-destructive font-body">
                      {form.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-12 rounded-xl font-body"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUser.isPending}
                    className="flex-1 h-12 rounded-xl font-body"
                  >
                    {updateUser.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                  <User size={18} className="text-muted-foreground shrink-0" />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground font-body">Nome completo</span>
                    <span className="text-sm font-medium text-foreground font-body truncate">
                      {effectiveUser?.name ?? `${(effectiveUser as { firstName?: string } | null)?.firstName ?? ''} ${(effectiveUser as { lastName?: string } | null)?.lastName ?? ''}`.trim()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                  <Mail size={18} className="text-muted-foreground shrink-0" />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground font-body">E-mail</span>
                    <span className="text-sm font-medium text-foreground font-body truncate">
                      {effectiveUser?.email}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-3 w-full h-auto p-4 rounded-2xl border border-border bg-card hover:bg-secondary justify-start text-left"
                >
                  <Edit2 size={18} className="text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm font-medium text-foreground font-body">
                    Editar dados
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Button>
              </div>
            )}

            {/* Logout */}
            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full h-auto p-4 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 justify-start text-left"
              >
                <LogOut size={18} className="text-destructive shrink-0" />
                <span className="flex-1 text-sm font-medium text-destructive font-body">
                  Sair da conta
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
