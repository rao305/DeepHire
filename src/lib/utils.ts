import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import type { ClaimVerdict } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getVerdictColor(verdict: ClaimVerdict): string {
  switch (verdict) {
    case "SUPPORTED":
      return "text-green-700 bg-green-50 border-green-200";
    case "WEAKLY_SUPPORTED":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "UNVERIFIED":
      return "text-gray-700 bg-gray-50 border-gray-200";
    case "CONTRADICTED":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

export function getVerdictLabel(verdict: ClaimVerdict): string {
  switch (verdict) {
    case "SUPPORTED":
      return "Supported";
    case "WEAKLY_SUPPORTED":
      return "Weakly Supported";
    case "UNVERIFIED":
      return "Unverified";
    case "CONTRADICTED":
      return "Contradicted";
    default:
      return "Unknown";
  }
}

export function getScoreLabel(score: number): "Strong" | "Good" | "Weak" | "Poor" {
  if (score >= 0.8) return "Strong";
  if (score >= 0.6) return "Good";
  if (score >= 0.4) return "Weak";
  return "Poor";
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return uuidv4();
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function calculateOverallScore(
  fitScore: number,
  evidenceScore: number,
  shippedWorkScore: number
): number {
  // Configured with standard weighting approach (40/40/20)
  const FIT_WEIGHT = 0.4;
  const EVIDENCE_WEIGHT = 0.4;
  const SHIPPED_WORK_WEIGHT = 0.2;

  return (
    fitScore * FIT_WEIGHT +
    evidenceScore * EVIDENCE_WEIGHT +
    shippedWorkScore * SHIPPED_WORK_WEIGHT
  );
}
