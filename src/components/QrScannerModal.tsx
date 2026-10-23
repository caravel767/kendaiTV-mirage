import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'kendaitv-qr-reader';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setErrorMsg(null);
    setIsStarting(true);

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          () => {}
        );

        if (isMounted) {
          setIsStarting(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Camera start error:', err);
          setErrorMsg(
            'カメラを起動できませんでした。ブラウザのカメラ権限が許可されているかご確認ください。（PCや非HTTPS環境ではカメラがブロックされる場合があります）'
          );
          setIsStarting(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.warn('Failed to stop scanner', e));
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-lg">
            <Camera className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>QRコードをスキャン</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* スキャン画面 */}
        <div className="p-4 flex flex-col items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
            SDカードやSSDの管理QRコードを枠内に収めてください
          </p>

          <div className="relative w-full max-w-[280px] h-[280px] bg-slate-950 rounded-xl overflow-hidden border-2 border-indigo-500/40 flex items-center justify-center">
            <div id={readerElementId} className="w-full h-full" />

            {isStarting && !errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs">カメラを起動中...</span>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-slate-950/95 text-center text-red-400">
                <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
                <p className="text-xs">{errorMsg}</p>
              </div>
            )}
          </div>

          <div className="mt-4 w-full text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
