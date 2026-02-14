
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('CogniLift: 準備掛載 React 根節點...');

const mountApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('CogniLift Error: 找不到 ID 為 root 的 HTML 元素');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('CogniLift: React 渲染指令已發送');
  } catch (error) {
    console.error('CogniLift Error: React 渲染過程崩潰', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #ef4444; font-family: sans-serif;">
        <h1 style="font-size: 24px; font-weight: bold;">初始化失敗</h1>
        <p style="color: #64748b; margin-top: 10px;">${error instanceof Error ? error.message : '未知錯誤'}</p>
        <div style="text-align:left; background:#f1f5f9; padding:15px; border-radius:8px; font-size:12px; margin-top:20px; white-space: pre-wrap;">
          請確認您的瀏覽器支援 ES Modules 與 TypeScript 直接運行。
        </div>
      </div>
    `;
  }
};

// 確保 DOM 已載入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
