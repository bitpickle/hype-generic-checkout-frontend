import { Link } from '@tanstack/react-router';
import { CheckCircle, RefreshCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutResultProps {
  status: 'success' | 'expired' | 'failed';
  onRetry?: () => void;
  orderId?: string;
}

export function CheckoutResult({ status, onRetry }: CheckoutResultProps) {
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in duration-500">
        <CheckCircle className="h-24 w-24 text-green-500" />
        <h1 className="text-3xl font-bold">Compra Confirmada!</h1>
        <p className="text-muted-foreground max-w-md">
          Seus ingressos foram reservados com sucesso. Você receberá os detalhes por email e pode
          acessá-los na sua conta.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link to="/">Voltar para Eventos</Link>
          </Button>
          <Button asChild>
            <Link to="/my-tickets">Ver Meus Ingressos</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in duration-500">
        <RefreshCcw className="h-24 w-24 text-orange-500" />
        <h1 className="text-3xl font-bold">Tempo Excedido</h1>
        <p className="text-muted-foreground max-w-md">
          O tempo para completar sua compra expirou. Por favor, reinicie o processo para garantir
          seus ingressos.
        </p>
        <Button onClick={onRetry} size="lg">
          Reiniciar Compra
        </Button>
      </div>
    );
  }

  // Failed
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in duration-500">
      <XCircle className="h-24 w-24 text-destructive" />
      <h1 className="text-3xl font-bold">Falha no Pagamento</h1>
      <p className="text-muted-foreground max-w-md">
        Houve um problema ao processar seu pagamento. Verifique seus dados e tente novamente.
      </p>
      <div className="flex gap-4">
        <Button onClick={onRetry} variant="outline">
          Tentar Novamente
        </Button>
        <Button asChild variant="ghost">
          <Link to="/">Cancelar</Link>
        </Button>
      </div>
    </div>
  );
}
