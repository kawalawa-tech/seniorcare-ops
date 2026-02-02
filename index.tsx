import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 標記系統已成功進入 JS 執行階段
(window as any)._OPS_CENTRE_STARTED = true;
if ((window as any)._OPS_CENTRE_WATCHDOG) {
  clearTimeout((window as any)._OPS_CENTRE_WATCHDOG);
}

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
    console.log("OpsCentre: React Engine Online.");
  } catch (err) {
    console.error("Critical Bootstrap Error:", err);
    container.innerHTML = `
      <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; background:#f8fafc; font-family:sans-serif;">
        <div style="background:white; padding:40px; border-radius:32px; shadow:0 20px 50px rgba(0,0,0,0.05); border:1px solid #e2e8f0;">
          <h2 style="color:#1e293b; margin-bottom:10px;">渲染引擎啟動失敗</h2>
          <p style="color:#64748b; font-size:13px; line-height:1.6;">這可能是由於瀏覽器版本過舊或模組加載衝突。建議使用最新版 Chrome 瀏覽器。</p>
          <pre style="background:#f1f5f9; padding:15px; border-radius:12px; font-size:10px; color:#ef4444; margin-top:20px; text-align:left; overflow:auto;">${err instanceof Error ? err.stack : 'Unknown System Error'}</pre>
          <button onclick="location.reload()" style="margin-top:30px; padding:12px 30px; background:#f97316; color:white; border-radius:16px; border:none; font-weight:bold; cursor:pointer;">重試啟動</button>
        </div>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}