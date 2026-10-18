export const VENEZUELAN_BANKS = [
  'Banesco Banco Universal',
  'Banco de Venezuela (BDV)',
  'Banco Mercantil',
  'Bancamiga Banco Universal',
  'BBVA Provincial',
  'Banco Nacional de Crédito (BNC)',
  'Bancaribe',
  'Banco Exterior',
  'Banco Fondo Común (BFC)',
  'Banplus Banco Universal',
  'Banco Bicentenario',
  'Banco del Tesoro',
  'Banco Plaza',
  'Pago Móvil Banesco',
  'Pago Móvil BDV',
  'Pago Móvil Mercantil',
  'Pago Móvil Bancamiga',
  'Pago Móvil Provincial',
  'Pago Móvil BNC',
  'Zinli',
  'Wally Tech',
  'El Dorado P2P',
  'Otro Banco / Plataforma'
];

export function formatUSDT(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount) + ' USDT';
}

export function formatBs(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' Bs.';
}

export function formatRate(rate: number): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rate) + ' Bs/USDT';
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
