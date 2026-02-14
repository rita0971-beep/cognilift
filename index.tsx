
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('CogniLift: React 應用程式已成功啟動');
  } catch (err) {
    console.error('CogniLift: 渲染失敗', err);
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">渲染錯誤: ${err instanceof Error ? err.message : '未知錯誤'}</div>`;
  }
} else {
  console.error('CogniLift: 找不到掛載點 #root');
}
