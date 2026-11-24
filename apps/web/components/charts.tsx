"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_COLORS = ["#228b84", "#315fa0", "#d29b37", "#8a5bb5", "#c2453b"];
const axis = { fontSize: 12, fill: "#5c6878" };

/** Proficiency over quiz attempts. One line per series key. */
export function ProficiencyChart({
  data,
  series,
  height = 240,
}: {
  data: Record<string, string | number | null>[];
  series: { key: string; name: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="#eef1f5" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: "#e2e7ee" }} />
        <YAxis domain={[0, 100]} tick={axis} tickLine={false} axisLine={false} unit="%" />
        <Tooltip formatter={(v) => `${v}%`} />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Stacked quadrant counts per attempt. */
export function QuadrantTrendChart({ data, height = 240 }: { data: Record<string, string | number>[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -24 }} barSize={28}>
        <CartesianGrid stroke="#eef1f5" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: "#e2e7ee" }} />
        <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="mastery" name="Mastery" stackId="q" fill="#2f8f5b" isAnimationActive={false} />
        <Bar dataKey="doubt" name="Doubt" stackId="q" fill="#d29b37" isAnimationActive={false} />
        <Bar dataKey="uninformed" name="Uninformed" stackId="q" fill="#8a94a3" isAnimationActive={false} />
        <Bar dataKey="misinformed" name="Misinformed" stackId="q" fill="#c2453b" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Time taken vs ideal time per question. */
export function TimeVsIdealChart({ data, height = 240 }: { data: { label: string; taken: number; ideal: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }} barGap={2}>
        <CartesianGrid stroke="#eef1f5" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: "#e2e7ee" }} />
        <YAxis tick={axis} tickLine={false} axisLine={false} unit="s" />
        <Tooltip formatter={(v) => `${v}s`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ideal" name="Ideal time" fill="#c9d3e2" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="taken" name="Your time" fill="#228b84" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
