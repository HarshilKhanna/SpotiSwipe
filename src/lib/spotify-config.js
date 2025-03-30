export const SPOTIFY_CONFIG = {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback',
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private'
    ]
};

// Debug logging
console.log('Spotify Config:', {
    clientId: SPOTIFY_CONFIG.clientId,
    redirectUri: SPOTIFY_CONFIG.redirectUri,
    scopes: SPOTIFY_CONFIG.scopes
}); 