import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Search,
  LogOut,
  RotateCcw,
  Calendar,
  User,
  Clapperboard,
  CheckCircle
} from 'lucide-react';
import type { MediaLog } from '../types/media';

interface HistoryModalProps {
  logs: MediaLog[];
  isOpen: boolean;
  onClose: () => void;
  filterMediaCode?: string | null; // 特定のメディアに絞る場合
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  logs,
  isOpen,
  onClose,
  filterMediaCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'borrow' | 'return'>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 特定の機材指定がある場合
      if (filterMediaCode && log.mediaCode.toUpperCase() !== filterMediaCode.toUpperCase()) {
        return false;
      }

      // アクションフィルター
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false;
      }

      // キーワード検索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = log.mediaCode.toLowerCase().includes(q);
        const matchesName = log.mediaName.toLowerCase().includes(q);
        const matchesBorrower = log.borrower.toLowerCase().includes(q);
        const matchesProject = log.project?.toLowerCase().includes(q);

        if (!matchesCode && !matchesName && !matchesBorrower && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filterMediaCode, actionFilter, searchQuery]);

  if (!isOpen) return null;

  // 日時のフォーマット表示
  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${date} ${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h2 className="text-slate-900 dark:text-white font-bold text-base">
              {filterMediaCode ? `「${filterMediaCode}」の持ち出し履歴` : '機材の持ち出し・返却履歴'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
              {filteredLogs.length}件
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索・フィルターバー */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="部員名、管理コード、企画名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'ALL', label: 'すべて' },
              { id: 'borrow', label: '持ち出しのみ' },
              { id: 'return', label: '返却のみ' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setActionFilter(a.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  actionFilter === a.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* タイムライン一覧 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-medium">履歴がありません</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isBorrow = log.action === 'borrow';

              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    {/* アイコン */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isBorrow
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isBorrow ? (
                        <LogOut className="w-4 h-4" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </div>

                    {/* 詳細内容 */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            isBorrow
                              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {isBorrow ? '持ち出し' : '返却完了'}
                        </span>
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {log.mediaCode}
                        </span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                          {log.mediaName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          {log.borrower}
                        </span>
                        {log.project && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Clapperboard className="w-3.5 h-3.5 text-slate-400" />
                            {log.project}
                          </span>
                        )}
                        {log.returnDueDate && isBorrow && (
                          <span className="text-indigo-600 dark:text-indigo-300">
                            返却予定: {log.returnDueDate}
                          </span>
                        )}
                        {log.formattedOnReturn && !isBorrow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            フォーマット済
                          </span>
                        )}
                      </div>

                      {log.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          メモ: {log.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 記録日時 */}
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 sm:text-right shrink-0 flex items-center sm:block gap-1">
                    <Calendar className="w-3 h-3 sm:hidden" />
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
