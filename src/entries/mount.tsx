import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';

/**
 * 各オーバーレイページ共通のマウント処理。
 * マルチページ構成のため、ページごとの薄いエントリからこれを呼ぶ。
 */
export const mount = (node: ReactNode) => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(<StrictMode>{node}</StrictMode>);
};
