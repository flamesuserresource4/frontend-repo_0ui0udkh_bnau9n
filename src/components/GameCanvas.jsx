import React, { useEffect, useRef } from 'react';

const colors = {
  floor: '#0b1020',
  wall: '#1b1f36',
  player: '#4ade80',
  enemy: '#ef4444',
  gold: '#f59e0b',
  potion: '#60a5fa',
  ui: '#111827',
};

export default function GameCanvas({
  map,
  tileSize,
  player,
  enemies,
  items,
  onKeyDown,
}) {
  const canvasRef = useRef(null);

  // Focus handler for keyboard
  useEffect(() => {
    const handleKeyDown = (e) => onKeyDown && onKeyDown(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const h = map.length;
    const w = map[0]?.length || 0;

    canvas.width = w * tileSize;
    canvas.height = h * tileSize;

    // Draw background
    ctx.fillStyle = colors.floor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = map[y][x];
        if (t === 1) {
          ctx.fillStyle = colors.wall;
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        } else {
          // Subtle grid
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    // Draw items
    items.forEach((it) => {
      ctx.fillStyle = it.type === 'gold' ? colors.gold : colors.potion;
      const cx = it.x * tileSize + tileSize / 2;
      const cy = it.y * tileSize + tileSize / 2;
      const r = tileSize * 0.25;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw enemies
    enemies.forEach((en) => {
      ctx.fillStyle = colors.enemy;
      ctx.fillRect(
        en.x * tileSize + tileSize * 0.1,
        en.y * tileSize + tileSize * 0.1,
        tileSize * 0.8,
        tileSize * 0.8
      );
    });

    // Draw player
    ctx.fillStyle = colors.player;
    ctx.fillRect(
      player.x * tileSize + tileSize * 0.15,
      player.y * tileSize + tileSize * 0.15,
      tileSize * 0.7,
      tileSize * 0.7
    );

    // Shadow vignette
    const grd = ctx.createRadialGradient(
      player.x * tileSize + tileSize / 2,
      player.y * tileSize + tileSize / 2,
      tileSize * 2,
      player.x * tileSize + tileSize / 2,
      player.y * tileSize + tileSize / 2,
      Math.max(canvas.width, canvas.height)
    );
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [map, tileSize, player, enemies, items]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-2 rounded-xl shadow-2xl">
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-indigo-700/40 shadow-inner"
        role="application"
        aria-label="RPG World"
      />
    </div>
  );
}
