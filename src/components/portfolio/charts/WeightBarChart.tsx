import React from 'react';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

type Datum = {
  name: string;
  ticker: string;
  weight: number;
};

interface Props {
  data: Datum[];
}

export default function WeightBarChart({ data }: Props) {
  const height = Math.max(120, data.length * 40);

  return (
    <div className="w-full bg-transparent text-white" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 12, bottom: 8 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            domain={[0, 100]}
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
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Peso']}
            contentStyle={{
              background: '#1e2433',
              border: '1px solid #2a2d3a',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Bar dataKey="weight" radius={[0, 8, 8, 0]} fill="url(#weightGradient)">
            {data.map((entry) => (
              <Cell key={entry.ticker} fill="url(#weightGradient)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
