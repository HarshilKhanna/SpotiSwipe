import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Music3 as MusicIcon } from 'lucide-react';
import { getAuthUrl } from "../lib/spotify-auth";
import { checkEnvironment } from "../lib/env-check";
import { DEEZER_CONFIG } from "../lib/deezer-config";

export function LoginPage() {
  useEffect(() => {
    checkEnvironment();
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleDeezerLogin = () => {
    const authUrl = `https://connect.deezer.com/oauth/auth.php?app_id=${DEEZER_CONFIG.appId}&redirect_uri=${encodeURIComponent(DEEZER_CONFIG.redirectUri)}&perms=${DEEZER_CONFIG.scopes.join(',')}`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="floating-notes">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="note"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              rotate: 0,
            }}
            animate={{
              y: -100,
              rotate: 360,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 20,
            }}
          >
            <MusicIcon
              size={24}
              className="text-black/10 dark:text-white/10"
              style={{
                transform: `scale(${0.5 + Math.random()})`,
              }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="z-10 text-center max-w-2xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
          }}
        >
          SpotiSwipe
        </motion.h1>

        <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-base">
          Discover your next favorite song with our intelligent music
          recommendation system. Swipe right to like, left to skip.
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <Button
            onClick={handleSpotifyLogin}
            size="lg"
            className="px-12 py-5 text-lg font-semibold relative overflow-hidden group w-full"
          >
            <motion.div
              className="absolute inset-0 bg-primary/20"
              initial={false}
              whileHover={{
                scale: 1.5,
                opacity: 0,
                transition: { duration: 0.5 },
              }}
            />
            Connect with Spotify
          </Button>

          <Button
            onClick={handleDeezerLogin}
            size="lg"
            variant="outline"
            className="px-12 py-5 text-lg font-semibold relative overflow-hidden group w-full border-[#00C851] text-[#00C851] hover:bg-[#00C851] hover:text-white"
          >
            <motion.div
              className="absolute inset-0 bg-[#00C851]/20"
              initial={false}
              whileHover={{
                scale: 1.5,
                opacity: 0,
                transition: { duration: 0.5 },
              }}
            />
            Connect with Deezer
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
