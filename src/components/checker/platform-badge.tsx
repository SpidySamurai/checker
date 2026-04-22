import { cn } from "@/lib/utils";

const PLATFORMS: Record<string, { bg: string; text: string; label: string }> = {
  uber:    { bg: "bg-black",        text: "text-white",  label: "Uber" },
  didi:    { bg: "bg-orange-500",   text: "text-white",  label: "Didi" },
  cabify:  { bg: "bg-purple-600",   text: "text-white",  label: "Cabify" },
  indrive: { bg: "bg-lime-400",     text: "text-black",  label: "InDrive" },
};

interface PlatformBadgeProps {
  platform: string;
  size?: "sm" | "md";
}

export function PlatformBadge({ platform, size = "md" }: PlatformBadgeProps) {
  const p = PLATFORMS[platform.toLowerCase()] ?? { bg: "bg-slate-400", text: "text-white", label: platform };
  return (
    <span className={cn(
      "inline-flex items-center justify-center font-bold rounded",
      p.bg, p.text,
      size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
    )}>
      {p.label}
    </span>
  );
}
