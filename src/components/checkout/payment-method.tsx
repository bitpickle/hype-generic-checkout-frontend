import { CreditCard, QrCode } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PaymentMethod({ onNext }: { onNext: (method: string) => void }) {
  const [method, setMethod] = useState('pix');

  const handleNext = () => {
    onNext(method);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Forma de Pagamento</h2>

      <RadioGroup
        defaultValue="pix"
        onValueChange={setMethod}
        className="grid gap-4 md:grid-cols-2"
      >
        <div>
          <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
          <Label
            htmlFor="pix"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <QrCode className="mb-3 h-6 w-6" />
            Pix
            <span className="text-sm text-muted-foreground text-center mt-2">
              Pagamento instantâneo
            </span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="credit_card" id="credit_card" className="peer sr-only" />
          <Label
            htmlFor="credit_card"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <CreditCard className="mb-3 h-6 w-6" />
            Cartão de Crédito
            <span className="text-sm text-muted-foreground text-center mt-2">Até 12x</span>
          </Label>
        </div>
      </RadioGroup>

      {/* Conditional fields for Credit Card (simplified placeholder) */}
      {method === 'credit_card' && (
        <div className="p-4 border rounded-md bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            Formulário de cartão de crédito será exibido aqui (Integração com gateway).
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleNext}>
          Finalizar Compra
        </Button>
      </div>
    </div>
  );
}
