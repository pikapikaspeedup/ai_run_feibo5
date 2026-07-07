import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { IS_COARSE } from './game/constants.js';
import './styles.css';

/* 触屏样式由 body.is-touch 驱动（与 JS 的 IS_COARSE 同源，?mobile=1 调试也一致），
 * 不再依赖 @media (pointer: coarse) */
if (IS_COARSE) document.body.classList.add('is-touch');

createRoot(document.getElementById('root')).render(<App />);

/* PWA：仅生产环境注册（dev 下缓存会干扰 HMR） */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
