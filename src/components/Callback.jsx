import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../lib/spotify-auth';

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const processCallback = async () => {
            try {
                const success = await handleCallback();
                if (isMounted) {
                    if (success) {
                        // Add a small delay to ensure state is updated
                        setTimeout(() => {
                            navigate('/dashboard', { replace: true });
                        }, 100);
                    } else {
                        navigate('/', { replace: true });
                    }
                }
            } catch (error) {
                console.error('Error processing callback:', error);
                if (isMounted) {
                    navigate('/', { replace: true });
                }
            }
        };

        processCallback();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">Completing login...</h2>
            </div>
        </div>
    );
} 