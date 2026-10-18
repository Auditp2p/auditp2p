'use client';

import React, { useState } from 'react';
import { P2POperation } from '@/types/database';
import { formatUSDT, formatBs, formatRate, formatDateTime, VENEZUELAN_BANKS } from '@/lib/constants';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Trash2,
  Edit,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Receipt,
  User,
} from 'lucide-react';
import { useToast } from './Toast';

interface OperationsTableProps {
  operations: P2POperation[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedType: 'ALL' | 'COMPRA' | 'VENTA';
  onTypeChange: (val: 'ALL' | 'COMPRA' | 'VENTA') => void;
  selectedBank: string;
  onBankChange: (val: string) => void;
  onEdit: (op: P2POperation) => void;
  onDelete: (id: string) => void;
  onOpenReceipt: (
    url: string,
    title: string,
    subtitle?: string,
    metadata?: {
      binanceOrder?: string;
      bankRef?: string;
      counterparty?: string;
      amount?: string;
    }
  ) => void;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({
  operations,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedBank,
  onBankChange,
  onEdit,
  onDelete,
  onOpenReceipt,
}) => {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [opToDelete, setOpToDelete] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`${label} copiada al portapapeles`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#2B313A] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Real-time search bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#848E9C]" />
          <input
            type="text"
            placeholder="Buscar por contraparte, cédula/RIF, monto, referencia bancaria o ID de Binance..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#12161C] border border-[#2B313A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#848E9C] focus:outline-none focus:border-binance-yellow focus:ring-1 focus:ring-binance-yellow transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 text-xs text-[#848E9C] hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter Badges: Type & Bank */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Toggle */}
          <div className="flex bg-[#12161C] p-1 rounded-xl border border-[#2B313A]">
            <button
              onClick={() => onTypeChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-binance-yellow text-black font-bold'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onTypeChange('COMPRA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedType === 'COMPRA'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-[#848E9C] hover:text-emerald-400'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" /> Compras
            </button>
            <button
              onClick={() => onTypeChange('VENTA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedType === 'VENTA'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-[#848E9C] hover:text-rose-400'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" /> Ventas
            </button>
          </div>

          {/* Bank Select */}
          <div className="relative">
            <select
              value={selectedBank}
              onChange={(e) => onBankChange(e.target.value)}
              className="bg-[#12161C] border border-[#2B313A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-binance-yellow cursor-pointer"
            >
              <option value="ALL">Todos los Bancos</option>
              {VENEZUELAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel rounded-2xl border border-[#2B313A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#12161C] border-b border-[#2B313A] text-xs uppercase font-semibold text-[#848E9C]">
              <tr>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Contraparte (Fiscal)</th>
                <th className="py-3.5 px-4">Banco & Referencias</th>
                <th className="py-3.5 px-4">Monto USDT</th>
                <th className="py-3.5 px-4">Monto Bs. & Tasa</th>
                <th className="py-3.5 px-4 text-center">Comprobantes</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]/50">
              {operations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#848E9C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-[#848E9C]/60" />
                      <p className="text-base font-semibold text-white">No se encontraron operaciones</p>
                      <p className="text-xs">
                        Intenta ajustar los filtros de búsqueda o registra una nueva operación P2P.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-[#1E2329]/50 transition-colors duration-150 group"
                  >
                    {/* Tipo: COMPRA / VENTA Badge */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          op.type === 'COMPRA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {op.type === 'COMPRA' ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5" /> COMPRA
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> VENTA
                          </>
                        )}
                      </span>
                    </td>

                    {/* Fecha y hora */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-medium text-white text-xs">
                        {formatDateTime(op.operation_date)}
                      </div>
                      <div className="text-[11px] text-[#848E9C]">
                        {new Date(op.operation_date).toLocaleDateString('es-VE', { weekday: 'short' })}
                      </div>
                    </td>

                    {/* Contraparte Fiscal (Nombre, Cédula/RIF, Nick) */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#848E9C]" />
                        <span>{op.counterparty_name}</span>
                      </div>
                      {op.counterparty_id_doc && (
                        <div className="text-xs text-binance-yellow font-mono">
                          Doc: {op.counterparty_id_doc}
                        </div>
                      )}
                      <div className="text-[11px] text-[#848E9C]">
                        Binance: <span className="text-slate-300">@{op.counterparty_binance_nick}</span>
                      </div>
                    </td>

                    {/* Banco y Referencias (Copiar al hacer clic) */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-xs font-medium text-white flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="truncate max-w-[160px]" title={op.bank_name}>
                          {op.bank_name}
                        </span>
                      </div>

                      {/* Ref Banco */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-[#848E9C]">Ref Banco:</span>
                        <button
                          onClick={() => copyToClipboard(op.bank_reference, 'Referencia bancaria')}
                          className="font-mono text-xs text-emerald-400 hover:underline flex items-center gap-1"
                          title="Copiar referencia de banco"
                        >
                          {op.bank_reference}
                          {copiedId === op.bank_reference ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-60" />
                          )}
                        </button>
                      </div>

                      {/* Binance Order ID */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#848E9C]">Orden ID:</span>
                        <button
                          onClick={() => copyToClipboard(op.binance_order_id, 'ID de Orden')}
                          className="font-mono text-xs text-binance-yellow hover:underline flex items-center gap-1"
                          title="Copiar ID de Binance"
                        >
                          {op.binance_order_id.slice(0, 8)}...{op.binance_order_id.slice(-4)}
                          {copiedId === op.binance_order_id ? (
                            <Check className="w-3 h-3 text-binance-yellow" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-60" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Monto USDT */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-bold text-white text-base">
                        {formatUSDT(op.amount_usdt)}
                      </div>
                    </td>

                    {/* Monto Bs. y Tasa */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {formatBs(op.amount_bs)}
                      </div>
                      <div className="text-xs text-[#848E9C] font-mono">
                        Tasa: {formatRate(op.exchange_rate)}
                      </div>
                    </td>

                    {/* Miniaturas de Comprobantes (Clic abre modal) */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Captura Banco */}
                        {op.bank_receipt_url ? (
                          <button
                            onClick={() =>
                              onOpenReceipt(
                                op.bank_receipt_url!,
                                `Comprobante Banco - ${op.bank_name}`,
                                `Ref: ${op.bank_reference} | Fecha: ${formatDateTime(op.operation_date)}`,
                                {
                                  binanceOrder: op.binance_order_id,
                                  bankRef: op.bank_reference,
                                  counterparty: op.counterparty_name,
                                  amount: `${formatUSDT(op.amount_usdt)} / ${formatBs(op.amount_bs)}`,
                                }
                              )
                            }
                            className="relative group/thumb w-10 h-10 rounded-lg overflow-hidden border border-[#2B313A] hover:border-emerald-500 transition-all shadow-sm"
                            title="Ver captura del Banco"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={op.bank_receipt_url}
                              alt="Comprobante banco"
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-[8px] font-bold text-emerald-200 uppercase tracking-tighter">
                              Banco
                            </span>
                          </button>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg border border-dashed border-[#2B313A] flex items-center justify-center text-[#848E9C]/40 text-[9px]"
                            title="Sin comprobante de banco"
                          >
                            N/A
                          </div>
                        )}

                        {/* Captura Binance */}
                        {op.binance_receipt_url ? (
                          <button
                            onClick={() =>
                              onOpenReceipt(
                                op.binance_receipt_url!,
                                `Comprobante Binance - Orden P2P`,
                                `Orden ID: ${op.binance_order_id} | Contraparte: @${op.counterparty_binance_nick}`,
                                {
                                  binanceOrder: op.binance_order_id,
                                  bankRef: op.bank_reference,
                                  counterparty: op.counterparty_name,
                                  amount: `${formatUSDT(op.amount_usdt)} / ${formatBs(op.amount_bs)}`,
                                }
                              )
                            }
                            className="relative group/thumb w-10 h-10 rounded-lg overflow-hidden border border-[#2B313A] hover:border-binance-yellow transition-all shadow-sm"
                            title="Ver captura de Binance"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={op.binance_receipt_url}
                              alt="Comprobante Binance"
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-binance-yellow/90 text-[8px] font-bold text-black uppercase tracking-tighter">
                              Binance
                            </span>
                          </button>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg border border-dashed border-[#2B313A] flex items-center justify-center text-[#848E9C]/40 text-[9px]"
                            title="Sin comprobante de Binance"
                          >
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(op)}
                          className="p-1.5 rounded-lg bg-[#2B313A]/50 hover:bg-binance-yellow/20 hover:text-binance-yellow text-[#848E9C] transition-colors"
                          title="Editar operación"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setOpToDelete(op.id)}
                          className="p-1.5 rounded-lg bg-[#2B313A]/50 hover:bg-rose-500/20 hover:text-rose-400 text-[#848E9C] transition-colors"
                          title="Eliminar operación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      {opToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#181A20] border border-[#2B313A] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">¿Eliminar Operación?</h3>
            </div>
            <p className="text-sm text-[#848E9C]">
              Esta acción eliminará el registro de la operación P2P de la base de datos de auditoría.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOpToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#2B313A] text-sm text-[#848E9C] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(opToDelete);
                  setOpToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white shadow-lg shadow-rose-500/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
