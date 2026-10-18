export type OperationType = 'COMPRA' | 'VENTA';

export interface P2POperation {
  id: string;
  type: OperationType;
  operation_date: string; // ISO String
  bank_name: string;
  counterparty_name: string;
  counterparty_id_doc?: string | null; // Cédula o RIF (SENIAT)
  counterparty_binance_nick: string;
  binance_order_id: string;
  bank_reference: string;
  amount_usdt: number;
  amount_bs: number;
  exchange_rate: number;
  notes?: string | null;
  bank_receipt_url?: string | null;
  binance_receipt_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type P2POperationInput = Omit<P2POperation, 'id' | 'created_at' | 'updated_at'>;

export interface FiscalSummary {
  periodLabel: string;
  totalUsdtBought: number;
  totalUsdtSold: number;
  totalBsSpentBuying: number;
  totalBsReceivedSelling: number;
  totalOperationsCount: number;
  buyOperationsCount: number;
  sellOperationsCount: number;
  avgBuyRate: number;
  avgSellRate: number;
  netUsdtFlow: number;
  netBsFlow: number;
}

export type PeriodFilterType = 'day' | 'week' | 'month' | 'all' | 'custom';

export interface FilterCriteria {
  searchTerm: string;
  operationType: 'ALL' | 'COMPRA' | 'VENTA';
  bank: string;
  periodType: PeriodFilterType;
  selectedDate: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
}
