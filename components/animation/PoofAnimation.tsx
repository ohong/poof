"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  rotation: number;
}

interface PoofAnimationProps {
  color: string;
  isActive: boolean;
  onComplete: () => void;
  size?: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    // Bias angles upward (-45 to -135 degrees, with some scatter)
    const baseAngle = -90 + (Math.random() - 0.5) * 120;
    // Add some particles that go sideways for variety
    const angle = Math.random() > 0.7
      ? Math.random() * 360
      : baseAngle;

    return {
      id: i,
      x: 20 + Math.random() * 60, // Cluster more toward center
      y: 20 + Math.random() * 60,
      size: Math.random() * 14 + 3, // 3-17px, more variation
      angle,
      distance: Math.random() * 120 + 40, // 40-160px
      delay: Math.random() * 0.15, // Slightly longer stagger
      rotation: (Math.random() - 0.5) * 360, // Random rotation
    };
  });
}

export function PoofAnimation({
  color,
  isActive,
  onComplete,
  size = 100,
}: PoofAnimationProps) {
  // Generate particles once and memoize
  const particles = useMemo(() => generateParticles(28), []);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete();
      }, 900); // Slightly longer for smoother feel
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
                className="absolute"
                style={{
                  backgroundColor: color,
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  borderRadius: particle.size > 10 ? '2px' : '1px',
                }}
                initial={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 0.3,
                  x: targetX,
                  y: targetY,
                  rotate: particle.rotation,
                }}
                transition={{
                  duration: 0.7,
                  delay: particle.delay,
                  ease: [0.23, 1, 0.32, 1], // Smooth deceleration
                  opacity: {
                    duration: 0.5,
                    delay: particle.delay + 0.2, // Fade starts slightly later
                  },
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
