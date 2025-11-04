import React, { useEffect, useRef } from 'react';

export default function EventLog({ log }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg p-2 h-28 overflow-y-auto text-slate-200 text-xs leading-relaxed">
      {log.map((l, i) => (
        <div key={i} className="opacity-90">{l}</div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
