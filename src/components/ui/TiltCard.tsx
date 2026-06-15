import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // radial highlight color
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(6, 182, 212, 0.15)",
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Position of query inside the bounds representing -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map limits to tilt angle range of -10 to +10 degrees
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  // Smooth springs for buttery premium interaction
  const springConfig = { damping: 25, stiffness: 180, mass: 0.5 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  // Follow coordinate for magnetic cursor glow
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const smoothGlowX = useSpring(glowX, springConfig);
  const smoothGlowY = useSpring(glowY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);

    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const gradientBG = useTransform(
    [smoothGlowX, smoothGlowY],
    ([gx, gy]) =>
      `radial-gradient(350px circle at ${gx}px ${gy}px, ${glowColor}, transparent 80%)`
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        perspective: 1200,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={`relative transition-all duration-300 select-none ${className}`}
      {...props}
    >
      {/* Colorful dynamic reveal outline on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Magnetic spotlight gradient overlay mapping to mouse movement */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: gradientBG,
        }}
      />

      {/* Inner offset with slight elevation */}
      <div 
        style={{ transform: "translateZ(12px)" }} 
        className="w-full h-full relative z-20"
      >
        {children}
      </div>
    </motion.div>
  );
};
