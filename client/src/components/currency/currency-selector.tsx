import { useCurrencyPreference } from '@/hooks/use-currency-preference';
import { CurrencyDisplay } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DollarSign, IndianRupee, Check } from 'lucide-react';

export default function CurrencySelector() {
  const { currencyPreference, setCurrencyPreference } = useCurrencyPreference();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          {currencyPreference === 'USD' && <DollarSign className="h-4 w-4" />}
          {currencyPreference === 'INR' && <IndianRupee className="h-4 w-4" />}
          {currencyPreference === 'BOTH' && (
            <div className="flex gap-1">
              <DollarSign className="h-4 w-4" />
              <span>/</span>
              <IndianRupee className="h-4 w-4" />
            </div>
          )}
          <span className="ml-1">
            {currencyPreference === 'USD' ? 'USD' : 
             currencyPreference === 'INR' ? 'INR' : 'USD/INR'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setCurrencyPreference('USD')}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          <span>USD</span>
          {currencyPreference === 'USD' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setCurrencyPreference('INR')}
          className="flex items-center gap-2"
        >
          <IndianRupee className="h-4 w-4" />
          <span>INR</span>
          {currencyPreference === 'INR' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setCurrencyPreference('BOTH')}
          className="flex items-center gap-2"
        >
          <div className="flex gap-1">
            <DollarSign className="h-4 w-4" />
            <IndianRupee className="h-4 w-4" />
          </div>
          <span>Both</span>
          {currencyPreference === 'BOTH' && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}