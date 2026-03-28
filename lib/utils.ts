import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toIsoDate(value: string | Date) {
  return new Date(value).toISOString();
}

export function addDays(baseDate: string | Date, days: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function centsToCurrency(amountCents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export function assertRequired<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value === null || value === undefined || value === "") {
    throw new Error(message);
  }

  return value;
}
