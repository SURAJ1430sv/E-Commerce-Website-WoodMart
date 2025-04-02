// Currency conversion utility functions

// Exchange rate (1 USD to INR)
// This would ideally be fetched from an API in a production app
const USD_TO_INR_RATE = 83.5;

/**
 * Convert USD amount to INR
 * @param usdAmount Amount in USD
 * @returns Equivalent amount in INR
 */
export function convertUsdToInr(usdAmount: number): number {
  return usdAmount * USD_TO_INR_RATE;
}

/**
 * Format currency based on the given code
 * @param amount Amount to format
 * @param currencyCode Currency code (USD, INR, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: 'USD' | 'INR' = 'USD'): string {
  const formatter = new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Currency display options for user preferences
 */
export type CurrencyDisplay = 'USD' | 'INR' | 'BOTH';

/**
 * Format currency with display options (USD, INR or both)
 * @param usdAmount Amount in USD
 * @param displayOption Display option
 * @returns Formatted currency string
 */
export function formatCurrencyWithOptions(usdAmount: number, displayOption: CurrencyDisplay = 'USD'): string {
  const usdFormatted = formatCurrency(usdAmount, 'USD');
  
  if (displayOption === 'USD') {
    return usdFormatted;
  }
  
  const inrAmount = convertUsdToInr(usdAmount);
  const inrFormatted = formatCurrency(inrAmount, 'INR');
  
  if (displayOption === 'INR') {
    return inrFormatted;
  }
  
  // Both currencies
  return `${usdFormatted} (${inrFormatted})`;
}