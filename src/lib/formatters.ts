/**
 * Utilitários de formatação pt-BR para balcão de oficinas mecânicas
 */

// Formata telefone/WhatsApp (10 ou 11 dígitos)
export function formatPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Formata CPF (11 dígitos) ou CNPJ (14 dígitos)
export function formatCpfCnpj(val?: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
  return val;
}

// Formata placa de veículos em maiúsculas (ex: ABC1D23 ou ABC-1234)
export function formatPlate(plate?: string): string {
  if (!plate) return '';
  const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 7) {
    // Se for formato antigo (ex: ABC1234), insere hífen opcional visual
    if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    // Formato Mercosul (ex: ABC1D23)
    return clean;
  }
  return plate.toUpperCase();
}

// Formata quilometragem (ex: 87500 -> "87.500 km")
export function formatMileage(km?: number): string {
  if (km === undefined || km === null) return '0 km';
  return `${new Intl.NumberFormat('pt-BR').format(km)} km`;
}

// Formata data ISO para dd/mm/aaaa
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(d);
  } catch {
    return dateString;
  }
}

// Formata valor monetário BRL (ex: 350.5 -> "R$ 350,50")
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

