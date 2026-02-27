import { Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';

export function CartReview({ onNext }: { onNext: () => void }) {
  const { items, updateQuantity, removeItem, calculateTotal } = useCartStore();
  const total = calculateTotal();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Seu carrinho está vazio</h3>
        <Button asChild className="mt-4">
          <Link to="/">Ver Eventos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Ingresso</th>
              <th className="p-4 text-center font-medium w-32">Quantidade</th>
              <th className="p-4 text-right font-medium w-32">Preço</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.batchId} className="border-t">
                <td className="p-4">
                  <div className="font-medium">{item.batchName}</div>
                  <div className="text-muted-foreground text-xs">{item.sectionName}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.batchId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.batchId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="p-4 text-right">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    item.price * item.quantity
                  )}
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                    onClick={() => removeItem(item.batchId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/50 font-medium">
            <tr>
              <td colSpan={2} className="p-4 text-right">
                Total
              </td>
              <td className="p-4 text-right">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  total
                )}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
