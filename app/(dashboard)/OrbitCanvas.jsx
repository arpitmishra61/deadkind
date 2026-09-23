"use client";

import { useEffect, useRef } from "react";
import styles from "./Dashboard.module.css";

// Animated background stars + orbit rings behind the hero model. Ported
// as-is from the original canvas drawing loops; `stageRef` points at the
// .center-stage container both canvases size themselves against.
export default function OrbitCanvas({ stageRef }) {
  const bgCanvasRef = useRef(null);
  const orbitCanvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const bgCanvas = bgCanvasRef.current;
    const orbitCanvas = orbitCanvasRef.current;
    if (!stage || !bgCanvas || !orbitCanvas) return;

    const bgCtx = bgCanvas.getContext("2d");
    const ctx = orbitCanvas.getContext("2d");
    let raf1;
    let raf2;
    let destroyed = false;

    function resize() {
      bgCanvas.width = stage.offsetWidth;
      bgCanvas.height = stage.offsetHeight;
      orbitCanvas.width = stage.offsetWidth;
      orbitCanvas.height = stage.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const bgStars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
    }));

    function drawBgStars() {
      if (destroyed) return;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgStars.forEach((s) => {
        s.phase += s.speed;
        const alpha = (Math.sin(s.phase) * 0.5 + 0.5) * 0.7;
        bgCtx.beginPath();
        bgCtx.arc(s.x * bgCanvas.width, s.y * bgCanvas.height, s.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(255,255,255,${alpha})`;
        bgCtx.fill();
      });
      raf1 = requestAnimationFrame(drawBgStars);
    }
    drawBgStars();

    const NUM_WAVES = 9;
    const waveRings = Array.from({ length: NUM_WAVES }, (_, i) => ({
      baseRx: 0.15 + i * 0.045,
      baseRy: 0.05 + i * 0.014,
      rotAngle: (Math.random() - 0.5) * 0.6,
      waveAmp: 0.012 + Math.random() * 0.018,
      waveFreq: 2 + Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      speed: (0.008 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
      driftPhase: Math.random() * Math.PI * 2,
      driftAmpX: 0.01 + Math.random() * 0.02,
      driftAmpY: 0.008 + Math.random() * 0.015,
      driftSpeed: 0.003 + Math.random() * 0.005,
      alpha: 0.15 + Math.random() * 0.25,
      color: i % 3 === 0 ? [255, 63, 164] : i % 3 === 1 ? [255, 120, 200] : [200, 50, 140],
      stars: Array.from({ length: 4 + Math.floor(Math.random() * 8) }, () => ({
        t: Math.random(),
        r: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
      })),
    }));

    function getRingPoint(ring, t, W, H, cx, cy, time) {
      const a = t * Math.PI * 2;
      const wave = 1 + ring.waveAmp * Math.sin(ring.waveFreq * a + ring.phase + time * Math.abs(ring.speed) * 60);
      const dx = Math.sin(ring.driftPhase + time * ring.driftSpeed) * ring.driftAmpX * W;
      const dy = Math.cos(ring.driftPhase * 1.3 + time * ring.driftSpeed * 0.7) * ring.driftAmpY * H;
      const cosR = Math.cos(ring.rotAngle);
      const sinR = Math.sin(ring.rotAngle);
      const ex = Math.cos(a) * W * ring.baseRx * wave;
      const ey = Math.sin(a) * H * ring.baseRy * wave;
      const rx = ex * cosR - ey * sinR;
      const ry = ex * sinR + ey * cosR;
      return { x: cx + rx + dx, y: cy + H * 0.22 + ry + dy };
    }

    function getAccentRGB() {
      const rgb = getComputedStyle(orbitCanvas).getPropertyValue("--accent-rgb").trim();
      if (rgb) {
        const parts = rgb.split(",").map(Number);
        if (parts.length === 3) return parts;
      }
      return [255, 63, 164];
    }

    let tAnim = 0;
    function drawOrbit() {
      if (destroyed) return;
      ctx.clearRect(0, 0, orbitCanvas.width, orbitCanvas.height);
      const W = orbitCanvas.width;
      const H = orbitCanvas.height;
      const cx = W / 2;
      const cy = H * 0.14;
      const accentColor = getAccentRGB();
      waveRings.forEach((ring) => {
        ring.phase += ring.speed;
        ring.driftPhase += ring.driftSpeed * 0.5;
        const [cr, cg, cb] = ring.color.map((c, i) => Math.round(c * 0.5 + accentColor[i] * 0.5));
        const steps = 80;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const pt = getRingPoint(ring, i / steps, W, H, cx, cy, tAnim);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${ring.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ring.stars.forEach((star) => {
          star.t = (star.t + star.speed * 0.001) % 1;
          star.phase += 0.04;
          const pt = getRingPoint(ring, star.t, W, H, cx, cy, tAnim);
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin(star.phase));
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, star.r * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,220,240,${Math.min(1, ring.alpha * 4 * pulse)})`;
          ctx.fill();
        });
      });
      tAnim += 0.016;
      raf2 = requestAnimationFrame(drawOrbit);
    }
    drawOrbit();

    return () => {
      destroyed = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [stageRef]);

  return (
    <>
      <canvas ref={bgCanvasRef} className={styles.bgStarsCanvas} />
      <canvas ref={orbitCanvasRef} className={styles.orbitCanvas} />
    </>
  );
}
