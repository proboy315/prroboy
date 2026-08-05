import React, { useEffect, useRef } from "react";

interface CarbonMeshProps {
  ecoMode?: boolean;
}

export const ParticleWaveBackground: React.FC<CarbonMeshProps> = ({ ecoMode = false }) => {
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
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      renderMesh();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Static micro-mesh grid rendering matching dark carbon silk reference image
    const renderMesh = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep matte dark base
      ctx.fillStyle = "#030508";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle diagonal silk sheen gradient
      const sheenGrad = ctx.createLinearGradient(0, 0, width, height);
      sheenGrad.addColorStop(0, "rgba(15, 23, 42, 0.8)");
      sheenGrad.addColorStop(0.35, "rgba(6, 11, 20, 0.95)");
      sheenGrad.addColorStop(0.7, "rgba(10, 16, 28, 0.85)");
      sheenGrad.addColorStop(1, "rgba(3, 5, 8, 0.98)");
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw micro-mesh 3D grid matrix
      const gridSize = 12; // 12px carbon matrix squares
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridSize;
          const y = r * gridSize;

          // Distance from mouse for subtle ambient highlight
          const dx = mouseX - x;
          const dy = mouseY - y;
          const distMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseHighlight = Math.max(0, 1 - distMouse / 350) * 0.12;

          // Diagonal silk curve highlight factor
          const silkFactor = Math.sin((x / width) * 2.5 + (y / height) * 2.5) * 0.04 + 0.02;

          const alpha = Math.min(0.18, silkFactor + mouseHighlight);

          // Render micro carbon square cell outline
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);

          // Tiny center dot on mesh
          if (c % 2 === 0 && r % 2 === 0) {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
            ctx.fillRect(x + gridSize / 2 - 0.5, y + gridSize / 2 - 0.5, 1, 1);
          }
        }
      }
    };

    let animId: number;
    const animate = () => {
      // Very slight mouse interpolation without wave animation
      if (Math.abs(mouseX - targetMouseX) > 0.1 || Math.abs(mouseY - targetMouseY) > 0.1) {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        renderMesh();
      }
      animId = requestAnimationFrame(animate);
    };

    renderMesh();
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [ecoMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-700"
      style={{ opacity: ecoMode ? 0 : 1 }}
    />
  );
};
