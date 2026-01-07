/**
 * cn (classNames) - Tailwind CSS utility
 * Combines clsx and tailwind-merge for optimal className handling
 *
 * Usage: cn('text-red-500', condition && 'bg-blue-500', { 'font-bold': isActive })
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
