'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import { useToast } from './Toast';

interface SqlSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCRIPT = `-- ==============================================================================
-- SCRIPT DE MIGRACIÓN SUPABASE: BINANCE P2P AUDITORÍA FISCAL (SENIAT / SUDEBAN)
-- ==============================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- Crea la tabla p2p_operations, índices, triggers y el bucket de comprobantes.
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla principal: p2p_operations
CREATE TABLE IF NOT EXISTS public.p2p_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('COMPRA', 'VENTA')),
    operation_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    bank_name VARCHAR(150) NOT NULL,
    counterparty_name VARCHAR(255) NOT NULL,
    counterparty_id_doc VARCHAR(50), -- Cédula o RIF para cumplimiento fiscal SENIAT
    counterparty_binance_nick VARCHAR(120) NOT NULL,
    binance_order_id VARCHAR(120) NOT NULL,
    bank_reference VARCHAR(120) NOT NULL,
    amount_usdt NUMERIC(18, 4) NOT NULL CHECK (amount_usdt > 0),
    amount_bs NUMERIC(18, 2) NOT NULL CHECK (amount_bs > 0),
    exchange_rate NUMERIC(18, 4) NOT NULL CHECK (exchange_rate > 0),
    notes TEXT,
    bank_receipt_url TEXT,
    binance_receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Índices para acelerar búsquedas en tiempo real y conciliaciones por fecha
CREATE INDEX IF NOT EXISTS idx_p2p_ops_date ON public.p2p_operations (operation_date DESC);
CREATE INDEX IF NOT EXISTS idx_p2p_ops_type ON public.p2p_operations (type);
CREATE INDEX IF NOT EXISTS idx_p2p_ops_counterparty ON public.p2p_operations (counterparty_name);
CREATE INDEX IF NOT EXISTS idx_p2p_ops_binance_id ON public.p2p_operations (binance_order_id);
CREATE INDEX IF NOT EXISTS idx_p2p_ops_bank_ref ON public.p2p_operations (bank_reference);
CREATE INDEX IF NOT EXISTS idx_p2p_ops_bank_name ON public.p2p_operations (bank_name);

-- 4. Función y Trigger automático para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.p2p_operations;
CREATE TRIGGER trigger_set_updated_at
    BEFORE UPDATE ON public.p2p_operations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Configurar Row Level Security (RLS) en la tabla
ALTER TABLE public.p2p_operations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acceso completo a operaciones P2P" ON public.p2p_operations;
CREATE POLICY "Permitir acceso completo a operaciones P2P"
    ON public.p2p_operations
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Configurar Bucket de Almacenamiento en Supabase Storage
-- Nombre del bucket: "p2p-receipts" (para fotos de banco y binance)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'p2p-receipts',
    'p2p-receipts',
    true,
    10485760, -- 10 MB límite por archivo
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

-- 7. Políticas de Storage para subir y ver comprobantes
DROP POLICY IF EXISTS "Comprobantes publicamente accesibles" ON storage.objects;
CREATE POLICY "Comprobantes publicamente accesibles"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'p2p-receipts');

DROP POLICY IF EXISTS "Permitir subida de comprobantes" ON storage.objects;
CREATE POLICY "Permitir subida de comprobantes"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'p2p-receipts');

DROP POLICY IF EXISTS "Permitir actualizacion de comprobantes" ON storage.objects;
CREATE POLICY "Permitir actualizacion de comprobantes"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'p2p-receipts');

DROP POLICY IF EXISTS "Permitir eliminacion de comprobantes" ON storage.objects;
CREATE POLICY "Permitir eliminacion de comprobantes"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'p2p-receipts');
`;

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    showToast('Script SQL copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#181A20] border border-[#2B313A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B313A] bg-[#12161C]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-binance-yellow/10 text-binance-yellow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Script SQL para Supabase (Tabla & Storage)
              </h2>
              <p className="text-xs text-[#848E9C]">
                Copia y pega este script en el SQL Editor de tu proyecto Supabase
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Instrucciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#12161C] border border-[#2B313A] rounded-xl">
              <span className="w-6 h-6 rounded-full bg-binance-yellow/20 text-binance-yellow text-xs font-bold inline-flex items-center justify-center mb-2">
                1
              </span>
              <h4 className="text-xs font-bold text-white mb-1">Copia el Script</h4>
              <p className="text-[11px] text-[#848E9C]">
                Haz clic en el botón amarillo &quot;Copiar Script SQL&quot; a continuación.
              </p>
            </div>

            <div className="p-3.5 bg-[#12161C] border border-[#2B313A] rounded-xl">
              <span className="w-6 h-6 rounded-full bg-binance-yellow/20 text-binance-yellow text-xs font-bold inline-flex items-center justify-center mb-2">
                2
              </span>
              <h4 className="text-xs font-bold text-white mb-1">Pega en Supabase</h4>
              <p className="text-[11px] text-[#848E9C]">
                Abre tu consola de Supabase, ve a <strong className="text-slate-300">SQL Editor</strong>, pega y presiona <strong className="text-slate-300">Run</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-[#12161C] border border-[#2B313A] rounded-xl">
              <span className="w-6 h-6 rounded-full bg-binance-yellow/20 text-binance-yellow text-xs font-bold inline-flex items-center justify-center mb-2">
                3
              </span>
              <h4 className="text-xs font-bold text-white mb-1">Configura .env.local</h4>
              <p className="text-[11px] text-[#848E9C]">
                En Supabase ve a <strong className="text-slate-300">Project Settings → API</strong> y pega tu URL y Anon Key en <code className="text-binance-yellow">.env.local</code>.
              </p>
            </div>
          </div>

          {/* Banner de Copia */}
          <div className="flex items-center justify-between p-3 bg-binance-yellow/10 border border-binance-yellow/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-binance-yellow" />
              <span className="text-xs font-medium text-binance-yellow">
                Alineado al 100% con la tabla <code>p2p_operations</code> y el bucket <code>p2p-receipts</code>
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-binance-yellow hover:bg-binance-yellowHover text-black text-xs font-bold transition-colors shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copiado con éxito
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Script SQL
                </>
              )}
            </button>
          </div>

          {/* Código SQL Viewer */}
          <div className="relative rounded-xl border border-[#2B313A] bg-[#0E1116] overflow-hidden">
            <div className="px-4 py-2 bg-[#12161C] border-b border-[#2B313A] flex items-center justify-between text-xs text-[#848E9C]">
              <span className="font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> supabase/schema.sql
              </span>
              <span>PostgreSQL / Supabase</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[360px] leading-relaxed">
              <code>{SQL_SCRIPT}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#2B313A] bg-[#12161C] flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1"
          >
            Abrir Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2B313A] hover:bg-[#3b434f] text-xs font-semibold text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
