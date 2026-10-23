import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'miku';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('kendaitv_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'miku') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isMikuUnlocked, setIsMikuUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('kendaitv_miku_unlocked') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'miku-theme');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'miku') {
      root.classList.add('miku-theme');
    }

    localStorage.setItem('kendaitv_theme', theme);

    // meta theme-color を更新
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (theme === 'dark') {
        metaThemeColor.setAttribute('content', '#0b0f19');
      } else if (theme === 'miku') {
        metaThemeColor.setAttribute('content', '#39C5BB');
      } else {
        metaThemeColor.setAttribute('content', '#f8fafc');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (isMikuUnlocked) {
        if (prev === 'light') return 'dark';
        if (prev === 'dark') return 'miku';
        return 'light';
      } else {
        return prev === 'dark' ? 'light' : 'dark';
      }
    });
  };

  // Mモード発動トリガー
  const triggerMikuMode = () => {
    setIsMikuUnlocked(true);
    localStorage.setItem('kendaitv_miku_unlocked', 'true');
    setTheme((prev) => (prev === 'miku' ? 'dark' : 'miku'));
  };

  return { theme, toggleTheme, triggerMikuMode, isMikuUnlocked };
}
