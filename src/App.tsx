import { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Search,
  Plus,
  QrCode,
  Settings,
  CheckCircle2,
  HardDrive,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  History
} from 'lucide-react';
import type { MediaItem, MediaLog } from './types/media';
import {
  subscribeToMedia,
  subscribeToLogs,
  addMediaItem,
  updateMediaItem,
  deleteMediaItem,
  addMediaLog,
  initFirebaseService
} from './services/firebase';
import { useTheme } from './hooks/useTheme';
import { MediaCard } from './components/MediaCard';
import { MediaItemModal } from './components/MediaItemModal';
import { ContentEditModal } from './components/ContentEditModal';
import { BorrowReturnModal } from './components/BorrowReturnModal';
import { QrScannerModal } from './components/QrScannerModal';
import { QrViewModal } from './components/QrViewModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // 検索・フィルター用ステート
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'available' | 'borrowed'
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL'); // 'ALL' | FormatStatus

  // モーダル管理用ステート
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<MediaItem | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentItem, setSelectedContentItem] = useState<MediaItem | null>(null);

  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<MediaItem | null>(null);

  const [isQrScanOpen, setIsQrScanOpen] = useState(false);
  const [isQrViewOpen, setIsQrViewOpen] = useState(false);
  const [selectedQrItem, setSelectedQrItem] = useState<MediaItem | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyMediaCode, setHistoryMediaCode] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // データ初期ロード＆リアルタイム同期
  useEffect(() => {
    const { isFirebaseReady } = initFirebaseService();
    setIsFirebaseConnected(isFirebaseReady);

    const unsubMedia = subscribeToMedia(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error('Subscription error:', error);
        setLoading(false);
      }
    );

    const unsubLogs = subscribeToLogs(
      (logData) => {
        setLogs(logData);
      },
      (error) => {
        console.error('Logs subscription error:', error);
      }
    );

    return () => {
      unsubMedia();
      unsubLogs();
    };
  }, []);

  // フィルタリング処理
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesContent = item.contentDescription?.toLowerCase().includes(q);
        const matchesBorrower = item.borrower?.toLowerCase().includes(q);
        const matchesProject = item.project?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchesCode && !matchesName && !matchesContent && !matchesBorrower && !matchesProject && !matchesTags) {
          return false;
        }
      }

      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      if (selectedFormat !== 'ALL' && item.formatStatus !== selectedFormat) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedType, selectedStatus, selectedFormat]);

  // 統計値
  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.status === 'available').length;
    const borrowed = items.filter((i) => i.status === 'borrowed').length;
    const canFormat = items.filter((i) => i.formatStatus === 'can_format').length;
    const doNotFormat = items.filter((i) => i.formatStatus === 'do_not_format').length;
    return { total, available, borrowed, canFormat, doNotFormat };
  }, [items]);

  // QRコードスキャン成功時
  const handleQrScanSuccess = (decodedText: string) => {
    setIsQrScanOpen(false);
    const cleanCode = decodedText.replace('kendaitv:', '').trim().toUpperCase();
    const target = items.find((i) => i.code.toUpperCase() === cleanCode);

    if (target) {
      setSelectedBorrowItem(target);
      setIsBorrowModalOpen(true);
    } else {
      alert(`管理番号「${cleanCode}」に該当するメディアが見つかりませんでした。`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* ロゴ・タイトル */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  県大TV メディア管理
                </h1>
                <span
                  title={isFirebaseConnected ? 'Firebaseリアルタイム同期中' : 'ローカル保存モード'}
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    isFirebaseConnected
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isFirebaseConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span className="hidden sm:inline">Firebase同期中</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span className="hidden sm:inline">ローカルモード</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                SDカード・SSD持ち出し状況 &amp; 撮影データ管理システム
              </p>
            </div>
          </div>

          {/* 右上アクションボタングループ */}
          <div className="flex items-center gap-2">
            {/* テーマ切り替えボタン */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* 持ち出し履歴ボタン */}
            <button
              onClick={() => {
                setHistoryMediaCode(null);
                setIsHistoryOpen(true);
              }}
              title="持ち出し・返却履歴"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition active:scale-95 shadow-2xs"
            >
              <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">履歴</span>
            </button>

            {/* QRスキャンボタン */}
            <button
              onClick={() => setIsQrScanOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QRスキャン</span>
            </button>

            {/* 新規メディア追加ボタン */}
            <button
              onClick={() => {
                setSelectedEditItem(null);
                setIsMediaModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition active:scale-95 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新規追加</span>
            </button>

            {/* 設定ボタン */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Firebase連携設定"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* 統計サマリーカード */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">総メディア数</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">部室に保管中</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.available}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">貸出中</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.borrowed}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">初期化OK（空き）</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.canFormat}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* 検索・絞り込みフィルターバー */}
        <section className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
          {/* テキスト検索入力 */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="管理番号（SD-01）、機材名、入っているデータ内容、借りている人、企画名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                クリア
              </button>
            )}
          </div>

          {/* クイックフィルタータグ群 */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            {/* メディア種別タブ */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {['ALL', 'SD', 'MicroSD', 'CFexpress', 'SSD', 'HDD', 'USB'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                    selectedType === type
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {type === 'ALL' ? '全メディア' : type}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* 保管ステータスタブ */}
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: '保管状態すべて' },
                { id: 'available', label: '部室あり' },
                { id: 'borrowed', label: '貸出中' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedStatus === s.id
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* 初期化ステータスタブ */}
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: '初期化すべて' },
                { id: 'can_format', label: '🟢初期化OK' },
                { id: 'needs_check', label: '🟡要確認' },
                { id: 'do_not_format', label: '🔴消去厳禁' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedFormat === f.id
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* メディア一覧リスト（カードグリッド） */}
        <section className="flex-1">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">メディア一覧を読み込み中...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <HardDrive className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-base">該当するメディアが見つかりません</p>
              <p className="text-xs text-slate-500 mt-1">
                検索条件を変更するか、右上の「新規追加」から機材を登録してください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onOpenBorrowReturn={(target) => {
                    setSelectedBorrowItem(target);
                    setIsBorrowModalOpen(true);
                  }}
                  onOpenContentEdit={(target) => {
                    setSelectedContentItem(target);
                    setIsContentModalOpen(true);
                  }}
                  onOpenQrView={(target) => {
                    setSelectedQrItem(target);
                    setIsQrViewOpen(true);
                  }}
                  onOpenEdit={(target) => {
                    setSelectedEditItem(target);
                    setIsMediaModalOpen(true);
                  }}
                  onOpenHistory={(target) => {
                    setHistoryMediaCode(target.code);
                    setIsHistoryOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* フッター */}
      <footer className="py-4 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 text-center text-xs text-slate-500">
        県大TV 機材管理システム • PWA &amp; Firestore 対応
      </footer>

      {/* モーダル群 */}
      <BorrowReturnModal
        item={selectedBorrowItem}
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedBorrowItem(null);
        }}
        onConfirm={async (id, updates, logData) => {
          await updateMediaItem(id, updates);
          if (selectedBorrowItem) {
            await addMediaLog({
              mediaId: id,
              mediaCode: selectedBorrowItem.code,
              mediaName: selectedBorrowItem.name,
              action: logData.action,
              borrower: logData.borrower,
              project: logData.project,
              returnDueDate: logData.returnDueDate,
              formattedOnReturn: logData.formattedOnReturn,
            });
          }
        }}
      />

      <ContentEditModal
        item={selectedContentItem}
        isOpen={isContentModalOpen}
        onClose={() => {
          setIsContentModalOpen(false);
          setSelectedContentItem(null);
        }}
        onSave={async (id, updates) => {
          await updateMediaItem(id, updates);
        }}
      />

      <MediaItemModal
        item={selectedEditItem}
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setSelectedEditItem(null);
        }}
        onSave={async (data) => {
          if (selectedEditItem) {
            await updateMediaItem(selectedEditItem.id, data);
          } else {
            await addMediaItem(data as any);
          }
        }}
        onDelete={async (id) => {
          await deleteMediaItem(id);
        }}
      />

      <QrScannerModal
        isOpen={isQrScanOpen}
        onClose={() => setIsQrScanOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      <QrViewModal
        item={selectedQrItem}
        isOpen={isQrViewOpen}
        onClose={() => {
          setIsQrViewOpen(false);
          setSelectedQrItem(null);
        }}
      />

      <HistoryModal
        logs={logs}
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setHistoryMediaCode(null);
        }}
        filterMediaCode={historyMediaCode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
