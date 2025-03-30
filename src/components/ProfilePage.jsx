import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getSpotifyApi } from "@/lib/spotify-auth";

export function ProfilePage({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [likedSongs, setLikedSongs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const spotifyApi = getSpotifyApi();
        
        // Get user profile
        const userProfile = await spotifyApi.getMe();
        console.log('User profile:', userProfile);
        setProfile(userProfile);

        // Get liked songs count
        const savedTracks = await spotifyApi.getMySavedTracks({ limit: 1 });
        setLikedSongs(savedTracks.total);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <motion.div
        className="max-w-md mx-auto mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto relative rounded-full overflow-hidden">
            <img 
              className="w-full h-full object-cover"
              alt={profile.display_name}
              src={profile.images?.[0]?.url || "https://via.placeholder.com/150"} 
            />
          </div>

          <h1 className="text-2xl font-bold mt-4">{profile.display_name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>

        <div className="space-y-6">
          <div className="glassmorphic rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">{likedSongs}</p>
                <p className="text-sm text-muted-foreground">Liked Songs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{profile.followers?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
