'use client';

import React, { useState, useMemo } from 'react';
import { P2POperation, PeriodFilterType } from '@/types/database';
import { calculateFiscalSummary, exportOperationsToCSV, filterOperations } from '@/lib/operationsService';
import { formatUSDT, formatBs, formatRate, formatDateTime, formatDateOnly } from '@/lib/constants';
import {
  Calendar as CalendarIcon,
  Download,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  FileCheck2,
  Building,
  Scale,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from './Toast';

interface FiscalReportsProps {
  operations: P2POperation[];
}

export const FiscalReports: React.FC<FiscalReportsProps> = ({ operations }) => {
  const { showToast } = useToast();

  // Period state
  const [periodType, setPeriodType] = useState<PeriodFilterType>('day');
  // Default to today
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Quick preset handlers
  const setToday = () => {
    setSelectedDate(todayStr);
    setPeriodType('day');
  };

  const setYesterday = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setSelectedDate(y.toISOString().slice(0, 10));
    setPeriodType('day');
  };

  const setThisWeek = () => {
    setSelectedDate(todayStr);
    setPeriodType('week');
  };

  const setThisMonth = () => {
    setSelectedDate(todayStr);
    setPeriodType('month');
  };

  // Filter operations based on the active calendar criteria
  const periodOperations = useMemo(() => {
    return filterOperations(operations, {
      searchTerm: '',
      operationType: 'ALL',
      bank: 'ALL',
      periodType,
      selectedDate,
      startDate,
      endDate,
    });
  }, [operations, periodType, selectedDate, startDate, endDate]);

  // Label generator
  const periodLabel = useMemo(() => {
    if (periodType === 'day') {
      return `Día: ${formatDateOnly(selectedDate)}`;
    }
    if (periodType === 'week') {
      return `Semana del ${formatDateOnly(selectedDate)}`;
    }
    if (periodType === 'month') {
      const parts = selectedDate.split('-');
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `Mes: ${monthNames[monthIdx] || parts[1]} ${parts[0]}`;
    }
    if (periodType === 'custom') {
      return `Rango: ${formatDateOnly(startDate)} al ${formatDateOnly(endDate)}`;
    }
    return 'Todas las operaciones';
  }, [periodType, selectedDate, startDate, endDate]);

  // Fiscal summary calculation
  const summary = useMemo(() => {
    return calculateFiscalSummary(periodOperations, periodLabel);
  }, [periodOperations, periodLabel]);

  // Gross profit/spread estimate in Bs.
  const estimatedSpreadBs = useMemo(() => {
    // Si compró y vendió en el período, calcular spread sobre el volumen coincidente
    const matchedVolume = Math.min(summary.totalUsdtBought, summary.totalUsdtSold);
    if (matchedVolume > 0 && summary.avgSellRate > summary.avgBuyRate) {
      return matchedVolume * (summary.avgSellRate - summary.avgBuyRate);
    }
    return 0;
  }, [summary]);

  const handleExportCSV = () => {
    if (periodOperations.length === 0) {
      showToast('No hay operaciones para exportar en este período', 'error');
      return;
    }
    const cleanLabel = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    exportOperationsToCSV(periodOperations, `Auditoria_SENIAT_Binance_P2P_${cleanLabel}.csv`);
    showToast('Reporte fiscal CSV exportado con éxito', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Selector de Período y Calendario */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2B313A] space-y-4 no-print">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-binance-yellow" />
              Filtrar Auditoría por Calendario
            </h3>
            <p className="text-xs text-[#848E9C]">
              Selecciona un día, semana, mes o rango personalizado para conciliar compras y ventas.
            </p>
          </div>

          {/* Botones de Exportar e Imprimir */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs font-semibold text-white transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Exportar a Excel / CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-binance-yellow hover:bg-binance-yellowHover text-black text-xs font-bold transition-colors shadow-lg shadow-binance-yellow/20"
            >
              <Printer className="w-4 h-4" />
              Imprimir Libro Fiscal (PDF)
            </button>
          </div>
        </div>

        {/* Botones de Intervalo Rápido & Selectores de Fecha */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Tabs de tipo de período */}
          <div className="flex bg-[#12161C] p-1 rounded-xl border border-[#2B313A]">
            <button
              onClick={() => setPeriodType('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodType === 'day'
                  ? 'bg-binance-yellow text-black font-bold'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Día Específico
            </button>
            <button
              onClick={() => setPeriodType('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodType === 'week'
                  ? 'bg-binance-yellow text-black font-bold'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodType === 'month'
                  ? 'bg-binance-yellow text-black font-bold'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Mes Completo
            </button>
            <button
              onClick={() => setPeriodType('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodType === 'custom'
                  ? 'bg-binance-yellow text-black font-bold'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Rango Personalizado
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={setToday}
              className="px-2.5 py-1.5 rounded-lg bg-[#12161C] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-white"
            >
              Hoy
            </button>
            <button
              onClick={setYesterday}
              className="px-2.5 py-1.5 rounded-lg bg-[#12161C] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-white"
            >
              Ayer
            </button>
            <button
              onClick={setThisWeek}
              className="px-2.5 py-1.5 rounded-lg bg-[#12161C] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-white"
            >
              Esta Semana
            </button>
            <button
              onClick={setThisMonth}
              className="px-2.5 py-1.5 rounded-lg bg-[#12161C] hover:bg-[#2B313A] border border-[#2B313A] text-[#848E9C] hover:text-white"
            >
              Este Mes
            </button>
          </div>

          {/* Inputs de Calendario HTML5 */}
          <div className="flex items-center gap-2">
            {periodType === 'custom' ? (
              <div className="flex items-center gap-2 bg-[#12161C] border border-[#2B313A] rounded-xl px-3 py-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                />
                <span className="text-[#848E9C] text-xs">hasta</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            ) : periodType === 'month' ? (
              <input
                type="month"
                value={selectedDate.slice(0, 7)}
                onChange={(e) => setSelectedDate(e.target.value + '-01')}
                className="bg-[#12161C] border border-[#2B313A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-binance-yellow"
              />
            ) : (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#12161C] border border-[#2B313A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-binance-yellow"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. Header para Impresión Oficial SENIAT / SUDEBAN */}
      <div className="hidden print-only mb-6 border-b-2 border-black pb-4 text-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              LIBRO DE AUDITORÍA Y CONTROL FISCAL DE OPERACIONES P2P
            </h1>
            <p className="text-sm">
              Conforme a directrices de SENIAT y SUDEBAN para conciliación en moneda nacional y criptoactivos
            </p>
            <p className="text-xs mt-1">
              <strong>Período evaluado:</strong> {periodLabel}
            </p>
          </div>
          <div className="text-right text-xs">
            <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleString('es-VE')}</p>
            <p><strong>Operaciones Registradas:</strong> {summary.totalOperationsCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Resumen y Recuento Totalizado del Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Compras */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" /> TOTAL COMPRAS
            </span>
            <span>{summary.buyOperationsCount} transacciones</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatUSDT(summary.totalUsdtBought)}
          </div>
          <div className="text-xs text-[#848E9C]">
            Total Bs. Pagados: <strong className="text-white font-mono">{formatBs(summary.totalBsSpentBuying)}</strong>
          </div>
          <div className="text-[11px] text-[#848E9C]">
            Tasa Ponderada Compra: <span className="text-emerald-400 font-mono">{formatRate(summary.avgBuyRate)}</span>
          </div>
        </div>

        {/* Total Ventas */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> TOTAL VENTAS
            </span>
            <span>{summary.sellOperationsCount} transacciones</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatUSDT(summary.totalUsdtSold)}
          </div>
          <div className="text-xs text-[#848E9C]">
            Total Bs. Recibidos: <strong className="text-white font-mono">{formatBs(summary.totalBsReceivedSelling)}</strong>
          </div>
          <div className="text-[11px] text-[#848E9C]">
            Tasa Ponderada Venta: <span className="text-rose-400 font-mono">{formatRate(summary.avgSellRate)}</span>
          </div>
        </div>

        {/* Volumen Total Operado */}
        <div className="glass-card rounded-2xl p-5 border border-[#2B313A] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-binance-yellow">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> VOLUMEN TOTAL (BS.)
            </span>
            <span>{summary.totalOperationsCount} ops</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatBs(summary.totalBsSpentBuying + summary.totalBsReceivedSelling)}
          </div>
          <div className="text-xs text-[#848E9C]">
            Total USDT Operado: <strong className="text-white font-mono">{formatUSDT(summary.totalUsdtBought + summary.totalUsdtSold)}</strong>
          </div>
          <div className="text-[11px] text-[#848E9C]">
            Período: <span className="text-slate-300">{periodLabel}</span>
          </div>
        </div>

        {/* Balance Neto y Rendimiento */}
        <div className="glass-card rounded-2xl p-5 border border-sky-500/30 bg-sky-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-400">
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4" /> BALANCE NETO FLUJO
            </span>
            <span>{summary.netUsdtFlow >= 0 ? 'Entrada Neta' : 'Salida Neta'}</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${summary.netUsdtFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {summary.netUsdtFlow >= 0 ? '+' : ''}{formatUSDT(summary.netUsdtFlow)}
          </div>
          <div className="text-xs text-[#848E9C]">
            Flujo Neto Bs.: <span className={`font-mono font-medium ${summary.netBsFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.netBsFlow >= 0 ? '+' : ''}{formatBs(summary.netBsFlow)}
            </span>
          </div>
          {estimatedSpreadBs > 0 && (
            <div className="text-[11px] text-sky-300">
              Margen de intermediación est.: <span className="font-mono font-bold">{formatBs(estimatedSpreadBs)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Tabla de Conciliación y Libro Diario de Operaciones */}
      <div className="glass-panel rounded-2xl border border-[#2B313A] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#2B313A] bg-[#12161C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-binance-yellow" />
            <h4 className="text-sm font-bold text-white">
              Libro Diario de Transacciones ({periodLabel})
            </h4>
          </div>
          <span className="text-xs text-[#848E9C]">
            {periodOperations.length} transacciones registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12161C] border-b border-[#2B313A] uppercase font-semibold text-[#848E9C]">
              <tr>
                <th className="py-3 px-3">Hora / Fecha</th>
                <th className="py-3 px-3">Operación</th>
                <th className="py-3 px-3">Contraparte</th>
                <th className="py-3 px-3">Cédula / RIF</th>
                <th className="py-3 px-3">Banco / Método</th>
                <th className="py-3 px-3">Ref. Bancaria (SUDEBAN)</th>
                <th className="py-3 px-3">Orden Binance</th>
                <th className="py-3 px-3 text-right">Monto USDT</th>
                <th className="py-3 px-3 text-right">Tasa (Bs/USDT)</th>
                <th className="py-3 px-3 text-right">Monto Bs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313A]/50">
              {periodOperations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#848E9C]">
                    No se registraron operaciones para {periodLabel}.
                  </td>
                </tr>
              ) : (
                periodOperations.map((op) => (
                  <tr key={op.id} className="hover:bg-[#1E2329]/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatDateTime(op.operation_date)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                          op.type === 'COMPRA'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {op.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      {op.counterparty_name}
                      <span className="block text-[10px] text-[#848E9C]">@{op.counterparty_binance_nick}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-binance-yellow">
                      {op.counterparty_id_doc || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {op.bank_name}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">
                      {op.bank_reference}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {op.binance_order_id}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {formatUSDT(op.amount_usdt)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {formatRate(op.exchange_rate)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatBs(op.amount_bs)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {periodOperations.length > 0 && (
              <tfoot className="bg-[#12161C] border-t-2 border-[#2B313A] font-bold text-xs">
                <tr>
                  <td colSpan={7} className="py-3 px-3 text-right text-white">
                    TOTALES CONCILIADOS DEL PERÍODO:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-white">
                    {formatUSDT(summary.totalUsdtBought + summary.totalUsdtSold)}
                  </td>
                  <td className="py-3 px-3 text-right text-[#848E9C]">-</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatBs(summary.totalBsSpentBuying + summary.totalBsReceivedSelling)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
