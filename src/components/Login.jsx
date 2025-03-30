import { getAuthUrl } from '../lib/spotify-auth';

export default function Login() {
    const handleLogin = () => {
        window.location.href = getAuthUrl();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <div className="text-center">
                <h1 className="mb-8 text-4xl font-bold text-white">SpotiSwipe</h1>
                <button
                    onClick={handleLogin}
                    className="rounded-full bg-green-500 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Login with Spotify
                </button>
            </div>
        </div>
    );
} 