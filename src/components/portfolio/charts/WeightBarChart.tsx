import React from 'react';

type Datum = {
  name: string;
  ticker: string;
  weight: number;
};

interface Props {
  data: Datum[];
}

export default function WeightBarChart({ data }: Props) {
  return (
    <div className="w-full bg-transparent text-white">
      <div className="space-y-2">
        {data.map((entry) => {
          const pct = Math.max(0, Math.min(100, entry.weight));
          return (
            <div key={entry.ticker} className="rounded-xl border border-slate-700/70 bg-white/5 px-3 py-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{entry.name}</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{entry.ticker}</div>
                </div>
                <div className="font-mono text-sm font-semibold text-white">{pct.toFixed(1)}%</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
