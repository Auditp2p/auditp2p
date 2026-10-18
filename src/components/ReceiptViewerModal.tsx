'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  metadata?: {
    binanceOrder?: string;
    bankRef?: string;
    counterparty?: string;
    amount?: string;
  };
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  metadata,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md transition-opacity">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col w-full max-w-5xl h-[90vh] bg-[#181A20] border border-[#2B313A] rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B313A] bg-[#12161C]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-binance-yellow/10 text-binance-yellow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#848E9C]">{subtitle}</p>}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              title="Alejar"
              className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-[#2B313A] text-[#848E9C] hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#848E9C] px-1 font-mono">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              title="Acercar"
              className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-[#2B313A] text-[#848E9C] hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Girar 90°"
              className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-[#2B313A] text-[#848E9C] hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#2B313A]/50 hover:bg-[#2B313A] text-[#848E9C] hover:text-white transition-colors"
            >
              Reset
            </button>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="comprobante_binance_p2p"
              title="Descargar comprobante"
              className="p-2 rounded-lg bg-binance-yellow/10 hover:bg-binance-yellow/20 text-binance-yellow transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en pestaña nueva"
              className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-[#2B313A] text-[#848E9C] hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="h-6 w-px bg-[#2B313A] mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#2B313A]/50 hover:bg-rose-500/20 hover:text-rose-400 text-[#848E9C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Image Viewer */}
        <div className="relative flex-1 bg-[#0B0E11] overflow-auto flex items-center justify-center p-4">
          <div
            className="transition-transform duration-200 ease-out origin-center select-none"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Comprobante P2P"
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-[#2B313A]"
            />
          </div>
        </div>

        {/* Modal Footer with Fiscal & Operation Audit Metadata */}
        {metadata && (
          <div className="px-6 py-3 bg-[#181A20] border-t border-[#2B313A] flex flex-wrap items-center justify-between text-xs text-[#848E9C] gap-3">
            <div className="flex flex-wrap gap-4">
              {metadata.counterparty && (
                <div>
                  <span className="text-[#848E9C]">Contraparte: </span>
                  <span className="text-white font-medium">{metadata.counterparty}</span>
                </div>
              )}
              {metadata.binanceOrder && (
                <div>
                  <span className="text-[#848E9C]">Orden Binance: </span>
                  <span className="text-binance-yellow font-mono">{metadata.binanceOrder}</span>
                </div>
              )}
              {metadata.bankRef && (
                <div>
                  <span className="text-[#848E9C]">Ref. Banco: </span>
                  <span className="text-emerald-400 font-mono">{metadata.bankRef}</span>
                </div>
              )}
            </div>
            {metadata.amount && (
              <div className="text-right">
                <span className="text-[#848E9C]">Monto Operado: </span>
                <span className="text-white font-semibold">{metadata.amount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
