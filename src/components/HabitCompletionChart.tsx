"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

interface DayPoint {
  date: string; // YYYY-MM-DD
  total: number;
  done: number;
}

interface HabitCompletionChartProps {
  data: DayPoint[];
}

export function HabitCompletionChart({ data }: HabitCompletionChartProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const W = 600;
  const H = 140;
  const padX = 12;
  const padY = 16;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const points = data.map((d, i) => {
    const pct = d.total > 0 ? d.done / d.total : 0;
    const x = padX + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padY + (1 - pct) * chartH;
    return { x, y, pct, ...d };
  });

  // Build smooth bezier path
  function buildPath(pts: typeof points) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  // Build area fill path
  function buildArea(pts: typeof points) {
    if (pts.length < 2) return "";
    const line = buildPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L ${last.x} ${H - padY} L ${first.x} ${H - padY} Z`;
  }

  const linePath = buildPath(points);
  const areaPath = buildArea(points);
  const pathLength = 1200; // approximate for animation

  // Format date label
  const formatLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Show every ~7th label
  const labelIndices = points
    .map((_, i) => i)
    .filter((i) => i % 7 === 0 || i === points.length - 1);

  return (
    <div ref={containerRef} className="rounded-xl border border-border bg-surface p-4">
      <p className="eyebrow mb-3">{t.last30Days}</p>
      <div className="relative overflow-hidden" style={{ paddingBottom: "calc(140/600 * 100%)" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <clipPath id="chart-clip">
              <rect x={padX} y={0} width={chartW} height={H} />
            </clipPath>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padY + (1 - pct / 100) * chartH;
            return (
              <line
                key={pct}
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="var(--border)"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Area fill */}
          {visible && (
            <path
              d={areaPath}
              fill="url(#area-grad)"
              clipPath="url(#chart-clip)"
              className="animate-fade-in"
            />
          )}

          {/* Line */}
          {visible && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: 0,
                animation: `draw 1.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
              }}
              clipPath="url(#chart-clip)"
            />
          )}

          {/* Data points */}
          {visible &&
            points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 5 : 3}
                  fill={pt.done > 0 ? "var(--primary)" : "var(--border-strong)"}
                  stroke="var(--surface)"
                  strokeWidth={1.5}
                  style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {hoveredIndex === i && (
                  <g>
                    <rect
                      x={Math.min(pt.x - 24, W - 60)}
                      y={pt.y - 32}
                      width={52}
                      height={22}
                      rx={4}
                      fill="var(--foreground)"
                    />
                    <text
                      x={Math.min(pt.x - 24, W - 60) + 26}
                      y={pt.y - 17}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--background)"
                      fontWeight="600"
                    >
                      {Math.round(pt.pct * 100)}%
                    </text>
                  </g>
                )}
              </g>
            ))}

          {/* X-axis labels */}
          {labelIndices.map((i) => {
            const pt = points[i];
            return (
              <text
                key={i}
                x={pt.x}
                y={H - 2}
                textAnchor="middle"
                fontSize={7}
                fill="var(--muted)"
              >
                {formatLabel(data[i].date)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
