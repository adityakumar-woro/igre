'use client';

import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';

const COLOR_GOLD = '#B8935A';
const COLOR_GULF = '#1E3A52';
const COLOR_LINE = 'rgba(14,17,22,0.08)';

const tooltipStyle = {
  backgroundColor: '#0E1116',
  border: 'none',
  borderRadius: 0,
  color: '#F4F1EA',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  padding: '8px 12px',
};

export function EnquiriesByMonthChart({ data }: { data: Array<{ month: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
        <CartesianGrid stroke={COLOR_LINE} vertical={false} />
        <XAxis
          dataKey="month"
          stroke="#6B6B6B"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#6B6B6B"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLOR_LINE }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={COLOR_GOLD}
          strokeWidth={1.5}
          dot={{ fill: COLOR_GOLD, r: 3 }}
          activeDot={{ r: 5 }}
          name="Enquiries"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ListingsByAreaChart({ data }: { data: Array<{ area: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={COLOR_LINE} horizontal={false} />
        <XAxis type="number" stroke="#6B6B6B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="area" stroke="#6B6B6B" fontSize={11} tickLine={false} axisLine={false} width={140} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(14,17,22,0.04)' }} />
        <Bar dataKey="count" fill={COLOR_GULF} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
