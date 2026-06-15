import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { PriceSchema } from '@/types';
import { cn } from '@/lib/utils';

interface PricingDisplayProps {
  prices: PriceSchema;
  showMember?: boolean;
  size?: 'sm' | 'lg';
}

export default function PricingDisplay({ prices, showMember = true, size = 'sm' }: PricingDisplayProps) {
  const isMember = useStore((s) => s.isMember);
  const textSm = size === 'sm' ? 'text-xs' : 'text-sm';
  const textXs = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const textLg = size === 'sm' ? 'text-lg' : 'text-3xl';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-3">
        <span className={cn(`font-black tracking-tight text-gray-900`, textLg)}>
          {formatCurrency(prices.sale)}
        </span>
        <span className={cn(`text-gray-400 line-through font-semibold mb-0.5`, textSm)}>
          {formatCurrency(prices.base)}
        </span>
        <span className={cn("text-green-600 font-bold uppercase tracking-wider mb-1", textXs)}>
          Save {formatCurrency(prices.base - prices.sale)}
        </span>
      </div>
      {showMember && (
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("bg-[#FFE600] text-black px-2 py-0.5 rounded font-black uppercase tracking-widest", textXs)}>
            Member Price
          </span>
          <span className={cn("text-gray-900 font-bold", textSm)}>
            {formatCurrency(prices.member)}
          </span>
          {isMember && (
            <span className={cn("text-green-600 font-bold tracking-wider uppercase", textXs)}>
              ✓ Applied
            </span>
          )}
        </div>
      )}
    </div>
  );
}
