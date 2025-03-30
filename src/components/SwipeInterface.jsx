import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Heart, X, RotateCcw, Play, Pause } from "lucide-react";
import { getRecommendations } from "../lib/spotify-api";
import { getSpotifyApi } from "../lib/spotify-auth";
import { searchTracks } from "../lib/deezer-api";
import { useNavigate } from "react-router-dom";

export function SwipeInterface() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exitDirection, setExitDirection] = useState(0);
  const audioRef = useRef(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (currentSong?.previewUrl) {
      console.log('Setting up audio for:', currentSong.name);
      console.log('Preview URL:', currentSong.previewUrl);

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create new audio instance
      const audio = new Audio(currentSong.previewUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
      });

      audio.addEventListener('error', (error) => {
        console.error('Audio error:', error);
        setIsPlaying(false);
      });

      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
        // Try to play the audio when it's ready
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            });
        }
      });

      // Also try to play immediately
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio started playing immediately');
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Error playing audio immediately:', error);
            // Don't set isPlaying to false here as we'll try again in canplaythrough
          });
      }
    } else {
      // If no preview URL, ensure audio is stopped and playing state is false
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [currentSong]);

  useEffect(() => {
    loadInitialRecommendations();
  }, []);

  const loadInitialRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentSong(null);
      setRecommendations([]);
      
      // Get recommendations from Spotify
      const spotifyRecommendations = await getRecommendations();
      
      if (!spotifyRecommendations || spotifyRecommendations.length === 0) {
        throw new Error('No recommendations found');
      }

      // Filter out duplicate songs based on name and artist
      const uniqueTracks = spotifyRecommendations.reduce((acc, track) => {
        const key = `${track.name.toLowerCase()}-${track.artists[0].name.toLowerCase()}`;
        if (!acc.has(key)) {
          acc.set(key, track);
        }
        return acc;
      }, new Map());

      const uniqueRecommendations = Array.from(uniqueTracks.values());
      console.log('Unique recommendations:', uniqueRecommendations.length);

      // Get Deezer previews for all tracks with improved search query
      const searchPromises = uniqueRecommendations.map(track => {
        // Create a more specific search query using both track name and artist
        const searchQuery = `${track.name} ${track.artists[0].name} track:${track.name}`;
        return searchTracks(searchQuery, 1);
      });

      const deezerResults = await Promise.all(searchPromises);
      
      // Combine Spotify and Deezer data with better matching
      const combinedRecommendations = uniqueRecommendations.map((spotifyTrack, index) => {
        const deezerTrack = deezerResults[index]?.[0];
        
        // Only include the preview if we have a valid Deezer track
        if (deezerTrack) {
          console.log(`Matched Spotify track "${spotifyTrack.name}" with Deezer track "${deezerTrack.title}"`);
        } else {
          console.log(`No Deezer match found for Spotify track "${spotifyTrack.name}"`);
        }

        return {
          ...spotifyTrack,
          previewUrl: deezerTrack?.previewUrl
        };
      });

      // Filter out tracks without preview URLs or album images
      const validRecommendations = combinedRecommendations.filter(track => 
        track.previewUrl && track.album?.images?.[0]?.url
      );

      if (validRecommendations.length === 0) {
        throw new Error('No valid recommendations found');
      }

      console.log('Found valid recommendations:', validRecommendations.length);
      setRecommendations(validRecommendations);
      setCurrentIndex(0);
      setCurrentSong({
        id: validRecommendations[0].id,
        name: validRecommendations[0].name,
        artist: validRecommendations[0].artists[0].name,
        album: validRecommendations[0].album.name,
        imageUrl: validRecommendations[0].album.images[0]?.url,
        previewUrl: validRecommendations[0].previewUrl
      });
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to load recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    setExitDirection(direction === "right" ? 1 : -1);
    
    if (direction === "right") {
      try {
        const spotifyApi = getSpotifyApi();
        if (!currentSong?.id) {
          throw new Error('Invalid track ID');
        }
        
        await spotifyApi.addToMySavedTracks({
          ids: [currentSong.id]
        });
        
        toast({
          title: "Added to Liked Songs",
          description: `${currentSong.name} by ${currentSong.artist}`,
        });
      } catch (error) {
        console.error('Error adding to liked songs:', error);
        toast({
          title: "Error",
          description: "Failed to add song to liked songs.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Song Skipped",
        description: `${currentSong.name} by ${currentSong.artist}`,
      });
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < recommendations.length) {
        const nextTrack = recommendations[nextIndex];
        setCurrentSong({
          id: nextTrack.id,
          name: nextTrack.name,
          artist: nextTrack.artists[0].name,
          album: nextTrack.album.name,
          imageUrl: nextTrack.album.images[0]?.url,
          previewUrl: nextTrack.previewUrl
        });
        setCurrentIndex(nextIndex);
      } else {
        loadInitialRecommendations();
        setCurrentIndex(0);
      }
      setExitDirection(0);
    }, 300);
  };

  const handlePlayPause = () => {
    if (!currentSong?.previewUrl) {
      toast({
        title: "Preview Not Available",
        description: "This song doesn't have a preview available. You can still like or skip it!",
        variant: "destructive",
      });
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
      } else {
        console.log('Playing audio');
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading || !currentSong || recommendations.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadInitialRecommendations}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSong.id}
          className="w-full max-w-md aspect-square relative rounded-2xl overflow-hidden card-shadow"
          initial={{ x: exitDirection * 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: exitDirection * 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            className="absolute inset-0 w-full h-full object-cover"
            alt={`${currentSong.album} artwork`}
            src={currentSong.imageUrl} 
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 glassmorphic">
            <h2 className="text-2xl font-bold mb-2">{currentSong.name}</h2>
            <p className="text-lg text-muted-foreground">{currentSong.artist}</p>
            <p className="text-sm text-muted-foreground">{currentSong.album}</p>
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2"
          onClick={() => handleSwipe("left")}
        >
          <X className="h-8 w-8" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-2"
          onClick={loadInitialRecommendations}
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
