import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, Mail, Phone, Ticket, User } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRegister, useLogin, useCurrentUser } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
})

function RegisterPage() {
  const { redirect } = useSearch({ from: '/_auth/register' })
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const registerMutation = useRegister()
  const loginMutation = useLogin()
  const { refetch: refetchUser } = useCurrentUser()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await registerMutation.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    })
    if (result.data) {
      // Auto-login after register
      const loginResult = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      })
      if (loginResult.data) {
        await refetchUser()
        navigate({ to: redirect ?? '/' })
      }
    }
  })

  const isPending = registerMutation.isPending || loginMutation.isPending

  return (
    <div className="flex flex-col min-h-svh px-6 py-12">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-4 mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
          <Ticket size={32} className="text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground font-display">Criar conta</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Cadastre-se para comprar ingressos
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label className="font-body">Nome</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...form.register('firstName')}
                placeholder="João"
                className={cn('pl-9', form.formState.errors.firstName && 'border-destructive')}
                autoComplete="given-name"
              />
            </div>
            {form.formState.errors.firstName && (
              <span className="text-xs text-destructive font-body">
                {form.formState.errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <Label className="font-body">Sobrenome</Label>
            <Input
              {...form.register('lastName')}
              placeholder="Silva"
              className={cn(form.formState.errors.lastName && 'border-destructive')}
              autoComplete="family-name"
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
              placeholder="seu@email.com"
              className={cn('pl-9', form.formState.errors.email && 'border-destructive')}
              autoComplete="email"
            />
          </div>
          {form.formState.errors.email && (
            <span className="text-xs text-destructive font-body">{form.formState.errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="font-body">Telefone</Label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register('phone')}
              type="tel"
              placeholder="(11) 99999-9999"
              className={cn('pl-9', form.formState.errors.phone && 'border-destructive')}
              autoComplete="tel"
            />
          </div>
          {form.formState.errors.phone && (
            <span className="text-xs text-destructive font-body">{form.formState.errors.phone.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="font-body">Senha</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              className={cn('pl-9 pr-10', form.formState.errors.password && 'border-destructive')}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {form.formState.errors.password && (
            <span className="text-xs text-destructive font-body">{form.formState.errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="font-body">Confirmar senha</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••"
              className={cn('pl-9 pr-10', form.formState.errors.confirmPassword && 'border-destructive')}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {form.formState.errors.confirmPassword && (
            <span className="text-xs text-destructive font-body">
              {form.formState.errors.confirmPassword.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2 h-12 font-body text-base font-semibold rounded-xl"
          disabled={isPending}
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </motion.form>

      {/* Login link */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        <span className="text-sm text-muted-foreground font-body">Já tem uma conta?</span>
        <Link
          to="/login"
          search={{ redirect }}
          className="text-sm font-semibold text-brand hover:underline font-body"
        >
          Entrar
        </Link>
      </div>
    </div>
  )
}
