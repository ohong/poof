"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

interface Particle {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  rotation: number
  delay: number
  size: number
}

interface PoofAnimationProps {
  imageUrl: string
  isAnimating: boolean
  onComplete: () => void
  width?: number
  height?: number
}

const GRID_SIZE = 5 // 5x5 = 25 particles
const TOTAL_PARTICLES = GRID_SIZE * GRID_SIZE

// Generate particles outside of render (pure function with seed)
function generateParticles(width: number, height: number): Particle[] {
  const newParticles: Particle[] = []
  const particleWidth = width / GRID_SIZE
  const particleHeight = height / GRID_SIZE

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = row * GRID_SIZE + col

      // Calculate random scatter direction and distance
      const angle = Math.random() * Math.PI * 2
      const distance = 150 + Math.random() * 200

      newParticles.push({
        id,
        x: col * particleWidth,
        y: row * particleHeight,
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance,
        rotation: (Math.random() - 0.5) * 360,
        delay: Math.random() * 0.1, // 0-100ms stagger
        size: particleWidth,
      })
    }
  }

  return newParticles
}

export function PoofAnimation({
  imageUrl,
  isAnimating,
  onComplete,
  width = 200,
  height = 200,
}: PoofAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const completedCountRef = useRef(0)
  const hasAnimatedRef = useRef(false)

  // Generate particles when animation starts (effect is intentional for random values)
  useEffect(() => {
    if (isAnimating && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true
      completedCountRef.current = 0
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Animation requires setState on prop change with random values
      setParticles(generateParticles(width, height))
    } else if (!isAnimating) {
      hasAnimatedRef.current = false
      setParticles([])
    }
  }, [isAnimating, width, height])

  // Track completion
  const handleParticleComplete = useCallback(() => {
    completedCountRef.current += 1
    if (completedCountRef.current >= TOTAL_PARTICLES) {
      // Small delay before callback to let the last particle finish visually
      setTimeout(onComplete, 50)
    }
  }, [onComplete])

  if (!isAnimating) {
    return null
  }

  return (
    <div
      className="absolute inset-0 overflow-visible pointer-events-none z-50"
      style={{ width, height }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              x: particle.x + particle.targetX,
              y: particle.y + particle.targetY,
              opacity: 0,
              scale: 0.3,
              rotate: particle.rotation,
            }}
            transition={{
              duration: 0.8,
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for natural feel
            }}
            onAnimationComplete={handleParticleComplete}
            style={{
              position: "absolute",
              width: particle.size,
              height: particle.size,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${width}px ${height}px`,
              backgroundPosition: `-${particle.x}px -${particle.y}px`,
              borderRadius: "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
