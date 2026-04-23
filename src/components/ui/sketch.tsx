import * as React from "react"
import { cn } from "@/lib/utils"

/* ── Dot ─────────────────────────────────────────────────────── */
interface DotProps {
  size?: number
  filled?: boolean
  children?: React.ReactNode
  className?: string
}

export function Dot({ size = 28, filled, children, className }: DotProps) {
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
      className={cn(
        "rounded-full border-[1.5px] border-ink flex items-center justify-center font-ui font-semibold shrink-0",
        filled ? "bg-ink text-paper" : "bg-paper text-ink",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── Tag ─────────────────────────────────────────────────────── */
interface TagProps {
  dot?: "on" | "off"
  children: React.ReactNode
  className?: string
}

export function Tag({ dot, children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-[1.5px] border-ink rounded-[3px] px-1.5 py-0.5 font-ui text-[11px] font-medium",
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dot === "on" ? "bg-accent-orange" : "bg-muted-sk"
          )}
        />
      )}
      {children}
    </span>
  )
}

/* ── Pill ────────────────────────────────────────────────────── */
interface PillProps {
  accent?: boolean
  full?: boolean
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Pill({ accent, full, size = "md", children, className, onClick }: PillProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border-[1.5px] border-ink rounded-pill font-ui font-semibold box-border",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-3.5 text-xl",
        accent ? "bg-accent-orange text-accent-ink" : "bg-paper text-ink",
        full && "w-full",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── Divider ─────────────────────────────────────────────────── */
interface DividerProps {
  vertical?: boolean
  className?: string
}

export function Divider({ vertical, className }: DividerProps) {
  return (
    <div
      className={cn(
        "bg-ink opacity-20",
        vertical ? "w-px h-full" : "h-px w-full",
        className
      )}
    />
  )
}

/* ── Hatch (placeholder) ─────────────────────────────────────── */
interface HatchProps {
  label?: string
  h?: number
  className?: string
}

export function Hatch({ label, h = 80, className }: HatchProps) {
  return (
    <div
      style={{
        height: h,
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent 0 6px, var(--hatch) 6px 7px)",
      }}
      className={cn(
        "w-full border-[1.5px] border-dashed border-ink flex items-center justify-center font-hand text-xs text-muted-sk",
        className
      )}
    >
      {label}
    </div>
  )
}

/* ── Platform badge ──────────────────────────────────────────── */
const PLATFORMS: Record<string, { bg: string; fg: string; letter: string }> = {
  uber:    { bg: "#000000", fg: "#ffffff", letter: "U" },
  didi:    { bg: "#ff7733", fg: "#ffffff", letter: "D" },
  cabify:  { bg: "#7B4DFF", fg: "#ffffff", letter: "C" },
  indrive: { bg: "#C1F11D", fg: "#000000", letter: "i" },
}

interface PlatformProps {
  name: string
  size?: number
}

export function Platform({ name, size = 22 }: PlatformProps) {
  const p = PLATFORMS[name.toLowerCase()] ?? { bg: "#8a8a84", fg: "#ffffff", letter: name[0] }
  return (
    <div
      style={{ width: size, height: size, background: p.bg, color: p.fg, fontSize: size * 0.55 }}
      className="inline-flex items-center justify-center rounded-[4px] border-[1.5px] border-ink font-ui font-bold shrink-0"
    >
      {p.letter}
    </div>
  )
}

/* ── Annotation (cursive note) ───────────────────────────────── */
interface AnnotationProps {
  children: React.ReactNode
  accent?: boolean
  className?: string
}

export function Annotation({ children, accent, className }: AnnotationProps) {
  return (
    <span
      className={cn(
        "font-hand text-sm",
        accent ? "text-accent-orange" : "text-muted-sk",
        className
      )}
    >
      {children}
    </span>
  )
}
