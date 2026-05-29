import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { PriceSchema } from '@/types';

interface PricingDisplayProps {
  prices: PriceSchema;
  showMember?: boolean;
  size?: 'sm' | 'lg';
}

export default function PricingDisplay({ prices, showMember = true, size = 'sm' }: PricingDisplayProps) {
  const isMember = useStore((s) => s.isMember);
  const textSm = size === 'sm' ? 'text-sm' : 'text-lg';
  const textXs = size === 'sm' ? 'text-xs' : 'text-sm';
  const textLg = size === 'sm' ? 'text-base' : 'text-2xl';

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`text-gray-400 line-through ${textSm}`}>
          {formatCurrency(prices.base)}
        </span>
        <span className={`font-bold ${textLg}`}>
          {formatCurrency(prices.sale)}
        </span>
      </div>
      {showMember && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`${textXs} text-indigo-600 font-bold`}>
            Member: {formatCurrency(prices.member)}
          </span>
          {isMember && (
            <span className={`${textXs} text-green-600 font-semibold`}>
              ✓ Applied
            </span>
          )}
        </div>
      )}
    </div>
  );
}
