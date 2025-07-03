import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Confetti = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185'][Math.floor(Math.random() * 6)],
        shape: Math.random() > 0.5 ? 'square' : 'circle',
        delay: Math.random() * 0.5
      }));
      
      setParticles(newParticles);
      
      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              width: 8,
              height: 8,
              backgroundColor: particle.color,
              borderRadius: particle.shape === 'circle' ? '50%' : '0%',
            }}
            initial={{
              y: -20,
              x: particle.x,
              rotation: particle.rotation,
              scale: 0,
              opacity: 1
            }}
            animate={{
              y: window.innerHeight + 100,
              x: particle.x + (Math.random() - 0.5) * 200,
              rotation: particle.rotation + 360,
              scale: particle.scale,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: "easeOut",
              opacity: {
                duration: 3,
                times: [0, 0.8, 1]
              }
            }}
            onAnimationComplete={() => {
              // Remove particle after animation
              setParticles(prev => prev.filter(p => p.id !== particle.id));
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Confetti; 