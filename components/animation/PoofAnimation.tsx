"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  delay: number;
}

interface PoofAnimationProps {
  color: string;
  isActive: boolean;
  onComplete: () => void;
  size?: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 4,
    angle: Math.random() * 360,
    distance: Math.random() * 150 + 50,
    delay: Math.random() * 0.1,
  }));
}

export function PoofAnimation({
  color,
  isActive,
  onComplete,
  size = 100,
}: PoofAnimationProps) {
  const [particles] = useState(() => generateParticles(25));
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive && !showParticles) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ width: size, height: size }}
    >
      <AnimatePresence>
        {showParticles &&
          particles.map((particle) => {
            const radians = (particle.angle * Math.PI) / 180;
            const targetX = Math.cos(radians) * particle.distance;
            const targetY = Math.sin(radians) * particle.distance;

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-sm"
                style={{
                  backgroundColor: color,
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 0.5,
                  x: targetX,
                  y: targetY,
                }}
                transition={{
                  duration: 0.6,
                  delay: particle.delay,
                  ease: [0.32, 0, 0.67, 0],
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
