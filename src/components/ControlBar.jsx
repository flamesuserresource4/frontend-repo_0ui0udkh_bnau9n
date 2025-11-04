import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sword } from 'lucide-react';

export default function ControlBar({ onMove, onAttack }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto select-none">
      <div />
      <ControlButton onClick={() => onMove(0, -1)} label="Up" icon={<ArrowUp size={18} />} />
      <div />
      <ControlButton onClick={() => onMove(-1, 0)} label="Left" icon={<ArrowLeft size={18} />} />
      <ControlButton onClick={() => onAttack()} label="Atk" icon={<Sword size={18} />} className="bg-rose-600 hover:bg-rose-500 border-rose-400/30" />
      <ControlButton onClick={() => onMove(1, 0)} label="Right" icon={<ArrowRight size={18} />} />
      <div />
      <ControlButton onClick={() => onMove(0, 1)} label="Down" icon={<ArrowDown size={18} />} />
      <div />
    </div>
  );
}

function ControlButton({ onClick, label, icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2 rounded-md bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/40 text-slate-100 shadow ${className}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
