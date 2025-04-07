import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const contractAddress = "0x0E5DB44DD0468f2e9262E46FC7B293081081f357"