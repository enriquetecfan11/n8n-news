import React from 'react';
import { BarChart, Bar, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

type Datum = {
  name: string;
  ticker: string;
  pnl: number;
};

interface Props {
  data: Datum[];
}

export default function PnlBarChart({ data }: Props) {
  const height = Math.max(120, data.length * 40);

  return (
    <div className="w-full bg-transparent text-white" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 12, bottom: 8 }}>
          <XAxis
            type="number"
            tickFormatter={(value) => `${value}%`}
            stroke="#cbd5e1"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="ticker"
            stroke="#cbd5e1"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'P&L %']}
            contentStyle={{
              background: '#1e2433',
              border: '1px solid #2a2d3a',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Bar dataKey="pnl" radius={[0, 8, 8, 0]}>
            {data.map((entry) => (
              <Cell key={entry.ticker} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
