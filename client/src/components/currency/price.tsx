import { useCurrencyPreference } from '@/hooks/use-currency-preference';
import { formatCurrencyWithOptions } from '@/lib/currency';

interface PriceProps {
  amount: number;
  className?: string;
}

export default function Price({ amount, className = '' }: PriceProps) {
  const { currencyPreference } = useCurrencyPreference();
  
  return (
    <span className={className}>
      {formatCurrencyWithOptions(amount, currencyPreference)}
    </span>
  );
}