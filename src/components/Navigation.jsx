import React from "react";
import { motion } from "framer-motion";
import { Home, Heart, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation({ currentPage, setCurrentPage, theme, toggleTheme }) {
  const navItems = [
    { id: "swipe", icon: Home, label: "Swipe" },
    { id: "liked", icon: Heart, label: "Liked" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-16 glassmorphic flex items-center justify-around px-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      {navItems.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant="ghost"
          className={`relative ${
            currentPage === id ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setCurrentPage(id)}
        >
          <Icon className="h-6 w-6" />
          {currentPage === id && (
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 -ml-0.5 w-1 h-1 bg-primary rounded-full"
              layoutId="indicator"
            />
          )}
        </Button>
      ))}

      <Button variant="ghost" onClick={toggleTheme}>
        {theme === "dark" ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </Button>
    </motion.div>
  );
}
