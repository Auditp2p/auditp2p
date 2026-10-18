'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { P2POperation, P2POperationInput } from '@/types/database';
import {
  fetchOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  filterOperations,
  calculateFiscalSummary,
} from '@/lib/operationsService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { KPICards } from '@/components/KPICards';
import { OperationsTable } from '@/components/OperationsTable';
import { FiscalReports } from '@/components/FiscalReports';
import { OperationFormModal } from '@/components/OperationFormModal';
import { ReceiptViewerModal } from '@/components/ReceiptViewerModal';
import { SqlSetupModal } from '@/components/SqlSetupModal';
import { useToast } from '@/components/Toast';
import {
  ShieldAlert,
  Database,
  ArrowRight,
  RefreshCw,
  Plus,
  Coins,
  Building,
  HelpCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { showToast } = useToast();

  // Navigation and Modal States
  const [activeTab, setActiveTab] = useState<'operations' | 'reports'>('operations');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<P2POperation | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Receipt Viewer State
  const [receiptViewer, setReceiptViewer] = useState<{
    isOpen: boolean;
    url: string | null;
    title: string;
    subtitle?: string;
    metadata?: {
      binanceOrder?: string;
      bankRef?: string;
      counterparty?: string;
      amount?: string;
    };
  }>({
    isOpen: false,
    url: null,
    title: '',
  });

  // Data State
  const [operations, setOperations] = useState<P2POperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States for Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'COMPRA' | 'VENTA'>('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');

  // Load Operations
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOperations();
      setOperations(data);
    } catch (err: unknown) {
      console.error(err);
      showToast('Error cargando operaciones', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Operations filtered for the Operations Table
  const filteredOperations = useMemo(() => {
    return filterOperations(operations, {
      searchTerm,
      operationType: selectedType,
      bank: selectedBank,
      periodType: 'all',
      selectedDate: '',
    });
  }, [operations, searchTerm, selectedType, selectedBank]);

  // General KPI Fiscal Summary
  const globalSummary = useMemo(() => {
    return calculateFiscalSummary(operations, 'Acumulado Histórico');
  }, [operations]);

  // Handle Create or Update
  const handleSaveOperation = async (data: P2POperationInput) => {
    try {
      if (editingOperation) {
        await updateOperation(editingOperation.id, data);
        showToast('Operación actualizada con éxito', 'success');
      } else {
        await createOperation(data);
        showToast('Operación registrada exitosamente', 'success');
      }
      setEditingOperation(null);
      await loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al guardar';
      showToast(msg, 'error');
      throw error;
    }
  };

  // Handle Delete
  const handleDeleteOperation = async (id: string) => {
    try {
      await deleteOperation(id);
      showToast('Operación eliminada del registro', 'success');
      await loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      showToast(msg, 'error');
    }
  };

  // Open Edit Form
  const handleEdit = (op: P2POperation) => {
    setEditingOperation(op);
    setIsFormOpen(true);
  };

  // Open Receipt Fullscreen Viewer
  const handleOpenReceipt = (
    url: string,
    title: string,
    subtitle?: string,
    metadata?: {
      binanceOrder?: string;
      bankRef?: string;
      counterparty?: string;
      amount?: string;
    }
  ) => {
    setReceiptViewer({
      isOpen: true,
      url,
      title,
      subtitle,
      metadata,
    });
  };

  const isSupabaseLive = isSupabaseConfigured();

  return (
    <div className="min-h-screen flex flex-col bg-[#12161C] text-[#EAECEF]">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOperation={() => {
          setEditingOperation(null);
          setIsFormOpen(true);
        }}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* Supabase Notice Banner (If not yet configured) */}
      {!isSupabaseLive && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#181A20] to-binance-yellow/15 border-b border-amber-500/30 px-4 py-2.5 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Modo Demo / Local Storage Activo:</strong> Las operaciones se están guardando localmente en tu navegador.
              </span>
            </div>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-binance-yellow hover:bg-binance-yellowHover text-black font-bold transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              Conectar a Supabase (Ver Script SQL)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards Overview */}
        <section className="no-print">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#848E9C]">
              Resumen Financiero y Métricas Globales
            </h2>
            <button
              onClick={loadData}
              className="text-xs text-[#848E9C] hover:text-white flex items-center gap-1 p-1"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
          <KPICards summary={globalSummary} />
        </section>

        {/* Tab Content: Operations vs Reports */}
        {activeTab === 'operations' ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Registro y Auditoría de Operaciones P2P
                </h2>
                <p className="text-xs text-[#848E9C]">
                  Historial detallado con comprobantes bancarios, números de referencia y datos fiscales
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOperation(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-binance-yellow hover:bg-binance-yellowHover text-black text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Nueva Operación
              </button>
            </div>

            <OperationsTable
              operations={filteredOperations}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedBank={selectedBank}
              onBankChange={setSelectedBank}
              onEdit={handleEdit}
              onDelete={handleDeleteOperation}
              onOpenReceipt={handleOpenReceipt}
            />
          </section>
        ) : (
          <section className="space-y-4">
            <FiscalReports operations={operations} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2B313A] py-6 px-4 bg-[#0B0E11] text-[#848E9C] text-xs text-center no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-binance-yellow flex items-center justify-center text-[10px] text-black font-bold">
              B
            </div>
            <span className="font-semibold text-slate-300">Binance P2P Audit System</span>
            <span>— Preparado para SENIAT & SUDEBAN</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="hover:text-binance-yellow transition-colors flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" /> Esquema SQL Supabase
            </button>
            <span>v1.0.0 Pro</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      {/* 1. Modal de Registro / Edición */}
      <OperationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOperation(null);
        }}
        onSubmit={handleSaveOperation}
        initialData={editingOperation}
      />

      {/* 2. Modal de Visualización de Comprobantes a Tamaño Completo */}
      <ReceiptViewerModal
        isOpen={receiptViewer.isOpen}
        onClose={() =>
          setReceiptViewer((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        imageUrl={receiptViewer.url}
        title={receiptViewer.title}
        subtitle={receiptViewer.subtitle}
        metadata={receiptViewer.metadata}
      />

      {/* 3. Modal de Script SQL para Supabase */}
      <SqlSetupModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </div>
  );
}
