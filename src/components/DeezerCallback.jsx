import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEEZER_CONFIG } from '../lib/deezer-config';

const DeezerCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the access token from the URL hash
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const expiresIn = params.get('expires_in');

                if (!accessToken) {
                    throw new Error('No access token received');
                }

                // Store the access token and expiry
                localStorage.setItem('deezer_access_token', accessToken);
                localStorage.setItem('deezer_token_expiry', Date.now() + (parseInt(expiresIn) * 1000));

                // Redirect to the main app
                navigate('/');
            } catch (error) {
                console.error('Error handling Deezer callback:', error);
                // Redirect to login page on error
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Connecting to Deezer...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C851] mx-auto"></div>
            </div>
        </div>
    );
};

export default DeezerCallback; 