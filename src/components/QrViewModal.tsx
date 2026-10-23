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

  if (!isOpen || !item) return null;

  // QRコードに含めるデータ（アプリ内で直リンクできるようにコードまたはID）
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="text-white font-semibold text-base">管理QRコード / ラベル</div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ラベル表示領域（印刷対象） */}
        <div className="p-6 flex flex-col items-center bg-slate-950/60 print:bg-white print:p-0">
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200 text-slate-900 flex flex-col items-center max-w-[260px] w-full print:border-none print:shadow-none">
            <div className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">
              県大TV 機材管理
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {item.code}
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs mb-2">
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="text-xs font-semibold text-slate-800 text-center truncate w-full">
              {item.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {item.type} • {item.capacity} {item.speedClass ? `• ${item.speedClass}` : ''}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            このQRコードをSDカードケースやSSDの裏面に貼付してご活用ください。
          </p>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'コピー完了' : 'コードをコピー'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>印刷 / 保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
