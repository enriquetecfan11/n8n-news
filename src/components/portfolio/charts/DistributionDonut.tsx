import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Datum = {
  type: string;
  value: number;
  color: string;
  pct: string;
};

interface Props {
  data: Datum[];
}

export default function DistributionDonut({ data }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center bg-transparent text-white">
      <div className="h-[280px] w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="type"
              innerRadius={68}
              outerRadius={108}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1e2433',
                border: '1px solid #2a2d3a',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#cbd5e1' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 w-full max-w-[280px]">
        {data.map((item) => (
          <div key={item.type} className="flex items-center justify-between py-1">
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
