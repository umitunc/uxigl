import {
  WIDGET_GRID_STEP,
  WIDGET_MAX_HEIGHT,
  WIDGET_MAX_WIDTH,
  WIDGET_MIN_HEIGHT,
  WIDGET_MIN_WIDTH,
  type WidgetPosition,
  type WidgetSize,
} from './types';

export const WIDGET_MAGNETIC_MARGIN = 16;
export const WIDGET_MAGNETIC_SNAP_THRESHOLD = 14;

const MIN_X = 16;
const MIN_Y = 14;
const RIGHT_SAFE_INSET = 20;
const BOTTOM_DOCK_RESERVE = 84;

export interface WidgetLayoutItem {
  id: string;
  pos: WidgetPosition;
  size: WidgetSize;
  /** Kullanıcının o an sürüklediği/boyutlandırdığı widget yerinde kalır, diğerleri ondan kaçar. */
  locked?: boolean;
}

export interface WidgetNeighborRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MagneticGuideLine {
  orientation: 'horizontal' | 'vertical';
  pos: number;
  start: number;
  end: number;
  kind: 'margin' | 'align';
}

export interface WidgetMagneticSnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: MagneticGuideLine[];
}

export interface WidgetResizeMagneticSnapResult {
  width: number;
  height: number;
  snappedW: boolean;
  snappedH: boolean;
  guides: MagneticGuideLine[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function snapWidgetToGrid(val: number): number {
  return Math.round(val / WIDGET_GRID_STEP) * WIDGET_GRID_STEP;
}

export function clampWidgetSize(
  rawW: number,
  rawH: number,
  posX: number,
  posY: number,
  viewportW: number,
  viewportH: number
): WidgetSize {
  const availW = Math.max(
    WIDGET_MIN_WIDTH,
    Math.min(WIDGET_MAX_WIDTH, viewportW - posX - RIGHT_SAFE_INSET)
  );
  const availH = Math.max(
    WIDGET_MIN_HEIGHT,
    Math.min(WIDGET_MAX_HEIGHT, viewportH - posY - BOTTOM_DOCK_RESERVE)
  );
  return {
    width: Math.max(WIDGET_MIN_WIDTH, Math.min(rawW, availW)),
    height: Math.max(WIDGET_MIN_HEIGHT, Math.min(rawH, availH)),
  };
}

export function clampWidgetPosition(
  rawX: number,
  rawY: number,
  width: number,
  height: number,
  viewportW: number,
  viewportH: number
): WidgetPosition {
  const maxX = Math.max(MIN_X, viewportW - width - RIGHT_SAFE_INSET);
  const maxY = Math.max(MIN_Y, viewportH - BOTTOM_DOCK_RESERVE - height);
  return {
    x: Math.max(MIN_X, Math.min(rawX, maxX)),
    y: Math.max(MIN_Y, Math.min(rawY, maxY)),
  };
}

function intersectsWithMargin(a: Rect, b: Rect, margin = WIDGET_MAGNETIC_MARGIN): boolean {
  return (
    a.x < b.x + b.w + margin &&
    a.x + a.w + margin > b.x &&
    a.y < b.y + b.h + margin &&
    a.y + a.h + margin > b.y
  );
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number, slop = 0): boolean {
  return aStart < bEnd + slop && aEnd + slop > bStart;
}

/**
 * Sürüklenen masaüstü widget'ı için komşu widget'lara ve ekran kenarlarına göre
 * manyetik boşluk (16px magnetic margin) ve kenar hizalama (left/right/top/bottom) hesaplar.
 * Widget'ların birbirine sıfır/bitişik (0–15px) yapışmasını engeller.
 */
export function computeWidgetMagneticSnap(params: {
  rawX: number;
  rawY: number;
  width: number;
  height: number;
  neighbors: WidgetNeighborRect[];
  viewportW: number;
  viewportH: number;
  margin?: number;
  threshold?: number;
}): WidgetMagneticSnapResult {
  const {
    rawX,
    rawY,
    width,
    height,
    neighbors,
    viewportW,
    viewportH,
    margin = WIDGET_MAGNETIC_MARGIN,
    threshold = WIDGET_MAGNETIC_SNAP_THRESHOLD,
  } = params;

  const clamped = clampWidgetPosition(rawX, rawY, width, height, viewportW, viewportH);
  let bestX = clamped.x;
  let bestY = clamped.y;
  let bestDx = threshold + 1;
  let bestDy = threshold + 1;
  let guideX: MagneticGuideLine | null = null;
  let guideY: MagneticGuideLine | null = null;

  const considerX = (targetX: number, guide: MagneticGuideLine) => {
    const dist = Math.abs(clamped.x - targetX);
    if (dist <= threshold && dist < bestDx) {
      bestDx = dist;
      bestX = targetX;
      guideX = guide;
    }
  };

  const considerY = (targetY: number, guide: MagneticGuideLine) => {
    const dist = Math.abs(clamped.y - targetY);
    if (dist <= threshold && dist < bestDy) {
      bestDy = dist;
      bestY = targetY;
      guideY = guide;
    }
  };

  // Viewport safe margins
  const rightSafeX = Math.max(MIN_X, viewportW - RIGHT_SAFE_INSET - width);
  considerX(MIN_X, {
    orientation: 'vertical',
    pos: MIN_X,
    start: MIN_Y,
    end: Math.max(MIN_Y + height, viewportH - BOTTOM_DOCK_RESERVE),
    kind: 'align',
  });
  considerX(rightSafeX, {
    orientation: 'vertical',
    pos: rightSafeX + width,
    start: MIN_Y,
    end: Math.max(MIN_Y + height, viewportH - BOTTOM_DOCK_RESERVE),
    kind: 'align',
  });
  considerY(MIN_Y, {
    orientation: 'horizontal',
    pos: MIN_Y,
    start: MIN_X,
    end: Math.max(MIN_X + width, viewportW - RIGHT_SAFE_INSET),
    kind: 'align',
  });

  for (const n of neighbors) {
    const nRight = n.x + n.width;
    const nBottom = n.y + n.height;
    const vSpanStart = Math.min(clamped.y, n.y);
    const vSpanEnd = Math.max(clamped.y + height, nBottom);
    const hSpanStart = Math.min(clamped.x, n.x);
    const hSpanEnd = Math.max(clamped.x + width, nRight);

    // Edge alignments (left-to-left, right-to-right, top-to-top, bottom-to-bottom)
    considerX(n.x, {
      orientation: 'vertical',
      pos: n.x,
      start: vSpanStart,
      end: vSpanEnd,
      kind: 'align',
    });
    considerX(nRight - width, {
      orientation: 'vertical',
      pos: nRight,
      start: vSpanStart,
      end: vSpanEnd,
      kind: 'align',
    });
    considerY(n.y, {
      orientation: 'horizontal',
      pos: n.y,
      start: hSpanStart,
      end: hSpanEnd,
      kind: 'align',
    });
    considerY(nBottom - height, {
      orientation: 'horizontal',
      pos: nBottom,
      start: hSpanStart,
      end: hSpanEnd,
      kind: 'align',
    });

    // Magnetic margin snaps on X when vertically overlapping/near
    if (rangesOverlap(clamped.y, clamped.y + height, n.y, nBottom, 48)) {
      const rightMarginX = nRight + margin;
      const leftMarginX = n.x - margin - width;
      considerX(rightMarginX, {
        orientation: 'vertical',
        pos: Math.round(nRight + margin / 2),
        start: vSpanStart,
        end: vSpanEnd,
        kind: 'margin',
      });
      considerX(leftMarginX, {
        orientation: 'vertical',
        pos: Math.round(n.x - margin / 2),
        start: vSpanStart,
        end: vSpanEnd,
        kind: 'margin',
      });

      // Prevent resting inside the 0..margin flush band horizontally
      if (bestDx > threshold) {
        if (clamped.x >= nRight - 4 && clamped.x < rightMarginX) {
          bestX = rightMarginX;
          bestDx = 0;
          guideX = {
            orientation: 'vertical',
            pos: Math.round(nRight + margin / 2),
            start: vSpanStart,
            end: vSpanEnd,
            kind: 'margin',
          };
        } else if (clamped.x + width > n.x - margin && clamped.x + width <= n.x + 4) {
          bestX = leftMarginX;
          bestDx = 0;
          guideX = {
            orientation: 'vertical',
            pos: Math.round(n.x - margin / 2),
            start: vSpanStart,
            end: vSpanEnd,
            kind: 'margin',
          };
        }
      }
    }

    // Magnetic margin snaps on Y when horizontally overlapping/near
    if (rangesOverlap(bestX, bestX + width, n.x, nRight, 48)) {
      const belowMarginY = nBottom + margin;
      const aboveMarginY = n.y - margin - height;
      considerY(belowMarginY, {
        orientation: 'horizontal',
        pos: Math.round(nBottom + margin / 2),
        start: Math.min(bestX, n.x),
        end: Math.max(bestX + width, nRight),
        kind: 'margin',
      });
      considerY(aboveMarginY, {
        orientation: 'horizontal',
        pos: Math.round(n.y - margin / 2),
        start: Math.min(bestX, n.x),
        end: Math.max(bestX + width, nRight),
        kind: 'margin',
      });

      // Prevent resting inside the 0..margin flush band vertically
      if (bestDy > threshold) {
        if (clamped.y >= nBottom - 4 && clamped.y < belowMarginY) {
          bestY = belowMarginY;
          bestDy = 0;
          guideY = {
            orientation: 'horizontal',
            pos: Math.round(nBottom + margin / 2),
            start: Math.min(bestX, n.x),
            end: Math.max(bestX + width, nRight),
            kind: 'margin',
          };
        } else if (clamped.y + height > n.y - margin && clamped.y + height <= n.y + 4) {
          bestY = aboveMarginY;
          bestDy = 0;
          guideY = {
            orientation: 'horizontal',
            pos: Math.round(n.y - margin / 2),
            start: Math.min(bestX, n.x),
            end: Math.max(bestX + width, nRight),
            kind: 'margin',
          };
        }
      }
    }
  }

  const finalClamped = clampWidgetPosition(bestX, bestY, width, height, viewportW, viewportH);
  const guides: MagneticGuideLine[] = [];
  if (guideX && finalClamped.x === bestX) guides.push(guideX);
  if (guideY && finalClamped.y === bestY) guides.push(guideY);

  return {
    x: finalClamped.x,
    y: finalClamped.y,
    snappedX: bestDx <= threshold && finalClamped.x === bestX,
    snappedY: bestDy <= threshold && finalClamped.y === bestY,
    guides,
  };
}

/**
 * Boyutlandırılan (resize) masaüstü widget'ı için komşu kenar hizalaması ve
 * komşu widget'a bitişmeden 16px manyetik boşlukta durma hesaplayıcısı.
 */
export function computeWidgetResizeMagneticSnap(params: {
  posX: number;
  posY: number;
  rawW: number;
  rawH: number;
  neighbors: WidgetNeighborRect[];
  viewportW: number;
  viewportH: number;
  margin?: number;
  threshold?: number;
}): WidgetResizeMagneticSnapResult {
  const {
    posX,
    posY,
    rawW,
    rawH,
    neighbors,
    viewportW,
    viewportH,
    margin = WIDGET_MAGNETIC_MARGIN,
    threshold = WIDGET_MAGNETIC_SNAP_THRESHOLD,
  } = params;

  const clamped = clampWidgetSize(rawW, rawH, posX, posY, viewportW, viewportH);
  let bestW = clamped.width;
  let bestH = clamped.height;
  let bestDw = threshold + 1;
  let bestDh = threshold + 1;
  let guideW: MagneticGuideLine | null = null;
  let guideH: MagneticGuideLine | null = null;

  for (const n of neighbors) {
    const nRight = n.x + n.width;
    const nBottom = n.y + n.height;

    // Match right edge alignment with neighbor in same column
    const alignW = nRight - posX;
    if (alignW >= WIDGET_MIN_WIDTH && Math.abs(clamped.width - alignW) <= threshold) {
      const dist = Math.abs(clamped.width - alignW);
      if (dist < bestDw) {
        bestDw = dist;
        bestW = alignW;
        guideW = {
          orientation: 'vertical',
          pos: nRight,
          start: Math.min(posY, n.y),
          end: Math.max(posY + clamped.height, nBottom),
          kind: 'align',
        };
      }
    }

    // Stop 16px before neighbor to the right
    if (rangesOverlap(posY, posY + clamped.height, n.y, nBottom) && n.x > posX) {
      const marginW = n.x - margin - posX;
      if (marginW >= WIDGET_MIN_WIDTH) {
        const dist = Math.abs(clamped.width - marginW);
        if (dist <= threshold || (posX + clamped.width > n.x - margin && posX + clamped.width <= n.x + 4)) {
          if (dist < bestDw || bestDw > threshold) {
            bestDw = Math.min(dist, threshold);
            bestW = marginW;
            guideW = {
              orientation: 'vertical',
              pos: Math.round(n.x - margin / 2),
              start: Math.min(posY, n.y),
              end: Math.max(posY + clamped.height, nBottom),
              kind: 'margin',
            };
          }
        }
      }
    }

    // Match bottom edge alignment with neighbor in same row
    const alignH = nBottom - posY;
    if (alignH >= WIDGET_MIN_HEIGHT && Math.abs(clamped.height - alignH) <= threshold) {
      const dist = Math.abs(clamped.height - alignH);
      if (dist < bestDh) {
        bestDh = dist;
        bestH = alignH;
        guideH = {
          orientation: 'horizontal',
          pos: nBottom,
          start: Math.min(posX, n.x),
          end: Math.max(posX + bestW, nRight),
          kind: 'align',
        };
      }
    }

    // Stop 16px above neighbor below
    if (rangesOverlap(posX, posX + bestW, n.x, nRight) && n.y > posY) {
      const marginH = n.y - margin - posY;
      if (marginH >= WIDGET_MIN_HEIGHT) {
        const dist = Math.abs(clamped.height - marginH);
        if (dist <= threshold || (posY + clamped.height > n.y - margin && posY + clamped.height <= n.y + 4)) {
          if (dist < bestDh || bestDh > threshold) {
            bestDh = Math.min(dist, threshold);
            bestH = marginH;
            guideH = {
              orientation: 'horizontal',
              pos: Math.round(n.y - margin / 2),
              start: Math.min(posX, n.x),
              end: Math.max(posX + bestW, nRight),
              kind: 'margin',
            };
          }
        }
      }
    }
  }

  const finalSize = clampWidgetSize(bestW, bestH, posX, posY, viewportW, viewportH);
  const guides: MagneticGuideLine[] = [];
  if (guideW && finalSize.width === bestW) guides.push(guideW);
  if (guideH && finalSize.height === bestH) guides.push(guideH);

  return {
    width: finalSize.width,
    height: finalSize.height,
    snappedW: bestDw <= threshold && finalSize.width === bestW,
    snappedH: bestDh <= threshold && finalSize.height === bestH,
    guides,
  };
}

/**
 * Masaüstü widget'larının üst üste binmesini, birbirine bitişik (0–15px) yapışmasını ve
 * alt Dock / ekran taşmasını engeller. Her iki widget arasında en az WIDGET_MAGNETIC_MARGIN (16px)
 * nefes payı korunur.
 */
export function resolveWidgetOverlaps(
  items: WidgetLayoutItem[],
  viewportHeight: number,
  margin = WIDGET_MAGNETIC_MARGIN
): Record<string, WidgetPosition> {
  const placed: Rect[] = [];
  const result: Record<string, WidgetPosition> = {};
  const ordered = [...items.filter((i) => i.locked), ...items.filter((i) => !i.locked)];
  const maxBottomY = Math.max(240, viewportHeight - BOTTOM_DOCK_RESERVE);

  for (const item of ordered) {
    const rect: Rect = {
      x: item.pos.x,
      y: Math.min(item.pos.y, Math.max(MIN_Y, maxBottomY - item.size.height)),
      w: item.size.width,
      h: item.size.height,
    };

    if (!item.locked) {
      for (let guard = 0; guard < items.length * 6; guard += 1) {
        const conflict = placed.find((p) => intersectsWithMargin(rect, p, margin));
        if (!conflict) break;
        const belowY = conflict.y + conflict.h + margin;
        const fitsCompletelyBelow = belowY + rect.h <= maxBottomY;
        const leftX = conflict.x - rect.w - margin;
        if (fitsCompletelyBelow) {
          rect.y = belowY;
        } else if (leftX >= MIN_X) {
          rect.x = leftX;
          rect.y = MIN_Y;
        } else {
          rect.y = belowY;
        }
      }
    }

    placed.push(rect);
    result[item.id] = { x: rect.x, y: rect.y };
  }

  return result;
}
