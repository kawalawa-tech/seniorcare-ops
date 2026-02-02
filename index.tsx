// 立即標記開始執行
(window as any)._OPS_CENTRE_STARTED = true;
if ((window as any)._OPS_CENTRE_WATCHDOG) {
  clearTimeout((window as any)._OPS_CENTRE_WATCHDOG);
  console.log("OpsCentre: Engine Started. Mounting UI...");
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    // 使用 JSX 語法而非 React.createElement，以配合 Babel 轉譯器
    root.render(<App />);
  } catch (err) {
    console.error("OpsCentre: Critical Boot Error.", err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = "系統初始化失敗，請檢查瀏覽器相容性。";
  }
}