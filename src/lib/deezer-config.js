export const DEEZER_CONFIG = {
    appId: import.meta.env.VITE_DEEZER_APP_ID || '',
    appSecret: import.meta.env.VITE_DEEZER_APP_SECRET || '',
    redirectUri: import.meta.env.VITE_DEEZER_REDIRECT_URI || 'http://localhost:5173/callback',
    scopes: ['basic_access', 'email', 'offline_access'],
    apiUrl: 'https://api.deezer.com',
    apiVersion: 'v1',
    corsProxy: import.meta.env.VITE_CORS_PROXY_URL || 'https://cors-anywhere.herokuapp.com/'
}; 