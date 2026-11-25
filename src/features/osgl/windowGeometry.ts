import type React from 'react';
import { osWasmEngine } from './osglEngine';
import type { FloatingWindowState, WindowBounds } from './types';
import type { MagneticGuideLine } from './widgetLayout';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export type SnapZone =
  | 'maximize'
  | 'left-half'
  | 'right-half'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | null;

export const DESKTOP_TOP_BAR_H = 44;
export const DESKTOP_DOCK_RESERVE = 88;
export const WINDOW_MIN_WIDTH = 380;
export const WINDOW_MIN_HEIGHT = 220;
export const WINDOW_MAGNETIC_MARGIN = 12;
export const WINDOW_MAGNETIC_SNAP_THRESHOLD = 14;

export interface WindowMagneticSnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: MagneticGuideLine[];
}

export interface WindowResizeMagneticSnapResult {
  bounds: WindowBounds;
  guides: MagneticGuideLine[];
}

export interface ResizeHandleSpec {
  dir: ResizeDirection;
  cursor: React.CSSProperties['cursor'];
  label: string;
  style: React.CSSProperties;
}

export const RESIZE_HANDLE_SPECS: ReadonlyArray<ResizeHandleSpec> = [
  {
    dir: 'n',
    cursor: 'ns-resize',
    label: 'Üst kenardan boyutlandır',
    style: { position: 'absolute', top: -3, left: 12, right: 12, height: 7, zIndex: 6 },
  },
  {
    dir: 's',
    cursor: 'ns-resize',
    label: 'Alt kenardan boyutlandır',
    style: { position: 'absolute', bottom: -3, left: 12, right: 12, height: 7, zIndex: 6 },
  },
  {
    dir: 'w',
    cursor: 'ew-resize',
    label: 'Sol kenardan boyutlandır',
    style: { position: 'absolute', left: -3, top: 12, bottom: 12, width: 7, zIndex: 6 },
  },
  {
    dir: 'e',
    cursor: 'ew-resize',
    label: 'Sağ kenardan boyutlandır',
    style: { position: 'absolute', right: -3, top: 12, bottom: 12, width: 7, zIndex: 6 },
  },
  {
    dir: 'nw',
    cursor: 'nwse-resize',
    label: 'Sol üst köşeden boyutlandır',
    style: { position: 'absolute', top: -4, left: -4, width: 14, height: 14, zIndex: 7 },
  },
  {
    dir: 'ne',
    cursor: 'nesw-resize',
    label: 'Sağ üst köşeden boyutlandır',
    style: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, zIndex: 7 },
  },
  {
    dir: 'sw',
    cursor: 'nesw-resize',
    label: 'Sol alt köşeden boyutlandır',
    style: { position: 'absolute', bottom: -4, left: -4, width: 14, height: 14, zIndex: 7 },
  },
  {
    dir: 'se',
    cursor: 'nwse-resize',
    label: 'Sağ alt köşeden boyutlandır',
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 18,
      height: 18,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      padding: 4,
      zIndex: 8,
    },
  },
];

export function getWorkspaceMetrics(vw: number, vh: number) {
  const safeVw = Number.isFinite(vw) && vw > 0 ? vw : 1366;
  const safeVh = Number.isFinite(vh) && vh > 0 ? vh : 860;
  return {
    workspaceW: Math.max(320, Math.round(safeVw)),
    workspaceH: Math.max(240, Math.round(safeVh - DESKTOP_TOP_BAR_H)),
    topBarH: DESKTOP_TOP_BAR_H,
  };
}

export function clampWindowToViewport(
  win: FloatingWindowState,
  vw: number,
  vh: number
): FloatingWindowState {
  if (win.maximized || win.fullscreen) return win;
  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  const minW = Math.min(WINDOW_MIN_WIDTH, workspaceW);
  const minH = Math.min(WINDOW_MIN_HEIGHT, workspaceH);

  const width = osWasmEngine.clamp(win.width, minW, workspaceW);
  const height = osWasmEngine.clamp(win.height, minH, workspaceH);
  const maxX = Math.max(0, workspaceW - width);
  const maxY = Math.max(0, workspaceH - height);
  const x = osWasmEngine.clamp(win.x, 0, maxX);
  const y = osWasmEngine.clamp(win.y, 0, maxY);

  if (x === win.x && y === win.y && width === win.width && height === win.height) {
    return win;
  }
  return { ...win, x, y, width, height };
}

export function clampWindowDragPosition(
  rawX: number,
  rawY: number,
  winW: number,
  vw: number,
  vh: number
): { x: number; y: number } {
  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  const minVisibleTitleW = Math.min(140, Math.max(64, winW));
  const minX = Math.min(0, minVisibleTitleW - winW);
  const maxX = Math.max(0, workspaceW - minVisibleTitleW);
  const maxY = Math.max(0, workspaceH - 38);

  return {
    x: osWasmEngine.clamp(rawX, minX, maxX),
    y: osWasmEngine.clamp(rawY, 0, maxY),
  };
}

export function computeResizedWindowBounds(
  orig: WindowBounds,
  dir: ResizeDirection,
  dx: number,
  dy: number,
  vw: number,
  vh: number,
  minW = WINDOW_MIN_WIDTH,
  minH = WINDOW_MIN_HEIGHT
): WindowBounds {
  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  const effMinW = Math.min(minW, workspaceW);
  const effMinH = Math.min(minH, workspaceH);

  let x = orig.x;
  let y = orig.y;
  let width = orig.width;
  let height = orig.height;

  if (dir.includes('e')) {
    const maxW = Math.max(effMinW, workspaceW - orig.x);
    width = osWasmEngine.clamp(orig.width + dx, effMinW, maxW);
  } else if (dir.includes('w')) {
    const rightEdge = orig.x + orig.width;
    const maxW = Math.max(effMinW, rightEdge);
    width = osWasmEngine.clamp(orig.width - dx, effMinW, maxW);
    x = rightEdge - width;
  }

  if (dir.includes('s')) {
    const maxH = Math.max(effMinH, workspaceH - orig.y);
    height = osWasmEngine.clamp(orig.height + dy, effMinH, maxH);
  } else if (dir.includes('n')) {
    const bottomEdge = orig.y + orig.height;
    const maxH = Math.max(effMinH, bottomEdge);
    height = osWasmEngine.clamp(orig.height - dy, effMinH, maxH);
    y = bottomEdge - height;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function spansOverlap(a1: number, a2: number, b1: number, b2: number, slop = 0): boolean {
  return a1 < b2 + slop && a2 + slop > b1;
}

/**
 * Serbest sürüklenen pencere için komşu pencerelerle 12px manyetik boşluk (WINDOW_MAGNETIC_MARGIN)
 * ve kenar hizalama (left/right/top/bottom) hesaplayıcısı. Pencerelerin bitişik (0–11px) kalmasını önler.
 */
export function computeWindowMagneticSnap(params: {
  rawX: number;
  rawY: number;
  winW: number;
  winH: number;
  siblings: WindowBounds[];
  vw: number;
  vh: number;
  dockVisible?: boolean;
  margin?: number;
  threshold?: number;
}): WindowMagneticSnapResult {
  const {
    rawX,
    rawY,
    winW,
    winH,
    siblings,
    vw,
    vh,
    dockVisible = true,
    margin = WINDOW_MAGNETIC_MARGIN,
    threshold = WINDOW_MAGNETIC_SNAP_THRESHOLD,
  } = params;

  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  const clamped = clampWindowDragPosition(rawX, rawY, winW, vw, vh);
  const dockReserve = dockVisible ? DESKTOP_DOCK_RESERVE : margin;

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

  // Safe viewport margin snaps (12px inset)
  if (winW + margin * 2 <= workspaceW) {
    considerX(margin, {
      orientation: 'vertical',
      pos: margin,
      start: margin,
      end: Math.max(margin + winH, workspaceH - dockReserve),
      kind: 'align',
    });
    considerX(workspaceW - margin - winW, {
      orientation: 'vertical',
      pos: workspaceW - margin,
      start: margin,
      end: Math.max(margin + winH, workspaceH - dockReserve),
      kind: 'align',
    });
  }
  considerY(margin, {
    orientation: 'horizontal',
    pos: margin,
    start: margin,
    end: Math.max(margin + winW, workspaceW - margin),
    kind: 'align',
  });

  for (const s of siblings) {
    const sRight = s.x + s.width;
    const sBottom = s.y + s.height;
    const vStart = Math.min(clamped.y, s.y);
    const vEnd = Math.max(clamped.y + winH, sBottom);
    const hStart = Math.min(clamped.x, s.x);
    const hEnd = Math.max(clamped.x + winW, sRight);

    // Edge alignment with sibling window
    considerX(s.x, { orientation: 'vertical', pos: s.x, start: vStart, end: vEnd, kind: 'align' });
    considerX(sRight - winW, { orientation: 'vertical', pos: sRight, start: vStart, end: vEnd, kind: 'align' });
    considerY(s.y, { orientation: 'horizontal', pos: s.y, start: hStart, end: hEnd, kind: 'align' });
    considerY(sBottom - winH, { orientation: 'horizontal', pos: sBottom, start: hStart, end: hEnd, kind: 'align' });

    // 12px magnetic margin horizontally when vertically overlapping
    if (spansOverlap(clamped.y, clamped.y + winH, s.y, sBottom, 36)) {
      const rightGapX = sRight + margin;
      const leftGapX = s.x - margin - winW;
      considerX(rightGapX, {
        orientation: 'vertical',
        pos: Math.round(sRight + margin / 2),
        start: vStart,
        end: vEnd,
        kind: 'margin',
      });
      considerX(leftGapX, {
        orientation: 'vertical',
        pos: Math.round(s.x - margin / 2),
        start: vStart,
        end: vEnd,
        kind: 'margin',
      });
      if (bestDx > threshold) {
        if (clamped.x >= sRight - 3 && clamped.x < rightGapX) {
          bestX = rightGapX;
          bestDx = 0;
          guideX = { orientation: 'vertical', pos: Math.round(sRight + margin / 2), start: vStart, end: vEnd, kind: 'margin' };
        } else if (clamped.x + winW > s.x - margin && clamped.x + winW <= s.x + 3) {
          bestX = leftGapX;
          bestDx = 0;
          guideX = { orientation: 'vertical', pos: Math.round(s.x - margin / 2), start: vStart, end: vEnd, kind: 'margin' };
        }
      }
    }

    // 12px magnetic margin vertically when horizontally overlapping
    if (spansOverlap(bestX, bestX + winW, s.x, sRight, 36)) {
      const belowGapY = sBottom + margin;
      const aboveGapY = s.y - margin - winH;
      considerY(belowGapY, {
        orientation: 'horizontal',
        pos: Math.round(sBottom + margin / 2),
        start: Math.min(bestX, s.x),
        end: Math.max(bestX + winW, sRight),
        kind: 'margin',
      });
      considerY(aboveGapY, {
        orientation: 'horizontal',
        pos: Math.round(s.y - margin / 2),
        start: Math.min(bestX, s.x),
        end: Math.max(bestX + winW, sRight),
        kind: 'margin',
      });
      if (bestDy > threshold) {
        if (clamped.y >= sBottom - 3 && clamped.y < belowGapY) {
          bestY = belowGapY;
          bestDy = 0;
          guideY = {
            orientation: 'horizontal',
            pos: Math.round(sBottom + margin / 2),
            start: Math.min(bestX, s.x),
            end: Math.max(bestX + winW, sRight),
            kind: 'margin',
          };
        } else if (clamped.y + winH > s.y - margin && clamped.y + winH <= s.y + 3) {
          bestY = aboveGapY;
          bestDy = 0;
          guideY = {
            orientation: 'horizontal',
            pos: Math.round(s.y - margin / 2),
            start: Math.min(bestX, s.x),
            end: Math.max(bestX + winW, sRight),
            kind: 'margin',
          };
        }
      }
    }
  }

  const finalClamped = clampWindowDragPosition(bestX, bestY, winW, vw, vh);
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
 * 8 yönlü pencere boyutlandırma sırasında komşu pencerelerle 12px manyetik boşluk ve
 * hizalama kılavuzu hesaplayıcısı.
 */
export function computeWindowResizeMagneticSnap(params: {
  rawBounds: WindowBounds;
  dir: ResizeDirection;
  siblings: WindowBounds[];
  vw: number;
  vh: number;
  minW?: number;
  minH?: number;
  margin?: number;
  threshold?: number;
}): WindowResizeMagneticSnapResult {
  const {
    rawBounds,
    dir,
    siblings,
    vw,
    vh,
    minW = WINDOW_MIN_WIDTH,
    minH = WINDOW_MIN_HEIGHT,
    margin = WINDOW_MAGNETIC_MARGIN,
    threshold = WINDOW_MAGNETIC_SNAP_THRESHOLD,
  } = params;

  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  const effMinW = Math.min(minW, workspaceW);
  const effMinH = Math.min(minH, workspaceH);

  let { x, y, width, height } = rawBounds;
  const rightEdge = rawBounds.x + rawBounds.width;
  const bottomEdge = rawBounds.y + rawBounds.height;
  const guides: MagneticGuideLine[] = [];

  for (const s of siblings) {
    const sRight = s.x + s.width;
    const sBottom = s.y + s.height;

    if (dir.includes('e') && spansOverlap(y, y + height, s.y, sBottom, 24)) {
      const targetRight = s.x - margin;
      if (targetRight - x >= effMinW && Math.abs(x + width - targetRight) <= threshold) {
        width = targetRight - x;
        guides.push({
          orientation: 'vertical',
          pos: Math.round(s.x - margin / 2),
          start: Math.min(y, s.y),
          end: Math.max(y + height, sBottom),
          kind: 'margin',
        });
      } else if (sRight - x >= effMinW && Math.abs(x + width - sRight) <= threshold) {
        width = sRight - x;
        guides.push({
          orientation: 'vertical',
          pos: sRight,
          start: Math.min(y, s.y),
          end: Math.max(y + height, sBottom),
          kind: 'align',
        });
      }
    } else if (dir.includes('w') && spansOverlap(y, y + height, s.y, sBottom, 24)) {
      const targetLeft = sRight + margin;
      if (rightEdge - targetLeft >= effMinW && Math.abs(x - targetLeft) <= threshold) {
        x = targetLeft;
        width = rightEdge - targetLeft;
        guides.push({
          orientation: 'vertical',
          pos: Math.round(sRight + margin / 2),
          start: Math.min(y, s.y),
          end: Math.max(y + height, sBottom),
          kind: 'margin',
        });
      }
    }

    if (dir.includes('s') && spansOverlap(x, x + width, s.x, sRight, 24)) {
      const targetBottom = s.y - margin;
      if (targetBottom - y >= effMinH && Math.abs(y + height - targetBottom) <= threshold) {
        height = targetBottom - y;
        guides.push({
          orientation: 'horizontal',
          pos: Math.round(s.y - margin / 2),
          start: Math.min(x, s.x),
          end: Math.max(x + width, sRight),
          kind: 'margin',
        });
      } else if (sBottom - y >= effMinH && Math.abs(y + height - sBottom) <= threshold) {
        height = sBottom - y;
        guides.push({
          orientation: 'horizontal',
          pos: sBottom,
          start: Math.min(x, s.x),
          end: Math.max(x + width, sRight),
          kind: 'align',
        });
      }
    } else if (dir.includes('n') && spansOverlap(x, x + width, s.x, sRight, 24)) {
      const targetTop = sBottom + margin;
      if (bottomEdge - targetTop >= effMinH && Math.abs(y - targetTop) <= threshold) {
        y = targetTop;
        height = bottomEdge - targetTop;
        guides.push({
          orientation: 'horizontal',
          pos: Math.round(sBottom + margin / 2),
          start: Math.min(x, s.x),
          end: Math.max(x + width, sRight),
          kind: 'margin',
        });
      }
    }
  }

  return {
    bounds: {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    },
    guides,
  };
}

export function detectEdgeSnapZone(
  clientX: number,
  clientY: number,
  vw: number,
  vh: number
): SnapZone {
  const safeVw = Number.isFinite(vw) && vw > 0 ? vw : 1366;
  const safeVh = Number.isFinite(vh) && vh > 0 ? vh : 860;
  const cornerSpan = 92;
  const nearLeft = clientX <= 18;
  const nearRight = clientX >= safeVw - 18;
  const nearTop = clientY <= DESKTOP_TOP_BAR_H + 12;
  const nearBottom = clientY >= safeVh - 22;

  if ((nearLeft && clientY <= DESKTOP_TOP_BAR_H + cornerSpan) || (nearTop && clientX <= cornerSpan)) {
    return 'top-left';
  }
  if ((nearRight && clientY <= DESKTOP_TOP_BAR_H + cornerSpan) || (nearTop && clientX >= safeVw - cornerSpan)) {
    return 'top-right';
  }
  if ((nearLeft && clientY >= safeVh - cornerSpan) || (nearBottom && clientX <= cornerSpan)) {
    return 'bottom-left';
  }
  if ((nearRight && clientY >= safeVh - cornerSpan) || (nearBottom && clientX >= safeVw - cornerSpan)) {
    return 'bottom-right';
  }
  if (clientY <= DESKTOP_TOP_BAR_H + 8) return 'maximize';
  if (clientX <= 14) return 'left-half';
  if (clientX >= safeVw - 14) return 'right-half';
  return null;
}

export function computeSnapBounds(
  zone: Exclude<SnapZone, null>,
  vw: number,
  vh: number,
  dockVisible = false
): WindowBounds {
  const { workspaceW, workspaceH } = getWorkspaceMetrics(vw, vh);
  if (zone === 'maximize') {
    return { x: 0, y: 0, width: workspaceW, height: workspaceH };
  }
  if (!dockVisible) {
    const halfW = Math.floor(workspaceW / 2);
    const halfH = Math.floor(workspaceH / 2);
    if (zone === 'left-half') return { x: 0, y: 0, width: halfW, height: workspaceH };
    if (zone === 'right-half') return { x: halfW, y: 0, width: workspaceW - halfW, height: workspaceH };
    if (zone === 'top-left') return { x: 0, y: 0, width: halfW, height: halfH };
    if (zone === 'top-right') return { x: halfW, y: 0, width: workspaceW - halfW, height: halfH };
    if (zone === 'bottom-left') return { x: 0, y: halfH, width: halfW, height: workspaceH - halfH };
    return { x: halfW, y: halfH, width: workspaceW - halfW, height: workspaceH - halfH };
  }

  const m = WINDOW_MAGNETIC_MARGIN;
  const availW = Math.max(400, workspaceW - m * 2);
  const availH = Math.max(320, workspaceH - DESKTOP_DOCK_RESERVE - m);
  const colW = Math.floor((availW - m) / 2);
  const rightW = availW - colW - m;
  const rightX = m + colW + m;
  const rowH = Math.floor((availH - m) / 2);
  const botH = availH - rowH - m;
  const botY = m + rowH + m;

  if (zone === 'left-half') return { x: m, y: m, width: colW, height: availH };
  if (zone === 'right-half') return { x: rightX, y: m, width: rightW, height: availH };
  if (zone === 'top-left') return { x: m, y: m, width: colW, height: rowH };
  if (zone === 'top-right') return { x: rightX, y: m, width: rightW, height: rowH };
  if (zone === 'bottom-left') return { x: m, y: botY, width: colW, height: botH };
  return { x: rightX, y: botY, width: rightW, height: botH };
}

export function computeUnmaximizeDragOrigin(
  pointerClientX: number,
  pointerClientY: number,
  restored: WindowBounds,
  vw: number,
  vh: number
): { x: number; y: number } {
  const { workspaceW } = getWorkspaceMetrics(vw, vh);
  const ratioX = Math.max(0.1, Math.min(0.9, pointerClientX / Math.max(1, workspaceW)));
  const rawX = Math.round(pointerClientX - restored.width * ratioX);
  const rawY = Math.max(4, Math.round(pointerClientY - DESKTOP_TOP_BAR_H - 18));
  return clampWindowDragPosition(rawX, rawY, restored.width, vw, vh);
}
