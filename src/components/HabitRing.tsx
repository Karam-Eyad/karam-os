"use client";

import { useEffect, useRef, useState } from "react";

interface HabitRingProps {
  percent: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}

export function HabitRing({
  percent,
  size = 56,
  stroke = 5,
  color = "#4f46e5",
  bg = "var(--surface-2)",
  children,
}: HabitRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const offset = animated
    ? circ - (percent / 100) * circ
    : circ;

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bg}
          strokeWidth={stroke}
        />
        {/* progress arc */}
        <circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
