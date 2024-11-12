import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
