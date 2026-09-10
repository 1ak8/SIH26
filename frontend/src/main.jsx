import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './i18n';

// Automatically suppress Google Translate banner & protect icons from being translated
if (typeof window !== 'undefined') {
  const sanitizeDOM = () => {
    // 1. Never let Google Translate displace the page layout by injecting top margin on body
    if (document.body && document.body.style.top !== '0px') {
      document.body.style.setProperty('top', '0px', 'important');
    }
    // 2. Kill the google banner frame if it appears
    const bannerFrames = document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame, iframe[src*="translate.google.com"]');
    bannerFrames.forEach(frame => {
      frame.style.setProperty('display', 'none', 'important');
      frame.style.setProperty('visibility', 'hidden', 'important');
      frame.style.setProperty('height', '0px', 'important');
    });
    // 3. Mark all icons with notranslate so Google never translates icon text (e.g. arrow_drop_down, lock, volunteer_activism)
    const icons = document.querySelectorAll('.material-symbols-outlined:not(.notranslate)');
    icons.forEach(el => {
      el.classList.add('notranslate');
      el.setAttribute('translate', 'no');
    });
  };

  sanitizeDOM();
  document.addEventListener('DOMContentLoaded', sanitizeDOM);
  const observer = new MutationObserver(sanitizeDOM);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
