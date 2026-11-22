export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function darkenHex(hex: string, factor = 0.2): string {
  const clean = (hex || '#000000').replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - factor)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - factor * 1.05)));
  const b = Math.max(0, Math.round((num & 255) * (1 - factor * 1.1)));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function parseAspectRatio(str: string): number | null {
  if (!str || str === 'free') return null;
  const parts = str.split(':').map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  return null;
}
