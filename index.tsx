import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 標記成功啟動
(window as any)._OPS_CENTRE_STARTED = true;
if ((window as any)._OPS_CENTRE_WATCHDOG) {
  clearTimeout((window as any)._OPS_CENTRE_WATCHDOG);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}