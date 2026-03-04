import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, Mail, Ticket } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useLogin, useCurrentUser } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
})

function LoginPage() {
  const { redirect } = useSearch({ from: '/_auth/login' })
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const { refetch: refetchUser } = useCurrentUser()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await loginMutation.mutateAsync(values)
    if (result.data) {
      await refetchUser()
      navigate({ to: redirect ?? '/' })
    }
  })

  return (
    <div className="flex flex-col min-h-svh px-6 py-12">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-4 mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
          <Ticket size={32} className="text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground font-display">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Entre para acessar seus ingressos
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
          <Label className="font-body">Senha</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              className={cn('pl-9 pr-10', form.formState.errors.password && 'border-destructive')}
              autoComplete="current-password"
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

        <Button
          type="submit"
          className="w-full mt-2 h-12 font-body text-base font-semibold rounded-xl"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </motion.form>

      {/* Register link */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        <span className="text-sm text-muted-foreground font-body">Não tem uma conta?</span>
        <Link
          to="/register"
          search={{ redirect }}
          className="text-sm font-semibold text-brand hover:underline font-body"
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}
