import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Apply theme script before rendering (prevents flash of wrong theme)
const doc = document.documentElement;
const theme = localStorage.getItem('theme-mode') ?? 'system';

if (theme === 'system') {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    doc.classList.add('dark');
  } else {
    doc.classList.add('light');
  }
} else {
  doc.classList.add(theme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

