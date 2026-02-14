
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('CogniLift 啟動中...');

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('渲染過程中發生錯誤:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #ef4444; font-family: sans-serif;">
        <h1 style="font-size: 24px; font-weight: bold;">應用程式載入失敗</h1>
        <p style="color: #64748b; margin-top: 10px;">${error instanceof Error ? error.message : '發生了未知錯誤'}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer;">重新整理</button>
      </div>
    `;
  }
}
