export type MediaType = 'SD' | 'MicroSD' | 'CFexpress' | 'SSD' | 'HDD' | 'USB' | 'Other';

export type FormatStatus = 'can_format' | 'needs_check' | 'do_not_format';

export interface MediaItem {
  id: string;
  code: string; // 管理番号 (例: "SD-01", "SSD-02")
  name: string; // メディア名
  type: MediaType;
  capacity: string; // 容量 (例: "128GB", "1TB")
  speedClass?: string; // 規格・速度 (例: "V90 UHS-II", "1050MB/s")
  tags?: string[]; // 用途・機材タグ (例: ["α7SIII対応", "FX3用"])
  status: 'available' | 'borrowed'; // 部室にあるか / 持ち出し中か
  borrower?: string; // 借りている部員名
  borrowDate?: string; // 持ち出し日時
  returnDueDate?: string; // 返却予定日
  project?: string; // 撮影企画名 (例: "新歓PV撮影")
  formatStatus: FormatStatus; // 初期化可否
  contentDescription: string; // 中に入っているデータの内容説明
  notes?: string; // 備考
  updatedAt: number; // 最終更新タイムスタンプ
}

export type LogAction = 'borrow' | 'return';

export interface MediaLog {
  id: string;
  mediaId: string;
  mediaCode: string;
  mediaName: string;
  action: LogAction;
  borrower: string; // 持ち出した部員 / 返却した部員
  project?: string; // 企画・用途
  returnDueDate?: string; // 返却予定日
  formattedOnReturn?: boolean; // 返却時にフォーマットされたか
  timestamp: number; // 記録日時
  notes?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
