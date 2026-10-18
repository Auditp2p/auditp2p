import { P2POperation, P2POperationInput, FiscalSummary, FilterCriteria } from '@/types/database';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'binance_p2p_audit_operations_v1';

// Datos de demostración iniciales para que el usuario vea la app funcionando de inmediato
const SEED_OPERATIONS: P2POperation[] = [
  {
    id: 'b12a819c-8512-42fe-b56f-784860d84a01',
    type: 'COMPRA',
    operation_date: new Date(Date.now() - 3600000 * 2).toISOString(),
    bank_name: 'Banesco Banco Universal',
    counterparty_name: 'Carlos Alberto Mendoza',
    counterparty_id_doc: 'V-19842510',
    counterparty_binance_nick: 'CarlitosCrypto_VE',
    binance_order_id: '2058493820194820',
    bank_reference: '008921849',
    amount_usdt: 150.0,
    amount_bs: 142500.0,
    exchange_rate: 950.0,
    notes: 'Pago Móvil Banesco inmediato. Verificado por cédula.',
    bank_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    binance_receipt_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'f942bc10-7214-46b7-84ad-98124b81c002',
    type: 'VENTA',
    operation_date: new Date(Date.now() - 3600000 * 6).toISOString(),
    bank_name: 'Banco Mercantil',
    counterparty_name: 'María Alejandra Gómez',
    counterparty_id_doc: 'V-22104938',
    counterparty_binance_nick: 'Mari_P2P_Fast',
    binance_order_id: '2058491028472910',
    bank_reference: '748291028',
    amount_usdt: 200.0,
    amount_bs: 194000.0,
    exchange_rate: 970.0,
    notes: 'Liberado tras verificar fondos en cuenta Mercantil en línea.',
    bank_receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    binance_receipt_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'd893ac42-9901-4be5-a134-11849182a003',
    type: 'COMPRA',
    operation_date: new Date(Date.now() - 3600000 * 28).toISOString(),
    bank_name: 'Bancamiga Banco Universal',
    counterparty_name: 'Inversiones Tech Soluciones C.A.',
    counterparty_id_doc: 'J-40918274-1',
    counterparty_binance_nick: 'TechVzla_Official',
    binance_order_id: '2058419284758190',
    bank_reference: '550192837',
    amount_usdt: 500.0,
    amount_bs: 472500.0,
    exchange_rate: 945.0,
    notes: 'Transferencia mismo banco. Factura y soporte SENIAT archivado.',
    bank_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    binance_receipt_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
];

// Helper para obtener datos desde LocalStorage si Supabase no está configurado
function getLocalOperations(): P2POperation[] {
  if (typeof window === 'undefined') return SEED_OPERATIONS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_OPERATIONS));
    return SEED_OPERATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parseando localStorage:', e);
    return SEED_OPERATIONS;
  }
}

function saveLocalOperations(ops: P2POperation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ops));
}

/**
 * Obtener operaciones desde Supabase o LocalStorage
 */
export async function fetchOperations(): Promise<P2POperation[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('p2p_operations')
      .select('*')
      .order('operation_date', { ascending: false });

    if (error) {
      console.error('Error en Supabase al consultar operaciones:', error);
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    // Si Supabase está vacío, devolvemos array vacío
    return (data as P2POperation[]) || [];
  } else {
    return getLocalOperations();
  }
}

/**
 * Crear nueva operación en Supabase o LocalStorage
 */
export async function createOperation(input: P2POperationInput): Promise<P2POperation> {
  const newOp: P2POperation = {
    ...input,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('p2p_operations')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error al insertar operación en Supabase:', error);
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }

    return data as P2POperation;
  } else {
    const ops = getLocalOperations();
    const updated = [newOp, ...ops];
    saveLocalOperations(updated);
    return newOp;
  }
}

/**
 * Actualizar una operación existente
 */
export async function updateOperation(
  id: string,
  input: Partial<P2POperationInput>
): Promise<P2POperation> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('p2p_operations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar operación en Supabase:', error);
      throw new Error(`Error al actualizar en Supabase: ${error.message}`);
    }

    return data as P2POperation;
  } else {
    const ops = getLocalOperations();
    const index = ops.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Operación no encontrada');

    const updatedOp = {
      ...ops[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    ops[index] = updatedOp;
    saveLocalOperations(ops);
    return updatedOp;
  }
}

/**
 * Eliminar una operación
 */
export async function deleteOperation(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('p2p_operations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar operación en Supabase:', error);
      throw new Error(`Error al eliminar en Supabase: ${error.message}`);
    }
  } else {
    const ops = getLocalOperations();
    const filtered = ops.filter((o) => o.id !== id);
    saveLocalOperations(filtered);
  }
}

/**
 * Filtro avanzado en memoria de operaciones
 */
export function filterOperations(
  operations: P2POperation[],
  criteria: FilterCriteria
): P2POperation[] {
  return operations.filter((op) => {
    // 1. Tipo de operación
    if (criteria.operationType !== 'ALL' && op.type !== criteria.operationType) {
      return false;
    }

    // 2. Banco
    if (criteria.bank && criteria.bank !== 'ALL' && op.bank_name !== criteria.bank) {
      return false;
    }

    // 3. Término de búsqueda general (Contraparte, Nickname, Cédula, Referencias, Monto)
    if (criteria.searchTerm.trim()) {
      const term = criteria.searchTerm.toLowerCase().trim();
      const matchName = op.counterparty_name.toLowerCase().includes(term);
      const matchNick = op.counterparty_binance_nick.toLowerCase().includes(term);
      const matchDoc = op.counterparty_id_doc?.toLowerCase().includes(term) ?? false;
      const matchBankRef = op.bank_reference.toLowerCase().includes(term);
      const matchBinanceRef = op.binance_order_id.toLowerCase().includes(term);
      const matchBankName = op.bank_name.toLowerCase().includes(term);
      const matchUsdt = op.amount_usdt.toString().includes(term);
      const matchBs = op.amount_bs.toString().includes(term);

      if (
        !matchName &&
        !matchNick &&
        !matchDoc &&
        !matchBankRef &&
        !matchBinanceRef &&
        !matchBankName &&
        !matchUsdt &&
        !matchBs
      ) {
        return false;
      }
    }

    // 4. Período / Fecha
    const opDate = new Date(op.operation_date);
    const opDateStr = opDate.toISOString().slice(0, 10); // YYYY-MM-DD

    if (criteria.periodType === 'day' && criteria.selectedDate) {
      return opDateStr === criteria.selectedDate;
    }

    if (criteria.periodType === 'week' && criteria.selectedDate) {
      const target = new Date(criteria.selectedDate);
      const startOfWeek = new Date(target);
      const day = target.getDay();
      const diff = target.getDate() - day + (day === 0 ? -6 : 1); // lunes
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return opDate >= startOfWeek && opDate <= endOfWeek;
    }

    if (criteria.periodType === 'month' && criteria.selectedDate) {
      const targetYearMonth = criteria.selectedDate.slice(0, 7); // YYYY-MM
      return opDateStr.startsWith(targetYearMonth);
    }

    if (criteria.periodType === 'custom' && criteria.startDate && criteria.endDate) {
      const start = new Date(criteria.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(criteria.endDate);
      end.setHours(23, 59, 59, 999);
      return opDate >= start && opDate <= end;
    }

    return true;
  });
}

/**
 * Calcular el balance y métricas fiscales del conjunto de operaciones
 */
export function calculateFiscalSummary(
  operations: P2POperation[],
  periodLabel: string = 'Período Seleccionado'
): FiscalSummary {
  let totalUsdtBought = 0;
  let totalUsdtSold = 0;
  let totalBsSpentBuying = 0;
  let totalBsReceivedSelling = 0;
  let buyOperationsCount = 0;
  let sellOperationsCount = 0;

  for (const op of operations) {
    if (op.type === 'COMPRA') {
      totalUsdtBought += Number(op.amount_usdt);
      totalBsSpentBuying += Number(op.amount_bs);
      buyOperationsCount += 1;
    } else if (op.type === 'VENTA') {
      totalUsdtSold += Number(op.amount_usdt);
      totalBsReceivedSelling += Number(op.amount_bs);
      sellOperationsCount += 1;
    }
  }

  const avgBuyRate = totalUsdtBought > 0 ? totalBsSpentBuying / totalUsdtBought : 0;
  const avgSellRate = totalUsdtSold > 0 ? totalBsReceivedSelling / totalUsdtSold : 0;
  const netUsdtFlow = totalUsdtBought - totalUsdtSold;
  const netBsFlow = totalBsReceivedSelling - totalBsSpentBuying;

  return {
    periodLabel,
    totalUsdtBought,
    totalUsdtSold,
    totalBsSpentBuying,
    totalBsReceivedSelling,
    totalOperationsCount: operations.length,
    buyOperationsCount,
    sellOperationsCount,
    avgBuyRate,
    avgSellRate,
    netUsdtFlow,
    netBsFlow,
  };
}

/**
 * Exportar operaciones a CSV compatible con Excel y auditoría fiscal SENIAT/SUDEBAN
 */
export function exportOperationsToCSV(operations: P2POperation[], filename = 'Auditoria_Binance_P2P.csv'): void {
  const headers = [
    'Fecha y Hora',
    'Tipo',
    'Contraparte (Nombre)',
    'Cédula / RIF (SENIAT)',
    'Binance Nickname',
    'Orden Binance ID',
    'Banco / Método',
    'Referencia Bancaria (SUDEBAN)',
    'Monto USDT',
    'Monto Bs.',
    'Tasa (Bs/USDT)',
    'Notas / Concepto',
    'Comprobante Banco URL',
    'Comprobante Binance URL',
  ];

  const rows = operations.map((op) => [
    `"${new Date(op.operation_date).toLocaleString('es-VE')}"`,
    `"${op.type}"`,
    `"${(op.counterparty_name || '').replace(/"/g, '""')}"`,
    `"${(op.counterparty_id_doc || '').replace(/"/g, '""')}"`,
    `"${(op.counterparty_binance_nick || '').replace(/"/g, '""')}"`,
    `"${op.binance_order_id}"`,
    `"${(op.bank_name || '').replace(/"/g, '""')}"`,
    `"${op.bank_reference}"`,
    op.amount_usdt,
    op.amount_bs,
    op.exchange_rate,
    `"${(op.notes || '').replace(/"/g, '""')}"`,
    `"${op.bank_receipt_url || ''}"`,
    `"${op.binance_receipt_url || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
