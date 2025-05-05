"use client";

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        })
        .catch(function(error) {
          console.log('Service Worker registration failed: ', error);
        });
    });
  }
} 