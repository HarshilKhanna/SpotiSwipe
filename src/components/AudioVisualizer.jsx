
import React from "react";
import { motion } from "framer-motion";

export function AudioVisualizer() {
  return (
    <div className="audio-visualizer mb-4">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="audio-bar"
          animate={{
            height: ["20%", `${Math.random() * 100}%`, "20%"],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
