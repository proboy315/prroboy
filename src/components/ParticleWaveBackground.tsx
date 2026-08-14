import React, { useEffect, useRef } from "react";

interface ParticleWaveBackgroundProps {
  ecoMode?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

export const ParticleWaveBackground: React.FC<ParticleWaveBackgroundProps> = ({ ecoMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (ecoMode) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Color palette for particles and glowing waves
    const colors = [
      "rgba(56, 189, 248, ",   // Cyan
      "rgba(52, 211, 153, ",   // Emerald
      "rgba(192, 132, 252, ",  // Purple
      "rgba(251, 191, 36, "    // Amber
    ];

    let particles: Particle[] = [];
    const particleCount = Math.min(120, Math.floor((width * height) / 12000));

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        const baseAlpha = Math.random() * 0.5 + 0.2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 2.5 + 1,
          alpha: baseAlpha,
          baseAlpha: baseAlpha,
          color: colorPrefix
        });
      }
    }

    initParticles();

    let step = 0;
    let animId: number;

    const render = () => {
      step += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Dark background with subtle gradient
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Radial ambient light follow cursor
      const radGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 600);
      radGrad.addColorStop(0, "rgba(56, 189, 248, 0.08)");
      radGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.04)");
      radGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // Render 3D Flowing Glowing Sine Waves across screen
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const waveColor = colors[w % colors.length];
        ctx.strokeStyle = `${waveColor}0.15)`;
        ctx.lineWidth = 1.8;

        for (let x = 0; x < width; x += 15) {
          const y =
            height / 2 +
            Math.sin(x * 0.003 + step + w * 1.5) * 60 * (w + 1) * 0.5 +
            Math.cos(x * 0.0015 - step * 0.8) * 40 +
            (mouseY - height / 2) * 0.08 * Math.sin(x / width * Math.PI);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Render Particles and Particle Constellation Links
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity boost
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.alpha = Math.min(1, p.baseAlpha + (1 - dist / 180) * 0.6);
        } else {
          p.alpha = p.baseAlpha;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles with glow lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 120) {
            const lineAlpha = (1 - pdist / 120) * 0.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.color}${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [ecoMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
