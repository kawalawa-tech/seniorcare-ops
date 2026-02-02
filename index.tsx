import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 標記啟動，清除超時監控
// 使用類型斷言確保在所有環境下都能運行
const win = window as any;
win._OPS_CENTRE_STARTED = true;

if (win._OPS_CENTRE_WATCHDOG) {
  clearTimeout(win._OPS_CENTRE_WATCHDOG);
  console.log("OpsCentre: Bootstrapper running.");
}

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    // 使用 React 18 標準掛載
    root.render(<App />);
  } catch (err: any) {
    console.error("OpsCentre: Render error.", err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = "系統崩潰: " + err.message;
  }
}