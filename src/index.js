import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { I18nProvider, prepareI18n } from './i18n/I18nContext';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Tải sẵn từ điển ngôn ngữ đã chọn rồi mới render (tránh nháy tiếng Anh).
prepareI18n().then((initialLanguage) => {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <I18nProvider initialLanguage={initialLanguage}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
});
