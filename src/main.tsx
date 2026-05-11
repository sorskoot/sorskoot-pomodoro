import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { registerServiceWorker } from './pwa';

function requestNotificationPermission(): void {
    if (typeof window === 'undefined' || typeof Notification === 'undefined')
        return;
    if (Notification.permission === 'default') {
        void Notification.requestPermission();
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

registerServiceWorker();
requestNotificationPermission();
