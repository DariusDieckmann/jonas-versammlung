import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number using German locale
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('de-DE');
}

/**
 * Format a date using German locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('de-DE', options);
}

/**
 * Format a date and time using German locale
 */
export function formatDateTime(date: Date | string): string {
    return formatDate(date, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
