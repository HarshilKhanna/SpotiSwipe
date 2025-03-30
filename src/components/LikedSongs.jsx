import React, { useState, useEffect } from "react";
import { getSpotifyApi } from "../lib/spotify-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RotateCcw } from "lucide-react";

export function LikedSongs() {
  const [likedSongs, setLikedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const loadLikedSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const spotifyApi = getSpotifyApi();
      
      let allTracks = [];
      let offset = 0;
      const limit = 50; // Maximum allowed by Spotify API
      let hasMore = true;

      // Fetch all liked tracks using pagination
      while (hasMore) {
        const response = await spotifyApi.getMySavedTracks({
          limit,
          offset
        });

        if (!response || !response.items) {
          throw new Error('No liked songs found');
        }

        // Add the current batch of tracks
        const tracks = response.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          imageUrl: item.track.album.images[0]?.url
        }));

        allTracks = [...allTracks, ...tracks];

        // Check if there are more tracks to fetch
        hasMore = response.items.length === limit;
        offset += limit;

        // Log progress
        console.log(`Fetched ${allTracks.length} tracks so far...`);
      }

      console.log(`Total liked songs: ${allTracks.length}`);
      setLikedSongs(allTracks);
    } catch (error) {
      console.error('Error loading liked songs:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to load liked songs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLikedSongs();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
        <p className="text-muted-foreground">Loading your liked songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadLikedSongs}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Liked Songs ({likedSongs.length})</h1>
        
        {likedSongs.length === 0 ? (
          <p className="text-center text-muted-foreground">No liked songs yet</p>
        ) : (
          <div className="space-y-4">
            {likedSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent transition-colors"
              >
                <img
                  src={song.imageUrl}
                  alt={`${song.album} artwork`}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{song.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.album}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
