import { getSpotifyApi, isAuthenticated } from './spotify-auth';

const ensureAuthenticated = () => {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated with Spotify');
    }
};

export const getLikedSongs = async (limit = 50) => {
    ensureAuthenticated();
    const spotifyApi = getSpotifyApi();
    try {
        const response = await spotifyApi.getMySavedTracks({ limit });
        return response.items.map(item => item.track);
    } catch (error) {
        console.error('Error fetching liked songs:', error);
        throw error;
    }
};

export const getUserPlaylists = async (limit = 50) => {
    ensureAuthenticated();
    const spotifyApi = getSpotifyApi();
    try {
        const response = await spotifyApi.getUserPlaylists({ limit });
        return response.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
};

export const getPlaylistTracks = async (playlistId, limit = 50) => {
    ensureAuthenticated();
    const spotifyApi = getSpotifyApi();
    try {
        const response = await spotifyApi.getPlaylistTracks(playlistId, { limit });
        return response.items.map(item => item.track);
    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        throw error;
    }
};

export const getRecommendations = async (seedTracks = [], seedArtists = [], seedGenres = [], limit = 50) => {
    ensureAuthenticated();
    try {
        const spotifyApi = getSpotifyApi();
        
        // Get user's market first
        const userProfile = await spotifyApi.getMe();
        const userMarket = userProfile.country || 'US';
        console.log('User market:', userMarket);

        // Get user's recently liked songs
        const likedSongs = await spotifyApi.getMySavedTracks({ limit: 50 });
        const recentLikedSongs = likedSongs.items.slice(0, 5).map(item => item.track);
        console.log('Recent liked songs:', recentLikedSongs.map(song => song.name));

        if (!recentLikedSongs || recentLikedSongs.length === 0) {
            throw new Error('No recently liked songs found');
        }

        // Get all liked songs to exclude them
        const allLikedSongIds = new Set(likedSongs.items.map(item => item.track.id));
        console.log('Total liked songs count:', allLikedSongIds.size);

        // Get artists from recently liked songs
        const recentArtists = new Set(recentLikedSongs.map(song => song.artists[0].id));
        console.log('Recent artists:', recentLikedSongs.map(song => song.artists[0].name));

        // Search for tracks by these artists with increased limit
        const searchPromises = Array.from(recentArtists).map(artistId => 
            spotifyApi.getArtistTopTracks(artistId, userMarket, { limit: 50 })
        );

        const searchResults = await Promise.all(searchPromises);
        
        // Use a Map to ensure unique tracks by ID
        const uniqueTracks = new Map();
        
        searchResults.forEach(result => {
            if (result && result.tracks) {
                result.tracks.forEach(track => {
                    // Only add tracks that:
                    // 1. Have a valid ID
                    // 2. Have a valid name
                    // 3. Have a valid album with images
                    // 4. Are not in the user's liked songs
                    // 5. Haven't been added before
                    if (track && 
                        track.id && 
                        track.name &&
                        track.album &&
                        track.album.images &&
                        track.album.images.length > 0 &&
                        !allLikedSongIds.has(track.id) && 
                        !uniqueTracks.has(track.id)) {
                        uniqueTracks.set(track.id, track);
                    }
                });
            }
        });

        // Convert Map to array and shuffle
        const allTracks = Array.from(uniqueTracks.values());
        
        // Shuffle the tracks array
        for (let i = allTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTracks[i], allTracks[j]] = [allTracks[j], allTracks[i]];
        }

        // Take the first N tracks
        const availableTracks = allTracks.slice(0, limit);

        if (availableTracks.length === 0) {
            console.error('No tracks found after filtering. Total tracks before filtering:', allTracks.length);
            throw new Error('No new tracks found. Try refreshing your recommendations.');
        }

        console.log('Successfully found new tracks:', availableTracks.length);
        console.log('First track:', availableTracks[0]);
        return availableTracks;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        if (error.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to get recommendations. Please try again.');
    }
};

// Helper function to validate track
const isValidTrack = (track) => {
    return track && 
           track.id && 
           track.name &&
           track.album &&
           track.album.images &&
           track.album.images.length > 0;
};

export const getRecentlyPlayed = async (limit = 20) => {
    ensureAuthenticated();
    const spotifyApi = getSpotifyApi();
    try {
        const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit });
        return response.items.map(item => item.track);
    } catch (error) {
        console.error('Error fetching recently played:', error);
        throw error;
    }
};

export const getTopTracks = async (timeRange = 'medium_term', limit = 20) => {
    ensureAuthenticated();
    const spotifyApi = getSpotifyApi();
    try {
        const response = await spotifyApi.getMyTopTracks({ time_range: timeRange, limit });
        
        // Filter out any tracks without valid IDs
        const validTracks = response.items.filter(track => {
            if (!track || !track.id) {
                console.warn('Invalid track found:', track);
                return false;
            }
            return true;
        });

        if (validTracks.length === 0) {
            throw new Error('No valid top tracks found');
        }

        return validTracks;
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        throw error;
    }
}; 