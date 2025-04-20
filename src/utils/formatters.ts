export const formatCNPJ = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply CNPJ mask progressively
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply phone mask progressively
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const formatCurrency = (value: string | number): string => {
  if (typeof value === 'number') {
    // If it's already a number, format it directly
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // If it's a string, handle it as before
  const digits = value.replace(/\D/g, '');
  
  // Convert to number (in cents)
  const cents = parseInt(digits, 10);
  
  // Handle empty or invalid input
  if (isNaN(cents)) {
    return '';
  }
  
  // Convert cents to reais (divide by 100)
  const reais = cents / 100;
  
  // Format as currency
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
};

export const unformatCurrency = (value: string): string => {
  // Remove currency symbol, dots and convert comma to dot
  const numericString = value.replace(/[R$\s.]/g, '').replace(',', '.');
  // If the value is empty or not a number, return '0'
  return numericString || '0';
};

export const unformatValue = (value: string): string => {
  // Remove all non-digits
  return value.replace(/\D/g, '');
}; 