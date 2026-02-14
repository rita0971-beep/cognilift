
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('CogniLift: 腳本已加載，準備啟動 React...');

const startApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('CogniLift Error: 找不到 ID 為 "root" 的 HTML 元素');
    return;
  }

  // 防止重複掛載
  if ((rootElement as any)._reactRoot) {
    console.warn('CogniLift: React 已在運行中，跳過重複啟動');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    (rootElement as any)._reactRoot = root; // 標記已掛載
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('CogniLift: React 渲染指令已發送');
  } catch (err) {
    console.error('CogniLift: 渲染過程發生錯誤', err);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #e53e3e; font-family: sans-serif;">
        <h3>應用程式崩潰</h3>
        <p>${err instanceof Error ? err.message : '未知渲染錯誤'}</p>
      </div>
    `;
  }
};

// 確保在所有 DOM 資源準備就緒後再啟動
if (document.readyState === 'complete') {
  startApp();
} else {
  window.addEventListener('load', startApp);
}
