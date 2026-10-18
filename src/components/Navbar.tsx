'use client';

import React from 'react';
import {
  Plus,
  Database,
  BarChart3,
  ListOrdered,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  activeTab: 'operations' | 'reports';
  setActiveTab: (tab: 'operations' | 'reports') => void;
  onOpenNewOperation: () => void;
  onOpenSqlModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOperation,
  onOpenSqlModal,
}) => {
  const isConnected = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#2B313A] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {/* Binance Style Logo */}
            <div className="w-9 h-9 rounded-xl bg-binance-yellow flex items-center justify-center shadow-lg shadow-binance-yellow/20">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-black font-bold"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5l5.5 3.4v7.2L12 18.5 6.5 15.1V7.9L12 4.5zM12 8l-3 3 3 3 3-3-3-3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Binance <span className="text-binance-yellow">P2P</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Audit Pro
                </span>
              </div>
              <p className="text-[10px] text-[#848E9C] hidden sm:block">
                Control Fiscal SENIAT & Conciliación SUDEBAN
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-6 bg-[#12161C] p-1 rounded-xl border border-[#2B313A]">
            <button
              onClick={() => setActiveTab('operations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'operations'
                  ? 'bg-[#1E2329] text-white shadow-sm'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-binance-yellow" />
              Operaciones & Búsqueda
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-[#1E2329] text-white shadow-sm'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              Reportes & Calendario
            </button>
          </nav>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-3">
          {/* Supabase Connection Status Badge */}
          <button
            onClick={onOpenSqlModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
            title={
              isConnected
                ? 'Supabase conectado activamente'
                : 'Operando en almacenamiento local. Clic para ver configuración SQL de Supabase'
            }
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Supabase Conectado</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>Modo Local / Demo</span>
              </>
            )}
          </button>

          {/* Script SQL Button */}
          <button
            onClick={onOpenSqlModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E2329] hover:bg-[#2B313A] border border-[#2B313A] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Ver Script SQL para Supabase"
          >
            <Database className="w-3.5 h-3.5 text-binance-yellow" />
            <span className="hidden sm:inline">Script SQL</span>
          </button>

          {/* New Operation Primary CTA Button */}
          <button
            onClick={onOpenNewOperation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-binance-yellow hover:bg-binance-yellowHover text-black text-xs font-bold transition-all shadow-lg shadow-binance-yellow/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Operación</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu Tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-[#2B313A] bg-[#12161C] px-2 py-1.5">
        <button
          onClick={() => setActiveTab('operations')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeTab === 'operations' ? 'bg-[#1E2329] text-binance-yellow' : 'text-[#848E9C]'
          }`}
        >
          Operaciones
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeTab === 'reports' ? 'bg-[#1E2329] text-emerald-400' : 'text-[#848E9C]'
          }`}
        >
          Reportes & Calendario
        </button>
      </div>
    </header>
  );
};
