/**
 * uxiGL OSGL — WebAssembly (WASM) Window Solver + Wallpaper Re-exports
 */

export {
  OS_WALLPAPERS,
  startOSWebGLWallpaper,
  type OSWallpaperId,
  type WallpaperPalette,
} from './osglWallpapers';

const WASM_BYTES = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x08, 0x01, 0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x01, 0x7f,
  0x03, 0x02, 0x01, 0x00,
  0x07, 0x09, 0x01, 0x05, 0x63, 0x6c, 0x61, 0x6d, 0x70, 0x00, 0x00,
  0x0a, 0x1a, 0x01, 0x18, 0x00,
  0x20, 0x01, 0x20, 0x00, 0x20, 0x00, 0x20, 0x01, 0x48, 0x1b, 0x21, 0x00,
  0x20, 0x02, 0x20, 0x00, 0x20, 0x00, 0x20, 0x02, 0x4a, 0x1b, 0x0b,
]);

interface WasmExports {
  clamp: (val: number, min: number, max: number) => number;
}

class OSWasmEngine {
  public isWasmActive = false;
  private wasmClamp: ((val: number, min: number, max: number) => number) | null = null;

  constructor() {
    this.initWasm();
  }

  private initWasm() {
    if (typeof WebAssembly === 'undefined') return;
    try {
      const mod = new WebAssembly.Module(WASM_BYTES);
      const instance = new WebAssembly.Instance(mod);
      const exports = instance.exports as unknown as WasmExports;
      if (typeof exports.clamp === 'function') {
        this.wasmClamp = exports.clamp;
        this.isWasmActive = true;
      }
    } catch {
      this.isWasmActive = false;
    }
  }

  public clamp(val: number, min: number, max: number): number {
    const iv = Math.round(val);
    const lo = Math.round(min);
    const hi = Math.max(lo, Math.round(max));
    if (this.wasmClamp) {
      return this.wasmClamp(iv, lo, hi);
    }
    return Math.max(lo, Math.min(hi, iv));
  }

  public computeArrangeRects(
    count: number,
    mode: 'cascade' | 'grid' | 'side-by-side' | 'quadrants',
    usableW: number,
    usableH: number
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
    if (count <= 0) return rects;

    for (let idx = 0; idx < count; idx++) {
      if (mode === 'cascade') {
        const x = this.clamp(120 + idx * 32, 16, Math.max(180, usableW - 380));
        const y = this.clamp(14 + idx * 28, 10, Math.max(120, usableH - 280));
        const width = this.clamp(780, 360, usableW - 140);
        const height = this.clamp(540, 280, usableH - 36);
        rects.push({ x, y, width, height });
      } else if (mode === 'side-by-side') {
        const colW = Math.floor((usableW - (count - 1) * 12) / count);
        const width = this.clamp(colW, 300, usableW);
        rects.push({
          x: 16 + idx * (width + 12),
          y: 12,
          width,
          height: this.clamp(usableH, 280, usableH),
        });
      } else if (mode === 'quadrants') {
        const slot = idx % 4;
        const col = slot % 2;
        const row = Math.floor(slot / 2);
        const cascadeOffset = Math.floor(idx / 4) * 20;
        const cellW = this.clamp(Math.floor((usableW - 12) / 2), 300, usableW);
        const cellH = this.clamp(Math.floor((usableH - 12) / 2), 230, usableH);
        rects.push({
          x: 16 + col * (cellW + 12) + cascadeOffset,
          y: 12 + row * (cellH + 12) + cascadeOffset,
          width: cellW,
          height: cellH,
        });
      } else {
        const cols = count <= 2 ? count : Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cellW = this.clamp(Math.floor((usableW - (cols - 1) * 12) / cols), 300, usableW);
        const cellH = this.clamp(Math.floor((usableH - (rows - 1) * 12) / rows), 240, usableH);
        rects.push({
          x: 16 + col * (cellW + 12),
          y: 12 + row * (cellH + 12),
          width: cellW,
          height: cellH,
        });
      }
    }
    return rects;
  }
}

export const osWasmEngine = new OSWasmEngine();
