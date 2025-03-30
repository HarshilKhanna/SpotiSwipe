import SpotifyWebApi from 'spotify-web-api-js';
import { SPOTIFY_CONFIG } from './spotify-config';

const spotifyApi = new SpotifyWebApi();

export const getAuthUrl = () => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CONFIG.clientId,
        scope: SPOTIFY_CONFIG.scopes.join(' '),
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        show_dialog: true
    });

    const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('Generated Auth URL:', url);
    return url;
};

const getAccessToken = async (code) => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${btoa(`${SPOTIFY_CONFIG.clientId}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: SPOTIFY_CONFIG.redirectUri
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${btoa(`${SPOTIFY_CONFIG.clientId}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`)}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

const checkToken = async (token) => {
    try {
        spotifyApi.setAccessToken(token);
        await spotifyApi.getMe();
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};

export const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        try {
            const tokenData = await getAccessToken(code);
            const { access_token, refresh_token, expires_in } = tokenData;

            // Store tokens
            localStorage.setItem('spotify_access_token', access_token);
            localStorage.setItem('spotify_refresh_token', refresh_token);
            localStorage.setItem('spotify_token_expiry', Date.now() + (expires_in * 1000));

            // Validate the token
            const isValid = await checkToken(access_token);
            if (isValid) {
                return true;
            }
        } catch (error) {
            console.error('Error handling callback:', error);
        }
    }
    return false;
};

export const isAuthenticated = async () => {
    const accessToken = localStorage.getItem('spotify_access_token');
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');

    if (accessToken && refreshToken) {
        // Check if token is expired
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            try {
                const tokenData = await refreshAccessToken(refreshToken);
                const { access_token, expires_in } = tokenData;

                // Update stored tokens
                localStorage.setItem('spotify_access_token', access_token);
                localStorage.setItem('spotify_token_expiry', Date.now() + (expires_in * 1000));

                spotifyApi.setAccessToken(access_token);
                return true;
            } catch (error) {
                console.error('Error refreshing token:', error);
                logout();
                return false;
            }
        }

        return await checkToken(accessToken);
    }
    return false;
};

export const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    spotifyApi.setAccessToken(null);
};

export const getSpotifyApi = () => spotifyApi; 