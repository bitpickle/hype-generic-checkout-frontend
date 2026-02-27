import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { userControllerUpdate } from '@/api/auth/sdk.gen';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Nome é obrigatório'),
  lastName: z.string().min(2, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
});

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, initialize } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user?.id) return;

    try {
      await userControllerUpdate({
        path: { id: user.id },
        body: {
          ...data,
          // Assuming the API supports partial update or we send all fields
        },
      });
      toast.success('Perfil atualizado com sucesso!');
      await initialize(); // Refresh user data in store
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">Você precisa estar logado</h3>
        <Button asChild className="mt-4">
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-4 p-6 border rounded-xl bg-card shadow-sm w-full md:w-auto">
          <Avatar className="h-32 w-32">
            <AvatarImage src="" />
            <AvatarFallback className="text-4xl">
              {user.name?.substring(0, 2).toUpperCase() || 'US'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 w-full space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border rounded-xl p-6 bg-card shadow-sm"
          >
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Informações Pessoais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} disabled className="bg-muted" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>

          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4 text-destructive">
              Zona de Perigo
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              A exclusão da sua conta é uma ação irreversível. Todos os seus dados e ingressos serão
              perdidos.
            </p>
            <Button variant="destructive">Excluir Conta</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
