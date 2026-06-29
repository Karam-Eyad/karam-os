import React from "react";

type P = React.SVGProps<SVGSVGElement>;
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ChevronDownIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </svg>
);
export const TodayIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const WeekIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
);
export const ProjectsIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
export const TasksIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 1.5-1.5M4 12l1 1 1.5-1.5M4 18l1 1 1.5-1.5" />
  </svg>
);
export const SettingsIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15H3.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 3.6V3.5a2 2 0 1 1 4 0v.09c.66.27 1.18.84 1.51 1.51l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 9h.1a2 2 0 1 1 0 4h-.09c-.27.66-.05 1.41.39 1.92z" />
  </svg>
);
export const PlusIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const TrashIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
);
export const RepeatIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
export const EditIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);
export const LogoutIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);
export const XIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const FireIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 22c4.97 0 9-3.58 9-8 0-3-1.5-5.5-4-7.5 0 2-1 3.5-2.5 4.5C14 9 13 7 13 5c-2 1.5-3 4-3 6.5 0 .5.05 1 .15 1.5C9.05 12.5 8.5 11.5 8.5 10.5c-1.5 1.5-2.5 4-2.5 6 0 3 2.5 5.5 6 5.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const TrendingUpIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M22 7l-8.5 8.5L9 11l-7 7M22 7h-7M22 7v7" />
  </svg>
);
export const AwardIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
export const TargetIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
export const ZapIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
export const BarChartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20V10M6 20V4M18 20v-6" />
  </svg>
);
export const HeartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
export const BookIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
  </svg>
);
export const DropIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
export const BrainIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z" />
  </svg>
);
export const PenIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);
export const MusicIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
  </svg>
);
export const SunriseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4" />
  </svg>
);
export const LeafIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 0 0 1.31 1.44C7.5 19 12 17 15 14s5-5 5-9c0 0-2 1-3 3z" />
    <path d="M3 21s4-2 6-5" />
  </svg>
);
export const DumbbellIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z" />
    <rect x="6" y="9" width="1" height="6" rx="0.5" />
    <rect x="17" y="9" width="1" height="6" rx="0.5" />
    <path d="M9 12h6" />
  </svg>
);
export const StarIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
export const UsersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
export const MessageIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const CopyIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
export const LinkIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
export const UserPlusIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6" />
  </svg>
);
export const RefreshIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
export const LightbulbIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 5 9a7 7 0 0 1 7-7z" />
  </svg>
);
export const SendIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);

export const SkillsIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
export const PlayIcon = (p: P) => (
  <svg {...base} {...p}>
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
  </svg>
);
export const ChevronRightIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const HabitsIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 22c4.97 0 9-3.58 9-8 0-3-1.5-5.5-4-7.5 0 2-1 3.5-2.5 4.5C14 9 13 7 13 5c-2 1.5-3 4-3 6.5 0 .5.05 1 .15 1.5C9.05 12.5 8.5 11.5 8.5 10.5c-1.5 1.5-2.5 4-2.5 6 0 3 2.5 5.5 6 5.5z" />
  </svg>
);

/* ---------- Habit icon map ---------- */

export const HABIT_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  target: TargetIcon,
  fire: FireIcon,
  zap: ZapIcon,
  heart: HeartIcon,
  book: BookIcon,
  drop: DropIcon,
  brain: BrainIcon,
  pen: PenIcon,
  music: MusicIcon,
  sunrise: SunriseIcon,
  leaf: LeafIcon,
  dumbbell: DumbbellIcon,
  star: StarIcon,
  clock: ClockIcon,
  award: AwardIcon,
  trending: TrendingUpIcon,
};

export function HabitIconRenderer({
  icon,
  ...p
}: P & { icon: string }) {
  const Comp = HABIT_ICONS[icon] ?? TargetIcon;
  return <Comp {...p} />;
}
