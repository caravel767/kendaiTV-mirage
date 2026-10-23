import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, HardDrive } from 'lucide-react';
import type { MediaItem, MediaType, FormatStatus } from '../types/media';

interface MediaItemModalProps {
  item: MediaItem | null; // nullなら新規作成
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MediaItem, 'id' | 'updatedAt'> | Partial<MediaItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'SD', label: 'SDカード' },
  { value: 'MicroSD', label: 'microSDカード' },
  { value: 'CFexpress', label: 'CFexpress (Type A/B)' },
  { value: 'SSD', label: 'ポータブルSSD' },
  { value: 'HDD', label: '外付けHDD' },
  { value: 'USB', label: 'USBメモリ' },
  { value: 'Other', label: 'その他' },
];

export const MediaItemModal: React.FC<MediaItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<MediaType>('SD');
  const [capacity, setCapacity] = useState('128GB');
  const [speedClass, setSpeedClass] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [formatStatus, setFormatStatus] = useState<FormatStatus>('can_format');
  const [contentDescription, setContentDescription] = useState('フォーマット済み。空き状態です。');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setCode(item.code || '');
      setName(item.name || '');
      setType(item.type || 'SD');
      setCapacity(item.capacity || '128GB');
      setSpeedClass(item.speedClass || '');
      setTags(item.tags || []);
      setFormatStatus(item.formatStatus || 'can_format');
      setContentDescription(item.contentDescription || '');
      setNotes(item.notes || '');
    } else {
      setCode('');
      setName('');
      setType('SD');
      setCapacity('128GB');
      setSpeedClass('V90 UHS-II');
      setTags(['メイン機材']);
      setFormatStatus('can_format');
      setContentDescription('フォーマット済み。空き状態です。');
      setNotes('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('管理番号と機材名を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type,
        capacity: capacity.trim(),
        speedClass: speedClass.trim(),
        tags,
        formatStatus,
        contentDescription: contentDescription.trim(),
        notes: notes.trim(),
        status: item ? item.status : ('available' as const),
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !onDelete) return;
    if (confirm(`本当に「${item.code}: ${item.name}」を削除しますか？`)) {
      setIsSubmitting(true);
      try {
        await onDelete(item.id);
        onClose();
      } catch (err) {
        console.error(err);
        alert('削除に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
            <HardDrive className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>{item ? 'メディア情報の編集' : '新規メディアの登録'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {/* 管理番号 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                管理番号 (コード) *
              </label>
              <input
                type="text"
                required
                placeholder="例: SD-01, SSD-02"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* メディア種別 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                メディアの種類 *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-indigo-500"
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* メディア製品名 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              製品名・ラベル名 *
            </label>
            <input
              type="text"
              required
              placeholder="例: SanDisk Extreme PRO 128GB #1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 容量 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                容量 *
              </label>
              <input
                type="text"
                required
                placeholder="例: 128GB, 1TB, 2TB"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* スピード規格 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                規格・転送速度
              </label>
              <input
                type="text"
                placeholder="例: V90 UHS-II, 1050MB/s"
                value={speedClass}
                onChange={(e) => setSpeedClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 機材タグ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              対応機材・用途タグ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: α7SIII対応, FX3用, ドローン用"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
              >
                追加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-500/30"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 入っているデータ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              現在入っているデータの内容
            </label>
            <textarea
              rows={3}
              placeholder="入っている素材の内容やフォーマット状態を入力"
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              備考（保管場所・ケース番号など）
            </label>
            <input
              type="text"
              placeholder="例: 部室ケースAの1段目、専用ケース付属"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
            {item && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{item ? '変更を保存' : 'メディアを追加'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
