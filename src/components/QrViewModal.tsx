import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Copy, Check } from 'lucide-react';
import type { MediaItem } from '../types/media';

interface QrViewModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrViewModal: React.FC<QrViewModalProps> = ({ item, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const isMiku = typeof document !== 'undefined' && document.documentElement.classList.contains('miku-theme');

  if (!isOpen || !item) return null;

  const qrValue = `kendaitv:${item.code}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="text-slate-900 dark:text-white font-semibold text-base">管理QRコード / ラベル</div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ラベル表示領域（印刷対象） */}
        <div className="p-6 flex flex-col items-center bg-slate-100 dark:bg-slate-950/60 print:bg-white print:p-0">
          <div
            className={`bg-white p-5 rounded-2xl shadow-md border text-slate-900 flex flex-col items-center max-w-[260px] w-full print:border-none print:shadow-none relative overflow-hidden ${
              isMiku ? 'border-[#39C5BB] ring-1 ring-[#39C5BB]/40' : 'border-slate-200'
            }`}
          >
            {/* 腰ベルトのアクセントライン（Mモード時） */}
            {isMiku && <div className="miku-belt-ribbon miku-belt-ribbon--thin w-full absolute top-0 left-0 right-0" />}

            <div className="flex items-center justify-between w-full mb-1">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                {isMiku ? 'MIRAGE • #39 MIKU' : 'MIRAGE • 県大TV'}
              </div>
              {isMiku && (
                <span className="miku-tattoo-badge text-[9px] px-1 py-0 rounded-xs font-black">
                  01
                </span>
              )}
            </div>

            <div className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {item.code}
            </div>

            <div
              className={`bg-white p-2 rounded-xl border shadow-2xs mb-2 ${
                isMiku ? 'border-[#39C5BB]/40' : 'border-slate-100'
              }`}
            >
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="M"
                includeMargin={false}
                fgColor={isMiku ? '#0f766e' : '#000000'}
              />
            </div>

            <div className="text-xs font-semibold text-slate-800 text-center truncate w-full">
              {item.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {item.type} • {item.capacity} {item.speedClass ? `• ${item.speedClass}` : ''}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
            このQRコードをSDカードケースやSSDの裏面に貼付してご活用ください。
          </p>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex gap-2">
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'コピー完了' : 'コードをコピー'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>印刷 / 保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
