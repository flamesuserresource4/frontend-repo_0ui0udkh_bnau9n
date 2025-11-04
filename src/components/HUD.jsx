import React from 'react';
import { Heart, Coins, Sword, FlaskConical } from 'lucide-react';

export default function HUD({ player, potions, onUsePotion }) {
  const hpPct = Math.max(0, Math.min(100, Math.round((player.hp / player.maxHp) * 100)));
  const nextLevelXp = player.level * 100;
  const xpPct = Math.max(0, Math.min(100, Math.round((player.xp / nextLevelXp) * 100)));

  return (
    <div className="w-full flex flex-col gap-2 text-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/60 rounded px-2 py-1 border border-slate-700/50">
            <Sword size={16} className="text-indigo-300" />
            <span className="text-sm">Lv {player.level}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/60 rounded px-2 py-1 border border-slate-700/50">
            <Coins size={16} className="text-amber-300" />
            <span className="text-sm">{player.gold}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUsePotion}
            disabled={potions <= 0 || player.hp === player.maxHp}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 px-3 py-1.5 rounded-md shadow border border-indigo-400/30"
          >
            <FlaskConical size={16} />
            <span className="text-sm">Potion x{potions}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Bar label="HP" icon={<Heart size={14} className="text-rose-300" />} value={hpPct} color="bg-rose-500" detail={`${player.hp}/${player.maxHp}`} />
        <Bar label="XP" value={xpPct} color="bg-indigo-500" detail={`${player.xp}/${nextLevelXp}`} />
      </div>
    </div>
  );
}

function Bar({ label, icon, value, color, detail }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-300 mb-1">
        <div className="flex items-center gap-1">{icon}{label}</div>
        <div className="tabular-nums">{detail}</div>
      </div>
      <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden">
        <div className={`${color} h-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
