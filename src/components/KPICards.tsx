'use client';

import React from 'react';
import { FiscalSummary } from '@/types/database';
import { formatUSDT, formatBs, formatRate } from '@/lib/constants';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Receipt,
  Scale,
} from 'lucide-react';

interface KPICardsProps {
  summary: FiscalSummary;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Compras Totales */}
      <div className="glass-card rounded-2xl p-5 border border-[#2B313A] relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#848E9C]">
            Total Compras USDT
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1">
          {formatUSDT(summary.totalUsdtBought)}
        </div>
        <div className="flex items-center justify-between text-xs text-[#848E9C]">
          <span>Gasto: {formatBs(summary.totalBsSpentBuying)}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
            {summary.buyOperationsCount} ops
          </span>
        </div>
        {summary.totalUsdtBought > 0 && (
          <div className="mt-2 pt-2 border-t border-[#2B313A]/60 text-[11px] text-[#848E9C]">
            Tasa promedio: <span className="text-emerald-400 font-mono font-medium">{formatRate(summary.avgBuyRate)}</span>
          </div>
        )}
      </div>

      {/* 2. Ventas Totales */}
      <div className="glass-card rounded-2xl p-5 border border-[#2B313A] relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#848E9C]">
            Total Ventas USDT
          </span>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1">
          {formatUSDT(summary.totalUsdtSold)}
        </div>
        <div className="flex items-center justify-between text-xs text-[#848E9C]">
          <span>Ingreso: {formatBs(summary.totalBsReceivedSelling)}</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-medium">
            {summary.sellOperationsCount} ops
          </span>
        </div>
        {summary.totalUsdtSold > 0 && (
          <div className="mt-2 pt-2 border-t border-[#2B313A]/60 text-[11px] text-[#848E9C]">
            Tasa promedio: <span className="text-rose-400 font-mono font-medium">{formatRate(summary.avgSellRate)}</span>
          </div>
        )}
      </div>

      {/* 3. Volumen Total en Bolívares */}
      <div className="glass-card rounded-2xl p-5 border border-[#2B313A] relative overflow-hidden group hover:border-binance-yellow/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#848E9C]">
            Volumen Total (Bs.)
          </span>
          <div className="p-2.5 rounded-xl bg-binance-yellow/10 text-binance-yellow">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1">
          {formatBs(summary.totalBsSpentBuying + summary.totalBsReceivedSelling)}
        </div>
        <div className="flex items-center justify-between text-xs text-[#848E9C]">
          <span>Total operaciones registradas:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#2B313A] text-white font-medium">
            {summary.totalOperationsCount}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#2B313A]/60 text-[11px] text-[#848E9C] flex justify-between">
          <span>{summary.periodLabel}</span>
          <span className="text-binance-yellow font-medium">Auditoría Fiscal</span>
        </div>
      </div>

      {/* 4. Flujo Neto / Margen Spread */}
      <div className="glass-card rounded-2xl p-5 border border-[#2B313A] relative overflow-hidden group hover:border-sky-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#848E9C]">
            Balance Neto Operado
          </span>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono mb-1 ${
          summary.netUsdtFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {summary.netUsdtFlow >= 0 ? '+' : ''}{formatUSDT(summary.netUsdtFlow)}
        </div>
        <div className="flex items-center justify-between text-xs text-[#848E9C]">
          <span>Flujo Bs:</span>
          <span className={`font-mono font-medium ${summary.netBsFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {summary.netBsFlow >= 0 ? '+' : ''}{formatBs(summary.netBsFlow)}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#2B313A]/60 text-[11px] text-[#848E9C] flex items-center justify-between">
          <span>Spread / Margen:</span>
          <span className="text-sky-400 font-mono font-medium">
            {summary.avgSellRate > 0 && summary.avgBuyRate > 0
              ? `${(summary.avgSellRate - summary.avgBuyRate).toFixed(2)} Bs/USDT`
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
