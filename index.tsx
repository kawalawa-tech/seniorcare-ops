// 立即清除超時監控
(window as any)._OPS_CENTRE_STARTED = true;
if ((window as any)._OPS_CENTRE_WATCHDOG) {
  clearTimeout((window as any)._OPS_CENTRE_WATCHDOG);
  console.log("OpsCentre: Boot Successful. Mounting Application...");
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/** @jsx React.createElement */

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    // 使用經典的 React 18 掛載模式
    root.render(React.createElement(App));
  } catch (err) {
    console.error("OpsCentre: Render error detected.", err);
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.innerHTML = '<span style="color:red">渲染崩潰: ' + (err as Error).message + '</span>';
    }
  }
}