import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  User,
  Calendar,
  QrCode,
  Edit,
  FileText,
  LogOut,
  RotateCcw,
  Tag,
  History
} from 'lucide-react';
import type { MediaItem, MediaType, FormatStatus } from '../types/media';

interface MediaCardProps {
  item: MediaItem;
  onOpenBorrowReturn: (item: MediaItem) => void;
  onOpenContentEdit: (item: MediaItem) => void;
  onOpenQrView: (item: MediaItem) => void;
  onOpenEdit: (item: MediaItem) => void;
  onOpenHistory: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpenBorrowReturn,
  onOpenContentEdit,
  onOpenQrView,
  onOpenEdit,
  onOpenHistory,
}) => {
  // メディアアイコン
  const getTypeBadge = (type: MediaType) => {
    switch (type) {
      case 'SD':
      case 'MicroSD':
      case 'CFexpress':
        return { label: type, color: 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30' };
      case 'SSD':
        return { label: 'SSD', color: 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30' };
      case 'HDD':
        return { label: 'HDD', color: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30' };
      case 'USB':
        return { label: 'USB', color: 'bg-teal-500/10 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20 dark:border-teal-500/30' };
      default:
        return { label: type, color: 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20 dark:border-slate-500/30' };
    }
  };

  // 初期化ステータスバッジ
  const getFormatBadge = (status: FormatStatus) => {
    switch (status) {
      case 'can_format':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>初期化OK</span>
          </span>
        );
      case 'needs_check':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>要確認</span>
          </span>
        );
      case 'do_not_format':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>消去厳禁</span>
          </span>
        );
    }
  };

  const isBorrowed = item.status === 'borrowed';
  const typeBadge = getTypeBadge(item.type);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
        isBorrowed
          ? 'border-indigo-400 dark:border-indigo-500/40 hover:border-indigo-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* カード上部：管理コード・種別・持ち出しステータス */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black font-mono tracking-wide px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs">
              {item.code}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${typeBadge.color}`}
            >
              {typeBadge.label}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {item.capacity}
            </span>
            {item.speedClass && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded">
                {item.speedClass}
              </span>
            )}
          </div>

          {/* 初期化ステータス */}
          <div>{getFormatBadge(item.formatStatus)}</div>
        </div>

        {/* メディア名 */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate">
            {item.name}
          </h3>
          {item.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {item.notes}
            </p>
          )}
        </div>

        {/* 持ち出し状態の可視化 */}
        <div
          className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
            isBorrowed
              ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
              : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBorrowed ? 'bg-indigo-600 dark:bg-indigo-400 animate-ping' : 'bg-emerald-600 dark:bg-emerald-400'
                }`}
              />
              {isBorrowed ? '貸出中' : '部室に保管中'}
            </span>
            {isBorrowed && item.borrower && (
              <span className="font-bold text-indigo-800 dark:text-white flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-transparent">
                <User className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
                {item.borrower}
              </span>
            )}
          </div>

          {isBorrowed && (
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-indigo-100 dark:border-indigo-500/20">
              {item.project && (
                <span className="font-medium truncate max-w-[180px]">
                  企画: {item.project}
                </span>
              )}
              {item.returnDueDate && (
                <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  返却予定: {item.returnDueDate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 保存データの内容（文字入力された詳細） */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              保存データの内容
            </span>
            <button
              onClick={() => onOpenContentEdit(item)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              更新
            </button>
          </div>
          <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono line-clamp-3 bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800/50">
            {item.contentDescription || '（保存データ情報なし）'}
          </div>
        </div>

        {/* タグ一覧 */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* カードフッター（アクションボタン郡） */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenQrView(item)}
            title="QRコード・ラベル表示"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent transition shadow-2xs"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenEdit(item)}
            title="メディア設定編集"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent transition shadow-2xs"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenHistory(item)}
            title="この機材の持ち出し履歴"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent transition shadow-2xs"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* 持ち出し / 返却 メインボタンスイッチ */}
        <button
          onClick={() => onOpenBorrowReturn(item)}
          className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-bold transition shadow-xs ${
            isBorrowed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isBorrowed ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>返却する</span>
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5" />
              <span>持ち出す</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
