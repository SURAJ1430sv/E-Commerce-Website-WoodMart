import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CurrencyDisplay } from '@/lib/currency';

type CurrencyPreferenceContextType = {
  currencyPreference: CurrencyDisplay;
  setCurrencyPreference: (preference: CurrencyDisplay) => void;
};

const CurrencyPreferenceContext = createContext<CurrencyPreferenceContextType | null>(null);

export function CurrencyPreferenceProvider({ children }: { children: ReactNode }) {
  // Get saved preference from localStorage or default to 'BOTH'
  const [currencyPreference, setCurrencyPreference] = useState<CurrencyDisplay>('BOTH');
  
  // Load saved preference on initial render
  useEffect(() => {
    const savedPreference = localStorage.getItem('currencyPreference') as CurrencyDisplay | null;
    if (savedPreference && ['USD', 'INR', 'BOTH'].includes(savedPreference)) {
      setCurrencyPreference(savedPreference);
    }
  }, []);
  
  // Save preference to localStorage when it changes
  const updatePreference = (preference: CurrencyDisplay) => {
    localStorage.setItem('currencyPreference', preference);
    setCurrencyPreference(preference);
  };
  
  return (
    <CurrencyPreferenceContext.Provider
      value={{
        currencyPreference,
        setCurrencyPreference: updatePreference,
      }}
    >
      {children}
    </CurrencyPreferenceContext.Provider>
  );
}

export function useCurrencyPreference() {
  const context = useContext(CurrencyPreferenceContext);
  if (!context) {
    throw new Error('useCurrencyPreference must be used within a CurrencyPreferenceProvider');
  }
  return context;
}