import React from 'react';
import { DEEZER_CONFIG } from '../lib/deezer-config';

const DeezerAuth = () => {
    const handleLogin = () => {
        const authUrl = `https://connect.deezer.com/oauth/auth.php?app_id=${DEEZER_CONFIG.appId}&redirect_uri=${encodeURIComponent(DEEZER_CONFIG.redirectUri)}&perms=${DEEZER_CONFIG.scopes.join(',')}`;
        window.location.href = authUrl;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Welcome to SpotiSwipe</h1>
                <p className="text-gray-600 mb-8 text-center">
                    Connect with Deezer to start discovering and swiping through music.
                </p>
                <button
                    onClick={handleLogin}
                    className="w-full bg-[#00C851] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#00A844] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5C6.21 22.5 1.5 17.79 1.5 12S6.21 1.5 12 1.5 22.5 6.21 22.5 12 17.79 22.5 12 22.5z"/>
                        <path d="M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9S16.971 3 12 3zm0 16.5c-4.136 0-7.5-3.364-7.5-7.5S7.864 4.5 12 4.5s7.5 3.364 7.5 7.5-3.364 7.5-7.5 7.5z"/>
                    </svg>
                    Connect with Deezer
                </button>
            </div>
        </div>
    );
};

export default DeezerAuth; 