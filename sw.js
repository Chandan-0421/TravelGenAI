// Service Worker for PWA
const CACHE_NAME = 'travelgenie-cache-v1';

self.addEventListener('install', (event) => {
    console.log('✅ Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
    // PWA requirement ke liye dummy fetch listener zaroori hai
});