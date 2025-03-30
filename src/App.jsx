import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { LoginPage } from "@/components/LoginPage";
import { SwipeInterface } from "@/components/SwipeInterface";
import { LikedSongs } from "@/components/LikedSongs";
import { ProfilePage } from "@/components/ProfilePage";
import { Navigation } from "@/components/Navigation";
import { isAuthenticated, logout } from "./lib/spotify-auth";
import Callback from "@/components/Callback";
import DeezerAuth from './components/DeezerAuth';
import DeezerCallback from './components/DeezerCallback';

function AppContent() {
  const [currentPage, setCurrentPage] = useState("swipe");
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check both Spotify and Deezer authentication
        const spotifyAuth = await isAuthenticated();
        const deezerToken = localStorage.getItem('deezer_access_token');
        const deezerExpiry = localStorage.getItem('deezer_token_expiry');
        const deezerAuth = deezerToken && deezerExpiry && Date.now() < parseInt(deezerExpiry);
        
        setIsAuth(spotifyAuth || deezerAuth);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear both Spotify and Deezer tokens
    logout();
    localStorage.removeItem('deezer_access_token');
    localStorage.removeItem('deezer_token_expiry');
    localStorage.removeItem('deezer_refresh_token');
    setIsAuth(false);
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    document.documentElement.className = theme === "dark" ? "light" : "dark";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={
          isAuth ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        } />
        <Route path="/callback" element={<Callback />} />
        <Route path="/dashboard" element={
          isAuth ? (
            <>
              <AnimatePresence mode="wait">
                {currentPage === "swipe" && <SwipeInterface key="swipe" />}
                {currentPage === "liked" && <LikedSongs key="liked" />}
                {currentPage === "profile" && <ProfilePage key="profile" onLogout={handleLogout} />}
              </AnimatePresence>
              <Navigation
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/login" element={<DeezerAuth />} />
        <Route path="/deezer-callback" element={<DeezerCallback />} />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
