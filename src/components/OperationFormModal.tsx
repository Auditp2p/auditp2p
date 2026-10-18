'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Building2,
  User,
  CreditCard,
  Hash,
  Coins,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { OperationType, P2POperation, P2POperationInput } from '@/types/database';
import { VENEZUELAN_BANKS } from '@/lib/constants';
import { uploadReceiptFile } from '@/lib/supabase';
import { useToast } from './Toast';

interface OperationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: P2POperationInput) => Promise<void>;
  initialData?: P2POperation | null;
}

export const OperationFormModal: React.FC<OperationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [type, setType] = useState<OperationType>('COMPRA');
  const [operationDate, setOperationDate] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [customBank, setCustomBank] = useState<string>('');
  const [counterpartyName, setCounterpartyName] = useState<string>('');
  const [counterpartyIdDoc, setCounterpartyIdDoc] = useState<string>('');
  const [counterpartyBinanceNick, setCounterpartyBinanceNick] = useState<string>('');
  const [binanceOrderId, setBinanceOrderId] = useState<string>('');
  const [bankReference, setBankReference] = useState<string>('');
  const [amountUsdt, setAmountUsdt] = useState<string>('');
  const [amountBs, setAmountBs] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Files & URLs
  const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);
  const [binanceReceiptFile, setBinanceReceiptFile] = useState<File | null>(null);
  const [bankReceiptPreview, setBankReceiptPreview] = useState<string>('');
  const [binanceReceiptPreview, setBinanceReceiptPreview] = useState<string>('');

  // Reset or populate form
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setOperationDate(initialData.operation_date ? initialData.operation_date.slice(0, 16) : '');
      if (VENEZUELAN_BANKS.includes(initialData.bank_name)) {
        setBankName(initialData.bank_name);
        setCustomBank('');
      } else {
        setBankName('Otro Banco / Plataforma');
        setCustomBank(initialData.bank_name);
      }
      setCounterpartyName(initialData.counterparty_name || '');
      setCounterpartyIdDoc(initialData.counterparty_id_doc || '');
      setCounterpartyBinanceNick(initialData.counterparty_binance_nick || '');
      setBinanceOrderId(initialData.binance_order_id || '');
      setBankReference(initialData.bank_reference || '');
      setAmountUsdt(initialData.amount_usdt ? initialData.amount_usdt.toString() : '');
      setAmountBs(initialData.amount_bs ? initialData.amount_bs.toString() : '');
      setExchangeRate(initialData.exchange_rate ? initialData.exchange_rate.toString() : '');
      setNotes(initialData.notes || '');
      setBankReceiptPreview(initialData.bank_receipt_url || '');
      setBinanceReceiptPreview(initialData.binance_receipt_url || '');
    } else {
      // Default new operation
      setType('COMPRA');
      // Format now for datetime-local
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setOperationDate(now.toISOString().slice(0, 16));
      setBankName(VENEZUELAN_BANKS[0]);
      setCustomBank('');
      setCounterpartyName('');
      setCounterpartyIdDoc('');
      setCounterpartyBinanceNick('');
      setBinanceOrderId('');
      setBankReference('');
      setAmountUsdt('');
      setAmountBs('');
      setExchangeRate('');
      setNotes('');
      setBankReceiptFile(null);
      setBinanceReceiptFile(null);
      setBankReceiptPreview('');
      setBinanceReceiptPreview('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Calculadora interactiva automática
  const handleUsdtChange = (val: string) => {
    setAmountUsdt(val);
    const usdt = parseFloat(val);
    const rate = parseFloat(exchangeRate);
    if (!isNaN(usdt) && !isNaN(rate) && rate > 0) {
      setAmountBs((usdt * rate).toFixed(2));
    } else {
      const bs = parseFloat(amountBs);
      if (!isNaN(usdt) && !isNaN(bs) && usdt > 0) {
        setExchangeRate((bs / usdt).toFixed(4));
      }
    }
  };

  const handleBsChange = (val: string) => {
    setAmountBs(val);
    const bs = parseFloat(val);
    const usdt = parseFloat(amountUsdt);
    if (!isNaN(bs) && !isNaN(usdt) && usdt > 0) {
      setExchangeRate((bs / usdt).toFixed(4));
    } else {
      const rate = parseFloat(exchangeRate);
      if (!isNaN(bs) && !isNaN(rate) && rate > 0) {
        setAmountUsdt((bs / rate).toFixed(4));
      }
    }
  };

  const handleRateChange = (val: string) => {
    setExchangeRate(val);
    const rate = parseFloat(val);
    const usdt = parseFloat(amountUsdt);
    if (!isNaN(rate) && !isNaN(usdt) && rate > 0) {
      setAmountBs((usdt * rate).toFixed(2));
    } else {
      const bs = parseFloat(amountBs);
      if (!isNaN(bs) && !isNaN(rate) && rate > 0) {
        setAmountUsdt((bs / rate).toFixed(4));
      }
    }
  };

  // Archivos comprobantes
  const handleBankFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBankReceiptFile(file);
      setBankReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleBinanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBinanceReceiptFile(file);
      setBinanceReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const finalBank = bankName === 'Otro Banco / Plataforma' ? customBank.trim() : bankName;
    if (!finalBank) {
      showToast('Por favor ingresa el nombre de la cuenta o banco', 'error');
      return;
    }

    const numUsdt = parseFloat(amountUsdt);
    const numBs = parseFloat(amountBs);
    const numRate = parseFloat(exchangeRate);

    if (isNaN(numUsdt) || numUsdt <= 0) {
      showToast('Ingresa un monto en USDT válido mayor a 0', 'error');
      return;
    }
    if (isNaN(numBs) || numBs <= 0) {
      showToast('Ingresa un monto en Bs. válido mayor a 0', 'error');
      return;
    }
    if (isNaN(numRate) || numRate <= 0) {
      showToast('Ingresa o calcula una tasa de cambio válida', 'error');
      return;
    }
    if (!counterpartyName.trim()) {
      showToast('El nombre de la contraparte es obligatorio para auditoría', 'error');
      return;
    }
    if (!binanceOrderId.trim()) {
      showToast('El ID de Orden de Binance es requerido', 'error');
      return;
    }
    if (!bankReference.trim()) {
      showToast('El número de referencia bancaria (SUDEBAN) es requerido', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Subida de archivos a Supabase Storage
      let finalBankReceiptUrl = bankReceiptPreview;
      let finalBinanceReceiptUrl = binanceReceiptPreview;

      if (bankReceiptFile) {
        showToast('Subiendo captura del Banco a Supabase...', 'info');
        finalBankReceiptUrl = await uploadReceiptFile(bankReceiptFile, 'banco');
      }

      if (binanceReceiptFile) {
        showToast('Subiendo captura de Binance a Supabase...', 'info');
        finalBinanceReceiptUrl = await uploadReceiptFile(binanceReceiptFile, 'binance');
      }

      const operationPayload: P2POperationInput = {
        type,
        operation_date: new Date(operationDate).toISOString(),
        bank_name: finalBank,
        counterparty_name: counterpartyName.trim(),
        counterparty_id_doc: counterpartyIdDoc.trim() || null,
        counterparty_binance_nick: counterpartyBinanceNick.trim() || 'Desconocido',
        binance_order_id: binanceOrderId.trim(),
        bank_reference: bankReference.trim(),
        amount_usdt: numUsdt,
        amount_bs: numBs,
        exchange_rate: numRate,
        notes: notes.trim() || null,
        bank_receipt_url: finalBankReceiptUrl || null,
        binance_receipt_url: finalBinanceReceiptUrl || null,
      };

      await onSubmit(operationPayload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la operación';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#181A20] border border-[#2B313A] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B313A] bg-[#12161C]/90">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 ${
                type === 'COMPRA'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {type === 'COMPRA' ? (
                <>
                  <ArrowDownLeft className="w-5 h-5" /> COMPRA P2P
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5" /> VENTA P2P
                </>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Editar Operación P2P' : 'Registrar Nueva Operación P2P'}
              </h2>
              <p className="text-xs text-[#848E9C]">
                Soporte y conciliación fiscal (Normativa SENIAT & SUDEBAN)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-rose-500/20 hover:text-rose-400 text-[#848E9C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Selector de Tipo: COMPRA vs VENTA */}
          <div className="grid grid-cols-2 gap-4 p-1.5 bg-[#12161C] rounded-xl border border-[#2B313A]">
            <button
              type="button"
              onClick={() => setType('COMPRA')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                type === 'COMPRA'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              COMPRA (Adquieres USDT / Pagas Bs.)
            </button>
            <button
              type="button"
              onClick={() => setType('VENTA')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                type === 'VENTA'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-[#848E9C] hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              VENTA (Vendes USDT / Recibes Bs.)
            </button>
          </div>

          {/* 2. Bloque Financiero / Calculadora Interactiva */}
          <div className="p-4 bg-[#12161C] rounded-xl border border-[#2B313A] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-binance-yellow uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Montos y Tasa de Cambio (Cálculo Automático)
              </span>
              <span className="text-[11px] text-[#848E9C]">
                Calcula automáticamente al llenar dos campos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Monto USDT */}
              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-binance-yellow" /> Monto en USDT *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.00"
                    value={amountUsdt}
                    onChange={(e) => handleUsdtChange(e.target.value)}
                    required
                    className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white font-mono font-medium focus:outline-none focus:border-binance-yellow focus:ring-1 focus:ring-binance-yellow"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-binance-yellow">
                    USDT
                  </span>
                </div>
              </div>

              {/* Tasa de Cambio */}
              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-sky-400" /> Tasa de Cambio (Bs/USDT) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 950.00"
                    value={exchangeRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    required
                    className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white font-mono font-medium focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#848E9C]">Bs/USDT</span>
                </div>
              </div>

              {/* Monto en Bolívares */}
              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Total en Bolívares (Bs.) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amountBs}
                    onChange={(e) => handleBsChange(e.target.value)}
                    required
                    className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white font-mono font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-emerald-400">
                    Bs.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fechas y Datos Bancarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha y hora */}
            <div>
              <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Fecha y Hora de la Operación *
              </label>
              <input
                type="datetime-local"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                required
                className="w-full bg-[#12161C] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-binance-yellow"
              />
            </div>

            {/* Banco Utilizado */}
            <div>
              <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Cuenta / Banco Utilizado *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#12161C] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-binance-yellow"
              >
                {VENEZUELAN_BANKS.map((b) => (
                  <option key={b} value={b} className="bg-[#181A20] text-white">
                    {b}
                  </option>
                ))}
              </select>

              {bankName === 'Otro Banco / Plataforma' && (
                <input
                  type="text"
                  placeholder="Especificar nombre de banco o billetera"
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  className="mt-2 w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-binance-yellow"
                  required
                />
              )}
            </div>
          </div>

          {/* 4. Contraparte y Cumplimiento Fiscal SENIAT */}
          <div className="p-4 bg-[#12161C] rounded-xl border border-[#2B313A] space-y-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Datos de la Contraparte (Auditoría Fiscal SENIAT)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5">
                  Nombre Completo de la Contraparte *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Vicente Pérez Gómez"
                  value={counterpartyName}
                  onChange={(e) => setCounterpartyName(e.target.value)}
                  required
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-binance-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5">
                  Cédula / RIF de la Contraparte (SENIAT)
                </label>
                <input
                  type="text"
                  placeholder="Ej. V-18928374 / J-40182910-2"
                  value={counterpartyIdDoc}
                  onChange={(e) => setCounterpartyIdDoc(e.target.value)}
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-binance-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#848E9C] mb-1.5">
                  Usuario de Binance (Nickname / ID) *
                </label>
                <input
                  type="text"
                  placeholder="Ej. CryptoTrader_VE"
                  value={counterpartyBinanceNick}
                  onChange={(e) => setCounterpartyBinanceNick(e.target.value)}
                  required
                  className="w-full bg-[#181A20] border border-[#2B313A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-binance-yellow"
                />
              </div>
            </div>
          </div>

          {/* 5. Referencias de Control (Binance Order ID & SUDEBAN Bank Ref) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-binance-yellow" /> N° de Referencia de Binance (Order ID) *
              </label>
              <input
                type="text"
                placeholder="Ej. 2058493820194820"
                value={binanceOrderId}
                onChange={(e) => setBinanceOrderId(e.target.value)}
                required
                className="w-full bg-[#12161C] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-binance-yellow"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-emerald-400" /> N° de Referencia Bancaria (SUDEBAN) *
              </label>
              <input
                type="text"
                placeholder="Ej. 008921849 o últimos 6/8 dígitos"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                required
                className="w-full bg-[#12161C] border border-[#2B313A] rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* 6. Adjuntar Comprobantes (Banco y Binance) */}
          <div className="p-4 bg-[#12161C] rounded-xl border border-[#2B313A] space-y-4">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Comprobantes y Soportes Visuales (Supabase Storage)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Captura Banco */}
              <div className="p-3 bg-[#181A20] rounded-xl border border-[#2B313A] space-y-2">
                <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Captura del Banco (Transferencia/Pago Móvil)
                </label>
                <div className="flex items-center gap-3">
                  {bankReceiptPreview ? (
                    <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#2B313A] bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bankReceiptPreview}
                        alt="Comprobante banco"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBankReceiptFile(null);
                          setBankReceiptPreview('');
                        }}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 text-xs font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#2B313A] flex flex-col items-center justify-center text-[#848E9C]">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#3b434f] text-xs font-medium text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {bankReceiptPreview ? 'Cambiar imagen' : 'Seleccionar archivo'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleBankFileChange}
                      />
                    </label>
                    <p className="text-[11px] text-[#848E9C] mt-1">PNG, JPG, WebP o PDF hasta 10MB</p>
                  </div>
                </div>
              </div>

              {/* Captura Binance */}
              <div className="p-3 bg-[#181A20] rounded-xl border border-[#2B313A] space-y-2">
                <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-binance-yellow" /> Captura de Binance (Orden Completada)
                </label>
                <div className="flex items-center gap-3">
                  {binanceReceiptPreview ? (
                    <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#2B313A] bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={binanceReceiptPreview}
                        alt="Comprobante Binance"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBinanceReceiptFile(null);
                          setBinanceReceiptPreview('');
                        }}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 text-xs font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#2B313A] flex flex-col items-center justify-center text-[#848E9C]">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#3b434f] text-xs font-medium text-white transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {binanceReceiptPreview ? 'Cambiar imagen' : 'Seleccionar archivo'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleBinanceFileChange}
                      />
                    </label>
                    <p className="text-[11px] text-[#848E9C] mt-1">PNG, JPG, WebP o PDF hasta 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Notas u Observaciones */}
          <div>
            <label className="block text-xs font-medium text-[#848E9C] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Notas u Observaciones Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre conciliación bancaria, titularidad de cuenta, verificación telefónica..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#12161C] border border-[#2B313A] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-binance-yellow"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B313A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg border border-[#2B313A] hover:bg-[#2B313A] text-sm text-[#848E9C] hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                type === 'COMPRA'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  {initialData ? 'Actualizar Operación' : 'Registrar Operación'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
