import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import HUD from './components/HUD.jsx';
import ControlBar from './components/ControlBar.jsx';
import EventLog from './components/EventLog.jsx';

const TILE_SIZE = 36;
const MAP_W = 22;
const MAP_H = 14;

function rng(seedRef) {
  // Simple LCG for deterministic map per session
  const a = 1664525, c = 1013904223, m = 2 ** 32;
  seedRef.current = (a * seedRef.current + c) % m;
  return seedRef.current / m;
}

function genMap(seedRef) {
  const map = Array.from({ length: MAP_H }, (_, y) =>
    Array.from({ length: MAP_W }, (_, x) => (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1 ? 1 : 0))
  );
  // Add some rocks
  for (let i = 0; i < 60; i++) {
    const x = 1 + Math.floor(rng(seedRef) * (MAP_W - 2));
    const y = 1 + Math.floor(rng(seedRef) * (MAP_H - 2));
    if (map[y][x] === 0) map[y][x] = 1;
  }
  return map;
}

function emptyAt(map, x, y) {
  return map[y] && map[y][x] === 0;
}

function dist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export default function App() {
  const seedRef = useRef(Date.now() % 1000000);
  const [map] = useState(() => genMap(seedRef));
  const [player, setPlayer] = useState({ x: 2, y: 2, hp: 40, maxHp: 40, xp: 0, level: 1, gold: 0 });
  const [potions, setPotions] = useState(1);
  const [enemies, setEnemies] = useState(() => {
    const list = [];
    let id = 1;
    for (let i = 0; i < 6; i++) {
      let x, y;
      do {
        x = 2 + Math.floor(rng(seedRef) * (MAP_W - 4));
        y = 2 + Math.floor(rng(seedRef) * (MAP_H - 4));
      } while (!emptyAt(map, x, y) || (x === 2 && y === 2));
      list.push({ id: id++, x, y, hp: 12, maxHp: 12 });
    }
    return list;
  });
  const [items, setItems] = useState(() => {
    const arr = [];
    let id = 1;
    for (let i = 0; i < 10; i++) {
      let x, y;
      do {
        x = 1 + Math.floor(rng(seedRef) * (MAP_W - 2));
        y = 1 + Math.floor(rng(seedRef) * (MAP_H - 2));
      } while (!emptyAt(map, x, y) || (x === 2 && y === 2));
      const type = rng(seedRef) > 0.6 ? 'potion' : 'gold';
      const amount = type === 'gold' ? (1 + Math.floor(rng(seedRef) * 10)) * 3 : 1;
      arr.push({ id: id++, x, y, type, amount });
    }
    return arr;
  });
  const [log, setLog] = useState([
    'Selamat datang di Abyssal Realms! Gerakkan tokoh dengan WASD/Arrow, serang dengan Spasi atau tombol Atk.',
  ]);
  const inputLockRef = useRef(false);

  const isBlocked = useCallback(
    (nx, ny) => {
      if (!emptyAt(map, nx, ny)) return true;
      if (enemies.some((e) => e.x === nx && e.y === ny)) return true;
      return false;
    },
    [map, enemies]
  );

  const movePlayer = useCallback(
    (dx, dy) => {
      if (inputLockRef.current) return;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (emptyAt(map, nx, ny)) {
        setPlayer((p) => ({ ...p, x: nx, y: ny }));
        // Pick up items
        setItems((prev) => {
          const idx = prev.findIndex((it) => it.x === nx && it.y === ny);
          if (idx !== -1) {
            const it = prev[idx];
            if (it.type === 'gold') {
              setPlayer((p) => ({ ...p, gold: p.gold + it.amount }));
              setLog((l) => [...l, `Kamu mendapatkan ${it.amount} gold.`]);
            } else if (it.type === 'potion') {
              setPotions((c) => c + 1);
              setLog((l) => [...l, 'Kamu menemukan 1 potion.']);
            }
            const cp = prev.slice();
            cp.splice(idx, 1);
            return cp;
          }
          return prev;
        });
      }
    },
    [player.x, player.y, map]
  );

  const attack = useCallback(() => {
    // Attack adjacent enemy
    const target = enemies.find((e) => dist(e, player) === 1);
    if (!target) {
      setLog((l) => [...l, 'Tidak ada musuh di dekatmu.']);
      return;
    }
    const dmg = 6 + Math.floor(Math.random() * 6);
    setEnemies((prev) =>
      prev
        .map((e) => (e.id === target.id ? { ...e, hp: e.hp - dmg } : e))
        .filter((e) => e.hp > 0)
    );
    setLog((l) => [...l, `Seranganmu mengenai musuh (${dmg} dmg)!`]);
    // Reward on kill
    const killed = target.hp - dmg <= 0;
    if (killed) {
      const gainXp = 20;
      const gainGold = 10 + Math.floor(Math.random() * 10);
      setPlayer((p) => ({ ...p, xp: p.xp + gainXp, gold: p.gold + gainGold }));
      setLog((l) => [...l, `Musuh tumbang! +${gainXp} XP, +${gainGold} gold.`]);
    }
  }, [enemies, player]);

  const onUsePotion = useCallback(() => {
    if (potions <= 0 || player.hp === player.maxHp) return;
    setPotions((p) => p - 1);
    const heal = Math.min(player.maxHp - player.hp, 20);
    setPlayer((p) => ({ ...p, hp: p.hp + heal }));
    setLog((l) => [...l, `Kamu meminum potion (+${heal} HP).`]);
  }, [potions, player.hp, player.maxHp]);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) movePlayer(0, -1);
      else if (['ArrowDown', 'KeyS'].includes(e.code)) movePlayer(0, 1);
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) movePlayer(-1, 0);
      else if (['ArrowRight', 'KeyD'].includes(e.code)) movePlayer(1, 0);
      else if (e.code === 'Space') attack();
    },
    [movePlayer, attack]
  );

  // Enemy AI tick and player XP/level checks
  useEffect(() => {
    const interval = setInterval(() => {
      // Enemy movement
      setEnemies((prev) => {
        return prev.map((en) => {
          // If near the player, step closer
          const dx = Math.sign(player.x - en.x);
          const dy = Math.sign(player.y - en.y);
          let nx = en.x;
          let ny = en.y;
          if (Math.random() < 0.7) {
            // try to move towards
            if (Math.abs(player.x - en.x) + Math.abs(player.y - en.y) > 1) {
              if (Math.abs(dx) > Math.abs(dy)) nx = en.x + dx; else ny = en.y + dy;
            }
          } else {
            // wander
            const dirs = [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ];
            const r = dirs[Math.floor(Math.random() * dirs.length)];
            nx = en.x + r[0];
            ny = en.y + r[1];
          }
          if (emptyAt(map, nx, ny) && !(nx === player.x && ny === player.y) && !prev.some((o) => o.id !== en.id && o.x === nx && o.y === ny)) {
            return { ...en, x: nx, y: ny };
          }
          return en;
        });
      });

      // Enemy attack if adjacent
      const hit = enemies.find((en) => dist(en, player) === 1);
      if (hit) {
        const dmg = 4 + Math.floor(Math.random() * 4);
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - dmg) }));
        setLog((l) => [...l, `Kamu terkena serangan (${dmg} dmg)!`]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [map, player, enemies]);

  // Level up check
  useEffect(() => {
    const need = player.level * 100;
    if (player.xp >= need) {
      setPlayer((p) => ({
        ...p,
        xp: p.xp - need,
        level: p.level + 1,
        maxHp: p.maxHp + 10,
        hp: p.hp + 10,
      }));
      setLog((l) => [...l, 'Naik level! Stats meningkat.']);
    }
  }, [player.xp, player.level]);

  // Game over
  const gameOver = player.hp <= 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="rounded-xl border border-indigo-700/40 bg-slate-900/40 backdrop-blur p-3">
            <HUD player={player} potions={potions} onUsePotion={onUsePotion} />
          </div>
          <div className="rounded-xl border border-indigo-700/40 bg-slate-900/40 backdrop-blur p-2">
            <GameCanvas
              map={map}
              tileSize={TILE_SIZE}
              player={player}
              enemies={enemies}
              items={items}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="rounded-xl border border-indigo-700/40 bg-slate-900/40 backdrop-blur p-3">
            <ControlBar onMove={movePlayer} onAttack={attack} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-indigo-700/40 bg-slate-900/40 backdrop-blur p-4">
            <h2 className="text-lg font-semibold mb-2">Jurnal Petualangan</h2>
            <EventLog log={log} />
          </div>
          <div className="rounded-xl border border-indigo-700/40 bg-slate-900/40 backdrop-blur p-4">
            <h2 className="text-lg font-semibold mb-2">Kontrol</h2>
            <ul className="text-sm text-slate-300 list-disc pl-5 space-y-1">
              <li>Gerak: WASD atau Arrow Keys</li>
              <li>Serang: Spasi atau tombol Atk</li>
              <li>Potion: Klik tombol Potion</li>
            </ul>
          </div>
          {gameOver && (
            <div className="rounded-xl border border-rose-700/40 bg-rose-900/30 backdrop-blur p-4">
              <h2 className="text-lg font-semibold text-rose-300">Game Over</h2>
              <p className="text-sm text-rose-200/80">Pahlawanmu gugur di Abyssal Realms. Muat ulang halaman untuk mencoba lagi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
