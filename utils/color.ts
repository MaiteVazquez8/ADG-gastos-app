/** Appends an alpha channel to a 6-digit hex color, e.g. "#F97316" -> "#F9731614". */
export function alpha(hex: string, opacity: number): string {
  const octet = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${octet}`;
}