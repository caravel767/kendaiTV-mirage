import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import type { MediaItem, FormatStatus } from '../types/media';

interface ContentEditModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MediaItem>) => Promise<void>;
}

export const ContentEditModal: React.FC<ContentEditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [contentDescription, setContentDescription] = useState('');
  const [formatStatus, setFormatStatus] = useState<FormatStatus>('can_format');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setContentDescription(item.contentDescription || '');
      setFormatStatus(item.formatStatus || 'can_format');
      setProject(item.project || '');
      setNotes(item.notes || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(item.id, {
        contentDescription,
        formatStatus,
        project,
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const setFormatOkTemplate = () => {
    setFormatStatus('can_format');
    setContentDescription('フォーマット済み。空き状態です。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 mr-2">
              {item.code}
            </span>
            <span className="text-slate-900 dark:text-white font-semibold text-base">保存データの更新</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* 初期化可否ステータス */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              データ初期化ステータス
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormatStatus('can_format')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  formatStatus === 'can_format'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <CheckCircle className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">初期化OK</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">空きメディア</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatStatus('needs_check')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  formatStatus === 'needs_check'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mb-1 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold">要確認</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">消していいか確認</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatStatus('do_not_format')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  formatStatus === 'do_not_format'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <ShieldAlert className="w-5 h-5 mb-1 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-bold">消去厳禁</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">未保存・納品前</span>
              </button>
            </div>
          </div>

          {/* 企画・プロジェクト名 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              企画・撮影プロジェクト名
            </label>
            <input
              type="text"
              placeholder="例: 新歓PV、学祭ステージDay1、卒業特番"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 入っているデータの内容（文字入力） */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                入っているデータの内容（撮影シーン・カメラ・ファイル詳細）
              </label>
              <button
                type="button"
                onClick={setFormatOkTemplate}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                初期化完了をセット
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="例:
・α7SIII Aカメ素材 (4K 60p XAVC S-I)
・インタビュー（部長・副部長）
・体育館ステージ リハーサル映像
PCへの取り込み済み、未編集"
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 resize-none font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ※ PCに接続しなくても他の部員がどんなデータが入っているか分かるように入力してください。
            </p>
          </div>

          {/* 備考メモ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              備考・注意事項（任意）
            </label>
            <input
              type="text"
              placeholder="例: ケース割れあり、USB-Cケーブルと一緒に返却して"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* フッター */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? '保存中...' : 'データを更新'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
