import { Platform } from "@/components/ui/sketch";

interface PlatformBadgeProps {
  platform: string;
  size?: "sm" | "md";
}

export function PlatformBadge({ platform, size = "md" }: PlatformBadgeProps) {
  return <Platform name={platform} size={size === "sm" ? 18 : 24} />;
}
