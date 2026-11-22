import type { ReflectionStyle, TopDetailType } from '../types/facade';
import { r2 } from './colorUtils';

export interface GlassPaneInput {
  x: number;
  y: number;
  width: number;
  height: number;
  clipId: string;
  glassColor: string;
  reflectionColor: string;
  reflectionStyle: ReflectionStyle;
  strokeColor: string;
  strokeWidth?: number;
}

/**
 * Renderiza uma folha de vidro individual com <clipPath> exclusivo para conter reflexos.
 */
export function renderGlassPane(input: GlassPaneInput): { def: string; markup: string } {
  const px = r2(input.x);
  const py = r2(input.y);
  const rpw = r2(input.width);
  const rph = r2(input.height);
  const strokeW = input.strokeWidth ?? 1.9;

  const def = `<clipPath id="${input.clipId}"><rect x="${px}" y="${py}" width="${rpw}" height="${rph}" /></clipPath>`;
  const parts: string[] = [
    `<rect x="${px}" y="${py}" width="${rpw}" height="${rph}" fill="${input.glassColor}" />`
  ];

  if (input.reflectionStyle !== 'none') {
    parts.push(`<g clip-path="url(#${input.clipId})">`);
    if (input.reflectionStyle === 'diagonal_classic') {
      const p1 = `${r2(px - rpw * 0.15)},${r2(py + rph * 0.92)} ${r2(px + rpw * 1.1)},${r2(py + rph * 0.12)} ${r2(px + rpw * 1.1)},${r2(py + rph * 0.44)} ${r2(px - rpw * 0.15)},${r2(py + rph * 1.24)}`;
      const p2 = `${r2(px - rpw * 0.15)},${r2(py + rph * 0.56)} ${r2(px + rpw * 0.85)},${r2(py - rph * 0.12)} ${r2(px + rpw * 1.0)},${r2(py - rph * 0.02)} ${r2(px - rpw * 0.15)},${r2(py + rph * 0.72)}`;
      parts.push(`<polygon points="${p1}" fill="${input.reflectionColor}" opacity="0.92" />`);
      parts.push(`<polygon points="${p2}" fill="${input.reflectionColor}" opacity="0.55" />`);
    } else if (input.reflectionStyle === 'double') {
      const b1 = `${r2(px - 4)},${r2(py + rph * 0.65)} ${r2(px + rpw * 0.75)},${r2(py - 4)} ${r2(px + rpw * 1.02)},${r2(py - 4)} ${r2(px - 4)},${r2(py + rph * 0.92)}`;
      const b2 = `${r2(px + rpw * 0.2)},${r2(py + rph + 4)} ${r2(px + rpw + 4)},${r2(py + rph * 0.25)} ${r2(px + rpw + 4)},${r2(py + rph * 0.48)} ${r2(px + rpw * 0.44)},${r2(py + rph + 4)}`;
      parts.push(`<polygon points="${b1}" fill="${input.reflectionColor}" opacity="0.88" />`);
      parts.push(`<polygon points="${b2}" fill="${input.reflectionColor}" opacity="0.6" />`);
    } else if (input.reflectionStyle === 'soft') {
      const softPoly = `${px},${py} ${r2(px + rpw)},${py} ${r2(px + rpw)},${r2(py + rph * 0.35)} ${px},${r2(py + rph * 0.72)}`;
      parts.push(`<polygon points="${softPoly}" fill="${input.reflectionColor}" opacity="0.45" />`);
    }
    parts.push(`</g>`);
  }

  parts.push(
    `<rect x="${px}" y="${py}" width="${rpw}" height="${rph}" fill="none" stroke="${input.strokeColor}" stroke-width="${strokeW}" />`
  );

  return { def, markup: parts.join('\n') };
}

/**
 * Renderiza o acabamento arquitetônico superior (verga, frontão ou arco c/ pedra-chave).
 */
export function renderTopOrnament(params: {
  topDetail: TopDetailType;
  wx: number;
  wy: number;
  width: number;
  detailScale: number;
  detailColor: string;
  detailFrieze: string;
  strokeColor: string;
  extraOverhang?: number;
  strokeWidth?: number;
}): string[] {
  const {
    topDetail,
    wx,
    wy,
    width: w,
    detailScale: ds,
    detailColor,
    detailFrieze,
    strokeColor,
    extraOverhang = 0,
    strokeWidth
  } = params;
  const parts: string[] = [];
  const detStroke = strokeWidth ?? 2.4;

  if (topDetail === 'lintel_flat') {
    const lh = r2(7 * ds);
    const ov = r2(4 * ds + extraOverhang);
    parts.push(
      `<rect x="${r2(wx - ov)}" y="${r2(wy - lh + 1)}" width="${r2(w + ov * 2)}" height="${lh}" rx="1.5" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  } else if (topDetail === 'lintel_cornice') {
    const friezeH = r2(4.5 * ds);
    const capH = r2(6.5 * ds);
    const ovF = r2(3 * ds + extraOverhang);
    const ovC = r2(7 * ds + extraOverhang);
    parts.push(
      `<rect x="${r2(wx - ovF)}" y="${r2(wy - friezeH + 1)}" width="${r2(w + ovF * 2)}" height="${friezeH}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
    parts.push(
      `<rect x="${r2(wx - ovC)}" y="${r2(wy - friezeH - capH + 1)}" width="${r2(w + ovC * 2)}" height="${capH}" rx="1.5" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  } else if (topDetail === 'pediment') {
    const baseH = r2(5 * ds);
    const peakH = r2(13 * ds);
    const ov = r2(7 * ds + extraOverhang);
    const baseY = r2(wy - baseH + 1);
    const midX = r2(wx + w / 2);
    parts.push(
      `<polygon points="${r2(wx - ov)},${baseY} ${midX},${r2(baseY - peakH)} ${r2(wx + w + ov)},${baseY}" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
    parts.push(
      `<polygon points="${r2(wx + 4)},${r2(baseY - 2)} ${midX},${r2(baseY - peakH + 5)} ${r2(wx + w - 4)},${r2(baseY - 2)}" fill="none" stroke="${detailFrieze}" stroke-width="1.5" />`
    );
    parts.push(
      `<rect x="${r2(wx - ov + 1)}" y="${baseY}" width="${r2(w + (ov - 1) * 2)}" height="${baseH}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  } else if (topDetail === 'arch') {
    const archH = r2(11 * ds);
    const ov = r2(3.5 * ds + extraOverhang);
    const ax1 = r2(wx - ov);
    const ax2 = r2(wx + w + ov);
    const ay = r2(wy + 1);
    const midX = r2(wx + w / 2);
    parts.push(
      `<path d="M ${ax1} ${ay} Q ${midX} ${r2(ay - archH * 1.45)} ${ax2} ${ay} Z" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
    const kw = r2(6 * ds);
    const kh = r2(9 * ds);
    parts.push(
      `<polygon points="${r2(midX - kw * 0.65)},${r2(ay - archH * 0.95)} ${r2(midX + kw * 0.65)},${r2(ay - archH * 0.95)} ${r2(midX + kw * 0.45)},${r2(ay - archH * 0.95 + kh)} ${r2(midX - kw * 0.45)},${r2(ay - archH * 0.95 + kh)}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="2" />`
    );
  }

  return parts;
}
