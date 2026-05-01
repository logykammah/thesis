/** Consultation-only visual simulation applied to the lower smile band (not clinical imaging). */

export const SMILE_PREVIEW_PROCEDURES = [
  'Teeth Whitening',
  'Veneers',
  'Braces / Alignment Preview',
  'Gum Contouring',
  'Dental Crown',
  'Dental Implant Preview',
];

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'avif', 'tif', 'tiff']);

function clamp255(x) {
  return Math.max(0, Math.min(255, Math.round(x)));
}

function extensionLooksLikeImage(fileName) {
  const ext = (fileName?.split('.').pop() || '').toLowerCase();
  return IMAGE_EXT.has(ext);
}

/** Accept common phone uploads where MIME is empty or wrong. */
export function isLikelyImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  if ((!file.type || file.type === 'application/octet-stream') && extensionLooksLikeImage(file.name)) return true;
  return false;
}

const MAX_SIDE = 4096;

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        /* decode optional */
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error('DECODE'));
    img.src = url;
  });
}

/**
 * Returns drawable (ImageBitmap or HTMLImageElement) and whether it must be closed.
 * @param {string | File | Blob} source
 */
async function decodeDrawable(source) {
  if (typeof source === 'object' && source !== null && typeof source.arrayBuffer === 'function') {
    try {
      const bmp = await createImageBitmap(source);
      return { drawable: bmp, isBitmap: true };
    } catch {
      const objUrl = URL.createObjectURL(source);
      try {
        const img = await loadImageFromUrl(objUrl);
        return { drawable: img, isBitmap: false };
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    }
  }
  if (typeof source === 'string') {
    try {
      const blob = await fetch(source).then((r) => r.blob());
      const bmp = await createImageBitmap(blob);
      return { drawable: bmp, isBitmap: true };
    } catch {
      const img = await loadImageFromUrl(source);
      return { drawable: img, isBitmap: false };
    }
  }
  throw new Error('DECODE');
}

function drawableSize(drawable, isBitmap) {
  if (isBitmap) return { w: drawable.width, h: drawable.height };
  return { w: drawable.naturalWidth, h: drawable.naturalHeight };
}

/**
 * @param {string | File | Blob} source data URL, File, or Blob
 * @param {string} procedure one of SMILE_PREVIEW_PROCEDURES
 * @returns {Promise<string>} jpeg (or png) data URL
 */
export async function applySmilePreviewEffect(source, procedure) {
  let drawable;
  let isBitmap = false;
  try {
    const decoded = await decodeDrawable(source);
    drawable = decoded.drawable;
    isBitmap = decoded.isBitmap;
  } catch {
    throw new Error('DECODE');
  }

  try {
    let { w: w0, h: h0 } = drawableSize(drawable, isBitmap);
    if (w0 < 2 || h0 < 2) {
      throw new Error('SMALL');
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(w0, h0));
    const w = Math.max(2, Math.floor(w0 * scale));
    const h = Math.max(2, Math.floor(h0 * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('NO_CTX');
    }
    ctx.drawImage(drawable, 0, 0, w, h);

    /*
     * Full-frame edit: tight “mouth only” crops fill the frame — a bottom band skipped the teeth.
     * Weight peaks at image center (typical bite plane) and stays ≥ ~0.35 at edges so close-ups still change.
     */
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;
    const bw = w;
    const bh = h;

    function smileWeight(px, py) {
      const nx = (px / bw - 0.5) * 2;
      const ny = (py / bh - 0.5) * 2;
      const dist = Math.sqrt(nx * nx + ny * ny) / 1.2;
      const fromCenter = Math.max(0, Math.min(1, 1.05 - dist * 0.45));
      const horiz = Math.pow(1 - Math.abs(px - bw / 2) / Math.max(1, bw / 2), 0.9);
      return Math.max(0.38, Math.min(1, fromCenter * 0.72 + horiz * 0.38));
    }

    function luminance(rr, gg, bb) {
      return 0.299 * rr + 0.587 * gg + 0.114 * bb;
    }

    /** Softer on lips / pink gum so we don’t paint a white veil over them. */
    function tissueAttenuation(rr, gg, bb) {
      const lip = rr > gg * 1.1 && rr > bb * 1.05 && rr > 65 && gg > 35;
      if (lip) return 0.38;
      const pinkGum = gg > rr * 0.98 && gg > bb * 1.02 && rr > 40 && luminance(rr, gg, bb) < 175;
      if (pinkGum) return 0.5;
      return 1;
    }

    /** How much this pixel behaves like “enamel” (dark / neutral) vs highlight. */
    function enamelFocus(lumLocal) {
      if (lumLocal < 55) return 1;
      if (lumLocal > 210) return 0.22;
      return 0.35 + (0.65 * (210 - lumLocal)) / 155;
    }

    function liftChannel(v, gamma, add) {
      const n = Math.max(0, Math.min(1, v / 255));
      const curved = Math.pow(n, gamma) * 255;
      return clamp255(curved + add);
    }

    for (let py = 0; py < bh; py++) {
      for (let px = 0; px < bw; px++) {
        const i = (py * bw + px) * 4;
        const oR = d[i];
        const oG = d[i + 1];
        const oB = d[i + 2];
        let r = oR;
        let g = oG;
        let b = oB;
        const relY = py / Math.max(1, bh);
        const cx = Math.abs(px - bw / 2) / Math.max(1, bw / 2);
        const wgt = smileWeight(px, py);
        const lum = luminance(r, g, b);
        const shadow = (255 - lum) / 255;

        switch (procedure) {
          case 'Teeth Whitening': {
            const att = tissueAttenuation(r, g, b);
            const focus = enamelFocus(lum) * att;
            const str = wgt * focus * (0.42 + 0.38 * shadow);
            const gamma = Math.max(0.72, 1 - str * 0.28);
            const add = str * 28;
            r = liftChannel(r, gamma, add);
            g = liftChannel(g, gamma, add * 0.95);
            b = liftChannel(b, gamma, add * 1.05);
            const desat = 0.06 * str;
            const avg = (r + g + b) / 3;
            r = clamp255(r * (1 - desat) + avg * desat);
            g = clamp255(g * (1 - desat) + avg * desat);
            b = clamp255(b * (1 - desat * 0.5) + avg * (desat * 0.5));
            const keep = 0.48 + 0.22 * (1 - str);
            r = clamp255(r * (1 - keep) + oR * keep);
            g = clamp255(g * (1 - keep) + oG * keep);
            b = clamp255(b * (1 - keep) + oB * keep);
            break;
          }
          case 'Veneers': {
            /* Natural-looking consultation preview: lift shadows + warm enamel tint, keep texture (no white fog). */
            const att = tissueAttenuation(r, g, b);
            const focus = enamelFocus(lum) * att;
            const str = Math.min(0.58, wgt * focus * (0.38 + 0.45 * shadow));

            const gamma = Math.max(0.68, 1 - str * 0.32);
            const add = str * 32;
            r = liftChannel(r, gamma, add);
            g = liftChannel(g, gamma, add * 0.96);
            b = liftChannel(b, gamma, add * 0.92);

            const er = 234;
            const eg = 226;
            const eb = 218;
            const warm = str * 0.2;
            r = clamp255(r * (1 - warm) + er * warm);
            g = clamp255(g * (1 - warm) + eg * warm);
            b = clamp255(b * (1 - warm) + eb * warm);

            const keep = 0.52 + 0.18 * (1 - str);
            r = clamp255(r * (1 - keep) + oR * keep);
            g = clamp255(g * (1 - keep) + oG * keep);
            b = clamp255(b * (1 - keep) + oB * keep);
            break;
          }
          case 'Braces / Alignment Preview': {
            const t = wgt * (0.32 + 0.4 * shadow);
            r = clamp255(r * (1 + 0.14 * t) + 22 * t);
            g = clamp255(g * (1 + 0.14 * t) + 22 * t);
            b = clamp255(b * (1 + 0.16 * t) + 24 * t);
            const bandRow = py % 14 < 3;
            if (bandRow && cx < 0.9 && relY > 0.1 && relY < 0.94) {
              r = clamp255(r * 0.8 + 78 * wgt);
              g = clamp255(g * 0.82 + 80 * wgt);
              b = clamp255(b * 0.84 + 82 * wgt);
            }
            break;
          }
          case 'Gum Contouring':
            if (relY > 0.52) {
              const t = wgt * (0.45 + 0.35 * shadow);
              r = clamp255(r * (1 + 0.2 * t) + 26 * t);
              g = clamp255(g * (1 - 0.1 * t) + 8 * t);
              b = clamp255(b * (1 - 0.07 * t) + 10 * t);
            } else {
              const t = wgt * 0.28;
              r = clamp255(r * (1 + 0.1 * t) + 14 * t);
              g = clamp255(g * (1 + 0.05 * t) + 10 * t);
              b = clamp255(b * (1 + 0.05 * t) + 10 * t);
            }
            break;
          case 'Dental Crown':
            if (cx < 0.58 && relY > 0.1 && relY < 0.92) {
              const t = wgt * (0.42 + 0.45 * shadow);
              r = clamp255(r * (1 + 0.26 * t) + 48 * t);
              g = clamp255(g * (1 + 0.24 * t) + 46 * t);
              b = clamp255(b * (1 + 0.28 * t) + 52 * t);
            } else {
              const t = wgt * 0.15;
              r = clamp255(r * (1 + 0.05 * t) + 8 * t);
              g = clamp255(g * (1 + 0.05 * t) + 8 * t);
              b = clamp255(b * (1 + 0.05 * t) + 8 * t);
            }
            break;
          case 'Dental Implant Preview': {
            const t = wgt * (0.32 + 0.42 * shadow);
            r = clamp255(r * (1 + 0.12 * t) + 26 * t);
            g = clamp255(g * (1 + 0.11 * t) + 24 * t);
            b = clamp255(b * (1 + 0.13 * t) + 28 * t);
            if (relY > 0.25 && relY < 0.85) {
              const slot = Math.floor((px - bw * 0.18) / (bw * 0.1));
              if (slot >= 0 && slot <= 6 && px % 10 > 4 && px % 10 < 6) {
                r = clamp255(r * 0.72);
                g = clamp255(g * 0.72);
                b = clamp255(b * 0.75);
              }
            }
            break;
          }
          default:
            break;
        }
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    if (procedure === 'Braces / Alignment Preview') {
      ctx.save();
      ctx.strokeStyle = 'rgba(210, 220, 230, 0.55)';
      ctx.lineWidth = Math.max(1, w * 0.0025);
      const yStart = h * 0.15;
      const yEnd = h * 0.9;
      for (let yy = yStart; yy <= yEnd; yy += h * 0.085) {
        ctx.beginPath();
        ctx.moveTo(w * 0.14, yy);
        ctx.lineTo(w * 0.86, yy);
        ctx.stroke();
      }
      ctx.restore();
    }

    try {
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch {
      return canvas.toDataURL('image/png');
    }
  } finally {
    if (isBitmap && drawable && typeof drawable.close === 'function') {
      try {
        drawable.close();
      } catch {
        /* ignore */
      }
    }
  }
}
