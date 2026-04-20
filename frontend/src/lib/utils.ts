import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ApiErrorBody = {
  title?: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const body = err.response?.data as ApiErrorBody | undefined
    const firstFieldMessage = body?.errors
      ? Object.values(body.errors).flat().find((m) => typeof m === "string" && m.length > 0)
      : undefined
    return firstFieldMessage ?? body?.title ?? err.message ?? fallback
  }
  return fallback
}
