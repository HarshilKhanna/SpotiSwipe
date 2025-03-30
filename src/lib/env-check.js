export const checkEnvironment = () => {
    console.log('Environment Variables:', {
        VITE_SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        VITE_REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
    });
}; 