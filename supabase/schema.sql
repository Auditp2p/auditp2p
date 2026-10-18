-- ==============================================================================
-- SCRIPT DE MIGRACIÓN SUPABASE: BINANCE P2P AUDITORÍA FISCAL (SENIAT / SUDEBAN)
-- ==============================================================================
-- Este script crea la tabla de operaciones P2P, los índices optimizados para
-- reportes diarios/mensuales y búsqueda, el trigger de auditoría de fecha,
-- y el bucket de almacenamiento público para los comprobantes (capturas).
-- ==============================================================================

-- 1. Habilitar extensión UUID si no está activa
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

-- Política de acceso abierto (Lectura, Inserción, Actualización, Borrado) con la anon key
-- Ideal para aplicación administrativa interna o de auditoría personal.
DROP POLICY IF EXISTS "Permitir acceso completo a operaciones P2P" ON public.p2p_operations;
CREATE POLICY "Permitir acceso completo a operaciones P2P"
    ON public.p2p_operations
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Configurar Bucket de Almacenamiento en Supabase Storage
-- Nombre del bucket: "p2p-receipts" (comprobantes bancarios y de binance)
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

-- Fin del script SQL
