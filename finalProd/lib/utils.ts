import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const contractAddress = "0xD8B2723de240EDD101988d3cb6B42e3a41B943Ba"