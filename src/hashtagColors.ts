// Deterministic color assignment: same hashtag always gets the same color.
// Uses a curated palette of accessible, distinct hues.

import type { TagColor } from './store';

const PALETTE: { bg: string; fg: string; label: string }[] = [
  { bg: '#e3f2fd', fg: '#1565c0', label: 'blue' },
  { bg: '#e8f5e9', fg: '#2e7d32', label: 'green' },
  { bg: '#fff3e0', fg: '#ef6c00', label: 'orange' },
  { bg: '#fce4ec', fg: '#c2185b', label: 'pink' },
  { bg: '#f3e5f5', fg: '#7b1fa2', label: 'purple' },
  { bg: '#e0f7fa', fg: '#00838f', label: 'cyan' },
  { bg: '#fff8e1', fg: '#f9a825', label: 'amber' },
  { bg: '#efebe9', fg: '#5d4037', label: 'brown' },
  { bg: '#e1f5fe', fg: '#0277bd', label: 'light-blue' },
  { bg: '#f1f8e9', fg: '#558b2f', label: 'lime' },
  { bg: '#fbe9e7', fg: '#d84315', label: 'deep-orange' },
  { bg: '#ede7f6', fg: '#512da8', label: 'deep-purple' },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function getContrastColor(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return '#000000';
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 128 ? '#000000' : '#ffffff';
}

export function deriveBgFromFg(fgHex: string): string {
  const rgb = hexToRgb(fgHex);
  if (!rgb) return '#f0f0f0';
  const mix = (c: number) => Math.round(c + (255 - c) * 0.85);
  return `#${mix(rgb.r).toString(16).padStart(2, '0')}${mix(rgb.g).toString(16).padStart(2, '0')}${mix(rgb.b).toString(16).padStart(2, '0')}`;
}

export function colorForTag(
  tag: string,
  customColors?: Record<string, TagColor>
): { bg: string; fg: string; label: string } {
  const key = tag.toLowerCase();
  const custom = customColors?.[key];
  
  if (custom) {
    const { bg, fg } = custom;
    if (bg && fg) {
      return { bg, fg, label: 'custom' };
    } else if (bg) {
      return { bg, fg: getContrastColor(bg), label: 'custom' };
    } else if (fg) {
      return { bg: deriveBgFromFg(fg), fg, label: 'custom' };
    }
  }
  return PALETTE[hash(key) % PALETTE.length];
}
