import { z } from "zod";

// Server-action input schemas. Keep validation here so actions stay thin and
// rules are shared/testable.

const PLATFORMS = ["uber", "didi", "cabify", "indrive"] as const;

export const tripSchema = z.object({
  platform: z.enum(PLATFORMS),
  gross: z.number().positive().max(1_000_000),
  net: z.number().positive().max(1_000_000),
  distance: z.number().min(0).max(100_000).nullable(),
});

export const vehicleSchema = z.object({
  plate: z.string().trim().min(1).max(15),
  make: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(50),
  year: z.number().int().min(1950).max(2100).nullable(),
  color: z.string().trim().max(30).nullable(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  company: z.string().trim().max(100),
});

/** First Zod issue message, or a fallback. */
export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Datos inválidos";
}
