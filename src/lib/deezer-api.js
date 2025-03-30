// Deezer API configuration
const DEEZER_CONFIG = {
    appId: 'YOUR_APP_ID', // Optional: Add your Deezer app ID here
    apiUrl: 'https://api.deezer.com',
    corsProxy: 'https://cors-anywhere.herokuapp.com/' // CORS proxy URL
};

// Search for tracks
export async function searchTracks(query, limit = 1) {
    try {
        // Clean and format the search query
        const cleanQuery = query
            .replace(/track:/g, '') // Remove track: prefix if present
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .trim();

        const response = await fetch(`${DEEZER_CONFIG.corsProxy}${DEEZER_CONFIG.apiUrl}/search?q=${encodeURIComponent(cleanQuery)}`, {
            headers: {
                'Origin': window.location.origin,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Deezer API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            console.log(`No results found for query: ${cleanQuery}`);
            return [];
        }

        // Log the search results for debugging
        console.log(`Search results for "${cleanQuery}":`, data.data.map(track => ({
            title: track.title,
            artist: track.artist.name,
            preview: track.preview
        })));

        return data.data
            .slice(0, limit)
            .map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist.name,
                previewUrl: track.preview
            }));
    } catch (error) {
        console.error('Error searching Deezer tracks:', error);
        return [];
    }
}

// Get track by ID
export const getTrackById = async (id) => {
    try {
        // Add app_id to the URL if available
        const appIdParam = DEEZER_CONFIG.appId ? `?app_id=${DEEZER_CONFIG.appId}` : '';
        const response = await fetch(`${DEEZER_CONFIG.corsProxy}${DEEZER_CONFIG.apiUrl}/track/${id}${appIdParam}`, {
            headers: {
                'Origin': window.location.origin,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch track from Deezer');
        }

        const track = await response.json();
        return {
            id: track.id,
            name: track.title,
            artist: track.artist.name,
            album: track.album.title,
            imageUrl: track.album.cover_medium,
            previewUrl: track.preview
        };
    } catch (error) {
        console.error('Error fetching track:', error);
        throw error;
    }
}; 