// 標記啟動，清除超時監控
(window as any)._OPS_CENTRE_STARTED = true;
if ((window as any)._OPS_CENTRE_WATCHDOG) {
  clearTimeout((window as any)._OPS_CENTRE_WATCHDOG);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("OpsCentre: Boot failure.", err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = "渲染失敗，請按 F12 檢視錯誤細節。";
  }
}