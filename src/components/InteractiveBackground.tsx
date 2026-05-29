'use client';

import { useEffect, useRef } from 'react';

// Golden dust particles rendered on a canvas for buttery smooth perf
export default function MovingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // ── Particle config ──────────────────────────────────────────
    const COUNT = 120;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      r: number;           // radius
      alpha: number;
      alphaDir: number;    // fade in/out
      color: string;
    };

    const GOLD_COLORS = [
      'rgba(255,230,0,',    // #FFE600
      'rgba(255,215,0,',    // gold
      'rgba(255,200,50,',   // warm gold
      'rgba(255,240,100,',  // light gold
      'rgba(200,160,0,',    // dark gold
      'rgba(255,255,200,',  // near-white gold
    ];

    function makeParticle(): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15, // gentle upward drift
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        alphaDir: (Math.random() > 0.5 ? 1 : -1) * 0.003,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
      };
    }

    const particles: Particle[] = Array.from({ length: COUNT }, makeParticle);

    // ── Moving nebula glows ──────────────────────────────────────
    type Glow = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    const GLOWS: Glow[] = [
      { x: w * 0.2,  y: h * 0.3,  vx: 0.15, vy: 0.08, r: w * 0.28, phase: 0 },
      { x: w * 0.75, y: h * 0.7,  vx: -0.12, vy: -0.06, r: w * 0.22, phase: Math.PI },
      { x: w * 0.5,  y: h * 0.15, vx: 0.08,  vy: 0.12, r: w * 0.18, phase: Math.PI / 2 },
    ];

    let t = 0;

    function drawGlow(g: Glow) {
      const px = g.x + Math.sin(t * 0.0008 + g.phase) * 140;
      const py = g.y + Math.cos(t * 0.0006 + g.phase) * 90;
      const grad = ctx!.createRadialGradient(px, py, 0, px, py, g.r);
      grad.addColorStop(0,   'rgba(255,215,0,0.05)');
      grad.addColorStop(0.4, 'rgba(255,180,0,0.025)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(px, py, g.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw() {
      t++;

      // Deep black background
      ctx!.fillStyle = 'rgb(4,4,4)';
      ctx!.fillRect(0, 0, w, h);

      // Nebula glows
      GLOWS.forEach(drawGlow);

      // Tiny star dots (static sparkle layer)
      if (t === 1) {
        // Drawn once into an offscreen buffer — skip for now, handled by particles
      }

      // Golden dust particles
      particles.forEach((p) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;

        // Reverse fade
        if (p.alpha > 0.85) p.alphaDir = -Math.abs(p.alphaDir);
        if (p.alpha < 0.05) p.alphaDir = Math.abs(p.alphaDir);

        // Wrap edges
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Draw as glowing circle
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, p.color + p.alpha + ')');
        grad.addColorStop(1, p.color + '0)');
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();

        // Solid bright center dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + Math.min(p.alpha * 1.8, 1) + ')';
        ctx!.fill();
      });

      // Occasional sparkle flash on random particles
      if (t % 8 === 0) {
        const sp = particles[Math.floor(Math.random() * particles.length)];
        ctx!.save();
        ctx!.globalAlpha = 0.7;
        ctx!.strokeStyle = '#FFE600';
        ctx!.lineWidth = 0.4;
        const size = sp.r * 6;
        // Draw 4-point star
        ctx!.beginPath();
        ctx!.moveTo(sp.x - size, sp.y);
        ctx!.lineTo(sp.x + size, sp.y);
        ctx!.moveTo(sp.x, sp.y - size);
        ctx!.lineTo(sp.x, sp.y + size);
        ctx!.stroke();
        ctx!.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ display: 'block' }}
    />
  );
}
