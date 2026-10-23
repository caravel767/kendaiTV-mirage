import React, { useState, useEffect } from 'react';
import { X, Save, Database, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, initFirebaseService } from '../services/firebase';
import type { FirebaseConfig } from '../types/media';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const [rawConfigJson, setRawConfigJson] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSavedFirebaseConfig();
      if (config) {
        setApiKey(config.apiKey || '');
        setAuthDomain(config.authDomain || '');
        setProjectId(config.projectId || '');
        setStorageBucket(config.storageBucket || '');
        setMessagingSenderId(config.messagingSenderId || '');
        setAppId(config.appId || '');
      }
      const { isFirebaseReady } = initFirebaseService();
      setIsConnected(isFirebaseReady);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // FirebaseコンソールのJavaScriptオブジェクトを直接貼り付けて自動パースする便利機能
  const handlePasteJson = (text: string) => {
    setRawConfigJson(text);
    try {
      // apiKey: "...", 形式を検出
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = text.match(/storageBucket:\s*["']([^"']+)["']/);
      const senderIdMatch = text.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (storageBucketMatch) setStorageBucket(storageBucketMatch[1]);
      if (senderIdMatch) setMessagingSenderId(senderIdMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    } catch (e) {
      console.warn('Auto parse failed', e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('API Key と Project ID は必須です');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(config);
  };

  const handleResetToDemo = () => {
    if (confirm('Firebase接続設定を削除し、ローカルお試しモード（端末内保存）に戻しますか？')) {
      saveFirebaseConfig(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>データベース（Firebase）設定</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* 現在のステータスバナー */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="text-xs">
              <div className="font-bold">
                {isConnected ? 'Firebase Cloud Firestore に接続中' : 'ローカルお試しモードで動作中'}
              </div>
              <div className="text-slate-300 mt-0.5">
                {isConnected
                  ? 'サークル部員全員のPC・スマホ間でリアルタイム同期されています。'
                  : '端末内のブラウザにのみ保存されています。全員で共有するにはFirebaseの設定を入力してください。'}
              </div>
            </div>
          </div>

          {/* クイック貼り付け */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Firebaseコンソールの設定コードをそのまま貼り付け
            </label>
            <textarea
              rows={2}
              placeholder="const firebaseConfig = { apiKey: &quot;...&quot;, projectId: &quot;...&quot; }; を貼り付けると自動入力されます"
              value={rawConfigJson}
              onChange={(e) => handlePasteJson(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 詳細設定フォーム */}
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                API Key *
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project ID *
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="kendaitv-media"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project-id.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="project-id.appspot.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetToDemo}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ローカルモードに初期化</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>保存して再読み込み</span>
              </button>
            </div>
          </form>

          {/* かんたんセットアップ手順リンク */}
          <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <span>Firebaseの準備手順（完全無料）</span>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                コンソール <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-400">
              <li>Firebase Console で新規プロジェクトを作成</li>
              <li>左メニュー「Firestore Database」を作成（テストモードで開始）</li>
              <li>プロジェクト設定 ＞ マイアプリ で「ウェブ (&lt;/&gt;)」を追加</li>
              <li>表示された `firebaseConfig` を上記に貼り付けて保存</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
