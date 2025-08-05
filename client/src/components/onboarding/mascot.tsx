import React from "react";
import { motion } from "framer-motion";

interface MascotProps {
  emotion?: "happy" | "excited" | "thinking" | "waving";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

export function Mascot({ emotion = "happy", size = "medium", onClick }: MascotProps) {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 160
  };

  const mascotSize = sizeMap[size];

  const emotionVariants = {
    happy: {
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
    },
    excited: {
      y: [0, -10, 0],
      rotate: [0, -10, 10, -10, 0],
      transition: { duration: 0.5, repeat: Infinity }
    },
    thinking: {
      rotate: [0, -2, 2, -2, 0],
      transition: { duration: 4, repeat: Infinity }
    },
    waving: {
      rotate: [0, -15, 15, -15, 0],
      transition: { duration: 1, repeat: 3 }
    }
  };

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ width: mascotSize, height: mascotSize }}
      animate={emotionVariants[emotion]}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Mascot Body - Conductor Baton Shape */}
      <svg
        width={mascotSize}
        height={mascotSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse
          cx="60"
          cy="110"
          rx="25"
          ry="5"
          fill="#000000"
          opacity="0.1"
        />
        
        {/* Baton Handle */}
        <rect
          x="55"
          y="40"
          width="10"
          height="50"
          rx="5"
          fill="#3d1700"
        />
        
        {/* Baton Tip */}
        <circle
          cx="60"
          cy="35"
          r="8"
          fill="#c85a3a"
        />
        
        {/* Mascot Body (Round) */}
        <circle
          cx="60"
          cy="70"
          r="30"
          fill="#c85a3a"
        />
        
        {/* Face Background */}
        <circle
          cx="60"
          cy="70"
          r="25"
          fill="#ffffff"
        />
        
        {/* Eyes */}
        <circle cx="50" cy="65" r="3" fill="#3d1700" />
        <circle cx="70" cy="65" r="3" fill="#3d1700" />
        
        {/* Sparkle in eyes */}
        <circle cx="51" cy="64" r="1" fill="#ffffff" />
        <circle cx="71" cy="64" r="1" fill="#ffffff" />
        
        {/* Mouth based on emotion */}
        {emotion === "happy" && (
          <path
            d="M 45 75 Q 60 85 75 75"
            stroke="#3d1700"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {emotion === "excited" && (
          <ellipse
            cx="60"
            cy="78"
            rx="8"
            ry="6"
            fill="#3d1700"
          />
        )}
        {emotion === "thinking" && (
          <path
            d="M 50 75 L 70 75"
            stroke="#3d1700"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {emotion === "waving" && (
          <path
            d="M 45 75 Q 60 85 75 75"
            stroke="#3d1700"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        
        {/* Musical notes floating around */}
        <motion.g
          animate={{
            y: [-5, -15, -5],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0
          }}
        >
          <text x="85" y="50" fontSize="12" fill="#c85a3a">♪</text>
        </motion.g>
        <motion.g
          animate={{
            y: [-5, -15, -5],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1
          }}
        >
          <text x="25" y="60" fontSize="14" fill="#c85a3a">♫</text>
        </motion.g>
      </svg>
      
      {/* Interaction hint */}
      {onClick && (
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Click me!
        </motion.div>
      )}
    </motion.div>
  );
}