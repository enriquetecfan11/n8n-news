import React from 'react';

type Datum = {
  type: string;
  value: number;
  color: string;
  pct: string;
};

interface Props {
  data: Datum[];
  compact?: boolean;
}

export default function DistributionDonut({ data, compact = false }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = compact ? 220 : 280;
  const strokeWidth = compact ? 26 : 32;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex w-full flex-col items-center text-white">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          {data.map((entry) => {
            const portion = total > 0 ? entry.value / total : 0;
            const dash = circumference * portion;
            const ring = (
              <circle
                key={entry.type}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={entry.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return ring;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Distribución</div>
          <div className="mt-1 font-mono text-lg font-bold text-white">
            {total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
      <div className={compact ? 'mt-2 w-full max-w-[220px]' : 'mt-3 w-full max-w-[280px]'}>
        {data.map((item) => (
          <div key={item.type} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-sm capitalize text-slate-300">{item.type}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-white">{item.pct}%</span>
              <span className="ml-2 text-xs text-slate-500">{item.value} €</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
