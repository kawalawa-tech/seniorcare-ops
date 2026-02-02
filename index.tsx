import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * 1. 立即標記啟動
 * 這必須在所有非必要的 import 之前或第一行執行，
 * 以確保 index.html 的超時監控器能及時停止。
 */
(window as any)._OPS_CENTRE_STARTED = true;

const bootstrap = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("OpsCentre: UI Engine Mounted Successfully.");
  } catch (err) {
    console.error("Critical Render Error:", err);
    container.innerHTML = `
      <div style="padding:40px; text-align:center; font-family:sans-serif; background:#fff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <div style="width:64px; height:64px; background:#fff1f2; border-radius:20px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:32px;">⚠️</span>
        </div>
        <h2 style="color:#1e293b; font-weight:900; margin-bottom:8px;">啟動引擎發生故障</h2>
        <p style="color:#64748b; font-size:12px; margin-top:10px; max-width:300px; line-height:1.6;">${err instanceof Error ? err.message : '未知錯誤，請檢查瀏覽器控制台。'}</p>
        <button onclick="location.reload()" style="margin-top:32px; padding:12px 32px; background:#f97316; color:white; border-radius:16px; border:none; font-weight:800; cursor:pointer; box-shadow:0 10px 20px rgba(249,115,22,0.2);">重新載入系統</button>
      </div>
    `;
  }
};

// 確保 DOM 載入後執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}