import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  type Firestore,
  type Unsubscribe
} from 'firebase/firestore';
import type { MediaItem, FirebaseConfig } from '../types/media';

const STORAGE_KEY_FIREBASE_CONFIG = 'kendaitv_firebase_config';
const STORAGE_KEY_LOCAL_MEDIA = 'kendaitv_local_media_items';

// デフォルトのサンプルデータ（初期起動時用）
export const INITIAL_DEMO_DATA: MediaItem[] = [
  {
    id: 'demo-1',
    code: 'SD-01',
    name: 'SanDisk Extreme PRO 128GB #1',
    type: 'SD',
    capacity: '128GB',
    speedClass: 'V90 UHS-II 300MB/s',
    tags: ['α7SIII 4K120p対応', 'FX3用'],
    status: 'available',
    formatStatus: 'can_format',
    contentDescription: 'フォーマット済み。空き状態です。',
    notes: 'ケースNo.1に入っています。',
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'demo-2',
    code: 'SD-02',
    name: 'Nextorage Gシリーズ 128GB',
    type: 'SD',
    capacity: '128GB',
    speedClass: 'V90 UHS-II 300MB/s',
    tags: ['メイン撮影用', 'All-Intra対応'],
    status: 'borrowed',
    borrower: '佐藤（2年）',
    borrowDate: '2026-10-22',
    returnDueDate: '2026-10-25',
    project: '学祭PVオープニング撮影',
    formatStatus: 'do_not_format',
    contentDescription: 'Day1 メインステージ・インタビュー素材（4K 60p）。バックアップ未完了のため初期化厳禁！',
    notes: '25日編集室でPCに取り込み予定',
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'demo-3',
    code: 'SSD-01',
    name: 'SanDisk Extreme ポータブルSSD 1TB',
    type: 'SSD',
    capacity: '1TB',
    speedClass: 'USB 3.2 Gen2 1050MB/s',
    tags: ['編集用', '大容量'],
    status: 'borrowed',
    borrower: '田中（3年）',
    borrowDate: '2026-10-20',
    returnDueDate: '2026-10-24',
    project: 'サークル紹介映像2026',
    formatStatus: 'needs_check',
    contentDescription: 'プレミアプロプロジェクト・B-roll素材一式。納品後消去予定だが田中確認要。',
    notes: 'USB-Cケーブル付属',
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'demo-4',
    code: 'HDD-01',
    name: 'WD Elements 4TB 外付けHDD',
    type: 'HDD',
    capacity: '4TB',
    speedClass: 'USB 3.0',
    tags: ['アーカイブ保管', '部室常設'],
    status: 'available',
    formatStatus: 'do_not_format',
    contentDescription: '2025年度〜2026年度 完成動画マスター＆RAWアーカイブバックアップ',
    notes: '部室の編集PC右側に常設。持ち出し原則不可。',
    updatedAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'demo-5',
    code: 'MSD-01',
    name: 'Samsung EVO Plus microSD 256GB',
    type: 'MicroSD',
    capacity: '256GB',
    speedClass: 'V30 A2',
    tags: ['ドローン用', 'GoPro用'],
    status: 'available',
    formatStatus: 'can_format',
    contentDescription: '空き状態（DJI Air 3フォーマット済み）',
    notes: 'SDカード変換アダプタ付き',
    updatedAt: Date.now() - 3600000 * 5,
  }
];

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Firebase設定の読み込み（.env または localStorage）
export function getSavedFirebaseConfig(): FirebaseConfig | null {
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved) as FirebaseConfig;
    } catch {
      return null;
    }
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig | null) {
  if (config) {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  }
  // リロードしてFirebaseを再初期化
  window.location.reload();
}

export function initFirebaseService(): { isFirebaseReady: boolean; isDemoMode: boolean } {
  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { isFirebaseReady: false, isDemoMode: true };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    return { isFirebaseReady: true, isDemoMode: false };
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return { isFirebaseReady: false, isDemoMode: true };
  }
}

// ローカルストレージ操作ヘルパー
function getLocalMedia(): MediaItem[] {
  const raw = localStorage.getItem(STORAGE_KEY_LOCAL_MEDIA);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_LOCAL_MEDIA, JSON.stringify(INITIAL_DEMO_DATA));
    return INITIAL_DEMO_DATA;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_DATA;
  }
}

function saveLocalMedia(items: MediaItem[]) {
  localStorage.setItem(STORAGE_KEY_LOCAL_MEDIA, JSON.stringify(items));
}

// リアルタイムリスナー（FirebaseまたはLocalStorage用ポーリング/イベント）
export function subscribeToMedia(
  onData: (items: MediaItem[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const { isFirebaseReady } = initFirebaseService();

  if (isFirebaseReady && db) {
    try {
      const q = query(collection(db, 'media'), orderBy('code', 'asc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const items: MediaItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...docSnap.data() } as MediaItem);
          });
          onData(items);
        },
        (error) => {
          console.error('Firestore listener error:', error);
          onError(error);
        }
      );
    } catch (e) {
      console.warn('Falling back to local storage due to Firestore error', e);
    }
  }

  // ローカルモード（端末内保存）
  const initial = getLocalMedia();
  onData(initial);

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_LOCAL_MEDIA && e.newValue) {
      onData(JSON.parse(e.newValue));
    }
  };
  window.addEventListener('storage', handleStorageChange);

  // 同一ウィンドウ内の更新を監視するためのカスタムイベント
  const handleCustomEvent = (e: CustomEvent<MediaItem[]>) => {
    onData(e.detail);
  };
  window.addEventListener('local-media-updated' as any, handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('local-media-updated' as any, handleCustomEvent);
  };
}

// メディア追加
export async function addMediaItem(item: Omit<MediaItem, 'id'>): Promise<string> {
  const { isFirebaseReady } = initFirebaseService();
  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newItem: MediaItem = { ...item, id, updatedAt: Date.now() };

  if (isFirebaseReady && db) {
    const docRef = doc(db, 'media', id);
    await setDoc(docRef, newItem);
    return id;
  } else {
    const items = getLocalMedia();
    const updated = [newItem, ...items];
    saveLocalMedia(updated);
    window.dispatchEvent(new CustomEvent('local-media-updated', { detail: updated }));
    return id;
  }
}

// メディア更新
export async function updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<void> {
  const { isFirebaseReady } = initFirebaseService();
  const fullUpdates = { ...updates, updatedAt: Date.now() };

  if (isFirebaseReady && db) {
    const docRef = doc(db, 'media', id);
    await updateDoc(docRef, fullUpdates);
  } else {
    const items = getLocalMedia();
    const updated = items.map((it) => (it.id === id ? { ...it, ...fullUpdates } : it));
    saveLocalMedia(updated);
    window.dispatchEvent(new CustomEvent('local-media-updated', { detail: updated }));
  }
}

// メディア削除
export async function deleteMediaItem(id: string): Promise<void> {
  const { isFirebaseReady } = initFirebaseService();

  if (isFirebaseReady && db) {
    const docRef = doc(db, 'media', id);
    await deleteDoc(docRef);
  } else {
    const items = getLocalMedia();
    const updated = items.filter((it) => it.id !== id);
    saveLocalMedia(updated);
    window.dispatchEvent(new CustomEvent('local-media-updated', { detail: updated }));
  }
}
