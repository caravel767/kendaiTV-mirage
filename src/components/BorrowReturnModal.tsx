import React, { useState, useEffect } from 'react';
import { X, LogOut, CheckCircle2, Calendar, User, Clapperboard } from 'lucide-react';
import type { MediaItem, FormatStatus } from '../types/media';

interface BorrowReturnModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, updates: Partial<MediaItem>) => Promise<void>;
}

export const BorrowReturnModal: React.FC<BorrowReturnModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [borrower, setBorrower] = useState('');
  const [project, setProject] = useState('');
  const [returnDueDate, setReturnDueDate] = useState('');
  const [formatStatus, setFormatStatus] = useState<FormatStatus>('needs_check');
  const [contentDescription, setContentDescription] = useState('');
  const [isFormattingOnReturn, setIsFormattingOnReturn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setBorrower(item.borrower || '');
      setProject(item.project || '');
      setReturnDueDate(item.returnDueDate || '');
      setFormatStatus(item.formatStatus || 'needs_check');
      setContentDescription(item.contentDescription || '');
      setIsFormattingOnReturn(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isCurrentlyBorrowed = item.status === 'borrowed';

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower.trim()) {
      alert('借りる部員名を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await onConfirm(item.id, {
        status: 'borrowed',
        borrower: borrower.trim(),
        borrowDate: today,
        returnDueDate: returnDueDate || '',
        project: project.trim(),
        formatStatus: formatStatus,
        contentDescription: contentDescription.trim() || item.contentDescription,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('処理に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updates: Partial<MediaItem> = {
        status: 'available',
        borrower: '',
        borrowDate: '',
        returnDueDate: '',
      };

      if (isFormattingOnReturn) {
        updates.formatStatus = 'can_format';
        updates.contentDescription = '部室に返却済み。フォーマット完了（空き）';
        updates.project = '';
      }

      await onConfirm(item.id, updates);
      onClose();
    } catch (err) {
      console.error(err);
      alert('返却処理に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
              {item.code}
            </span>
            <span className="text-slate-900 dark:text-white font-semibold text-base">
              {isCurrentlyBorrowed ? '機材の返却手続き' : '機材の持ち出し手続き'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 持ち出し中の返却フロー */}
        {isCurrentlyBorrowed ? (
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">現在貸出中</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {item.borrower} さん
              </div>
              {item.project && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  企画: {item.project}
                </div>
              )}
              {item.borrowDate && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  貸出日: {item.borrowDate}
                  {item.returnDueDate ? ` (返却予定: ${item.returnDueDate})` : ''}
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <input
                id="formatReturnCheck"
                type="checkbox"
                checked={isFormattingOnReturn}
                onChange={(e) => setIsFormattingOnReturn(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="formatReturnCheck" className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                <span className="font-semibold block text-emerald-600 dark:text-emerald-400">フォーマットして返却する</span>
                メディア内のデータをすべて消去・初期化して返却する場合はチェックを入れてください。（ステータスが「🟢初期化OK」に更新されます）
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleReturnSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? '処理中...' : '部室に返却完了'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 部室にある時の持ち出しフロー */
          <form onSubmit={handleBorrowSubmit} className="p-5 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>持ち出す部員名（氏名・学年） *</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 山田（2年）、鈴木"
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Clapperboard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>撮影企画・用途</span>
              </label>
              <input
                type="text"
                placeholder="例: 新歓PV撮影、大学祭特番、自主制作短編"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>返却予定日</span>
              </label>
              <input
                type="date"
                value={returnDueDate}
                onChange={(e) => setReturnDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSubmitting ? '処理中...' : '持ち出し登録'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
