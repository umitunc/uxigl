import React, { useRef, useState } from 'react';
import { GripHorizontal } from 'lucide-react';
import {
  DEFAULT_WIDGET_SIZES,
  type DesktopWidgetId,
  type QualityMode,
  type WidgetPosition,
  type WidgetSize,
} from './types';
import {
  createWidgetBaseTheme,
  DESKTOP_WIDGET_ORDER,
  renderWidgetCard,
} from './widgets/renderWidgetCard';
import type { WidgetThemeStyle } from './widgets/widgetCards';
import {
  resolveCustomizedWidgetCardStyle,
  type WidgetUserPrefs,
} from './widgets/widgetCustomization';
import {
  clampWidgetPosition,
  clampWidgetSize,
  computeWidgetMagneticSnap,
  computeWidgetResizeMagneticSnap,
  resolveWidgetOverlaps,
  snapWidgetToGrid,
  type MagneticGuideLine,
  type WidgetNeighborRect,
} from './widgets/widgetLayoutSolver';

export function DesktopWidgets({
  locale,
  isDark,
  glassOpacity,
  glassBlur,
  primaryColor,
  qualityMode,
  setQualityMode,
  openWindowCount,
  enabledWidgets,
  widgetPositions,
  onMoveWidget,
  widgetSizes,
  onResizeWidget,
  widgetUserPrefs = {},
  onOpenCustomize,
  viewportSize,
  onOpenApp,
}: {
  locale: 'tr' | 'en';
  isDark: boolean;
  glassOpacity: number;
  glassBlur: number;
  primaryColor: string;
  qualityMode: QualityMode;
  setQualityMode: (q: QualityMode) => void;
  openWindowCount: number;
  enabledWidgets: Record<DesktopWidgetId, boolean>;
  widgetPositions: Record<DesktopWidgetId, WidgetPosition>;
  onMoveWidget: (id: DesktopWidgetId, pos: WidgetPosition) => void;
  widgetSizes: Record<DesktopWidgetId, WidgetSize>;
  onResizeWidget: (id: DesktopWidgetId, size: WidgetSize) => void;
  widgetUserPrefs?: Partial<Record<DesktopWidgetId, WidgetUserPrefs>>;
  onOpenCustomize?: (id: DesktopWidgetId, anchorX: number, anchorY: number) => void;
  viewportSize: { w: number; h: number };
  onOpenApp: (id: string) => void;
}) {
  const latestNeighborRectsRef = useRef<WidgetNeighborRect[]>([]);
  const [draggingId, setDraggingId] = useState<DesktopWidgetId | null>(null);
  const [dragPreviewPos, setDragPreviewPos] = useState<WidgetPosition | null>(null);
  const [magneticGuides, setMagneticGuides] = useState<MagneticGuideLine[]>([]);

  const dragRef = useRef<{
    id: DesktopWidgetId;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    width: number;
    height: number;
    snappedX: boolean;
    snappedY: boolean;
  } | null>(null);

  const [resizingId, setResizingId] = useState<DesktopWidgetId | null>(null);
  const [resizePreviewSize, setResizePreviewSize] = useState<WidgetSize | null>(null);
  const resizeRef = useRef<{
    id: DesktopWidgetId;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    posX: number;
    posY: number;
    snappedW: boolean;
    snappedH: boolean;
  } | null>(null);

  const baseTheme = createWidgetBaseTheme({
    locale,
    isDark,
    glassOpacity,
    glassBlur,
    primaryColor,
  });

  const clampSize = (rawW: number, rawH: number, posX: number, posY: number): WidgetSize =>
    clampWidgetSize(rawW, rawH, posX, posY, viewportSize.w, viewportSize.h);

  const clampPos = (rawX: number, rawY: number, width: number, height: number): WidgetPosition =>
    clampWidgetPosition(rawX, rawY, width, height, viewportSize.w, viewportSize.h);

  const getNeighbors = (excludeId: DesktopWidgetId) =>
    latestNeighborRectsRef.current.filter((r) => r.id !== excludeId);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: DesktopWidgetId
  ) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, input, textarea, select, a, [data-widget-resize]')) return;
    e.stopPropagation();
    const size = widgetSizes[id] ?? DEFAULT_WIDGET_SIZES[id];
    const currentResolved = latestNeighborRectsRef.current.find((r) => r.id === id);
    const currentPos = currentResolved
      ? { x: currentResolved.x, y: currentResolved.y }
      : clampPos(widgetPositions[id]?.x ?? 20, widgetPositions[id]?.y ?? 20, size.width, size.height);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      width: size.width,
      height: size.height,
      snappedX: false,
      snappedY: false,
    };
    setDraggingId(id);
    setDragPreviewPos(currentPos);
    setMagneticGuides([]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const snapped = computeWidgetMagneticSnap({
      rawX: d.origX + (e.clientX - d.startX),
      rawY: d.origY + (e.clientY - d.startY),
      width: d.width,
      height: d.height,
      neighbors: getNeighbors(d.id),
      viewportW: viewportSize.w,
      viewportH: viewportSize.h,
    });
    d.snappedX = snapped.snappedX;
    d.snappedY = snapped.snappedY;
    setDragPreviewPos({ x: snapped.x, y: snapped.y });
    setMagneticGuides(snapped.guides);
  };

  const handlePointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    const neighbors = getNeighbors(d.id);
    const finalRaw = dragPreviewPos ?? { x: d.origX, y: d.origY };
    const candX = d.snappedX ? finalRaw.x : snapWidgetToGrid(finalRaw.x);
    const candY = d.snappedY ? finalRaw.y : snapWidgetToGrid(finalRaw.y);
    const postSnap = computeWidgetMagneticSnap({
      rawX: candX,
      rawY: candY,
      width: d.width,
      height: d.height,
      neighbors,
      viewportW: viewportSize.w,
      viewportH: viewportSize.h,
    });
    const clamped = clampPos(
      postSnap.snappedX ? postSnap.x : candX,
      postSnap.snappedY ? postSnap.y : candY,
      d.width,
      d.height
    );
    const resolved = resolveWidgetOverlaps(
      [
        ...neighbors.map((n) => ({
          id: n.id,
          pos: { x: n.x, y: n.y },
          size: { width: n.width, height: n.height },
          locked: true,
        })),
        { id: d.id, pos: clamped, size: { width: d.width, height: d.height }, locked: false },
      ],
      viewportSize.h
    );
    onMoveWidget(d.id, resolved[d.id] ?? clamped);
    dragRef.current = null;
    setDraggingId(null);
    setDragPreviewPos(null);
    setMagneticGuides([]);
  };

  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: DesktopWidgetId,
    pos: WidgetPosition,
    size: WidgetSize
  ) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origW: size.width,
      origH: size.height,
      posX: pos.x,
      posY: pos.y,
      snappedW: false,
      snappedH: false,
    };
    setResizingId(id);
    setResizePreviewSize(size);
    setMagneticGuides([]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r) return;
    const snapped = computeWidgetResizeMagneticSnap({
      posX: r.posX,
      posY: r.posY,
      rawW: r.origW + (e.clientX - r.startX),
      rawH: r.origH + (e.clientY - r.startY),
      neighbors: getNeighbors(r.id),
      viewportW: viewportSize.w,
      viewportH: viewportSize.h,
    });
    r.snappedW = snapped.snappedW;
    r.snappedH = snapped.snappedH;
    setResizePreviewSize({ width: snapped.width, height: snapped.height });
    setMagneticGuides(snapped.guides);
  };

  const handleResizePointerUp = () => {
    const r = resizeRef.current;
    if (!r) return;
    const raw = resizePreviewSize ?? { width: r.origW, height: r.origH };
    const snapped = clampSize(
      r.snappedW ? raw.width : snapWidgetToGrid(raw.width),
      r.snappedH ? raw.height : snapWidgetToGrid(raw.height),
      r.posX,
      r.posY
    );
    onResizeWidget(r.id, snapped);
    resizeRef.current = null;
    setResizingId(null);
    setResizePreviewSize(null);
    setMagneticGuides([]);
  };

  const visibleItems = DESKTOP_WIDGET_ORDER.filter((id) => enabledWidgets[id]).map((id) => {
    const isDragging = draggingId === id;
    const isResizing = resizingId === id;
    const defSize = DEFAULT_WIDGET_SIZES[id];
    const rawSize = isResizing && resizePreviewSize ? resizePreviewSize : (widgetSizes[id] ?? defSize);
    const pos =
      isDragging && dragPreviewPos
        ? dragPreviewPos
        : clampPos(
            widgetPositions[id]?.x ?? 20,
            widgetPositions[id]?.y ?? 20,
            rawSize.width,
            rawSize.height
          );
    const size = clampSize(rawSize.width, rawSize.height, pos.x, pos.y);
    return { id, isDragging, isResizing, defSize, rawSize, pos, size };
  });

  const resolvedPositions = resolveWidgetOverlaps(
    visibleItems.map((item) => ({
      id: item.id,
      pos: item.pos,
      size: item.size,
      locked: item.isDragging || item.isResizing,
    })),
    viewportSize.h
  );

  latestNeighborRectsRef.current = visibleItems.map((item) => {
    const rPos = resolvedPositions[item.id] ?? item.pos;
    return {
      id: item.id,
      x: rPos.x,
      y: rPos.y,
      width: item.size.width,
      height: item.size.height,
    };
  });

  return (
    <div
      aria-label="Desktop Widgets Layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {magneticGuides.map((g, idx) => (
        <div
          key={`${g.orientation}-${g.pos}-${idx}`}
          data-osgl-magnetic-guide={g.kind}
          aria-hidden="true"
          style={
            g.orientation === 'vertical'
              ? {
                  position: 'absolute',
                  left: g.pos,
                  top: g.start,
                  width: 0,
                  height: Math.max(16, g.end - g.start),
                  borderLeft: `1.5px ${g.kind === 'margin' ? 'dashed' : 'solid'} ${primaryColor}`,
                  boxShadow: `0 0 8px ${primaryColor}`,
                  opacity: 0.85,
                  pointerEvents: 'none',
                  zIndex: 5,
                }
              : {
                  position: 'absolute',
                  left: g.start,
                  top: g.pos,
                  width: Math.max(16, g.end - g.start),
                  height: 0,
                  borderTop: `1.5px ${g.kind === 'margin' ? 'dashed' : 'solid'} ${primaryColor}`,
                  boxShadow: `0 0 8px ${primaryColor}`,
                  opacity: 0.85,
                  pointerEvents: 'none',
                  zIndex: 5,
                }
          }
        />
      ))}

      {draggingId && dragPreviewPos && (() => {
        const dragSize = widgetSizes[draggingId] ?? DEFAULT_WIDGET_SIZES[draggingId];
        return (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: dragSize.width,
              height: dragSize.height,
              borderRadius: 16,
              border: `2px dashed ${primaryColor}`,
              backgroundColor: isDark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.08)',
              transform: `translate3d(${dragPreviewPos.x}px, ${dragPreviewPos.y}px, 0)`,
              transition: 'transform 60ms ease-out',
              pointerEvents: 'none',
            }}
          />
        );
      })()}

      {resizingId && resizePreviewSize && (() => {
        const rPos = resolvedPositions[resizingId] ?? { x: 20, y: 20 };
        return (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: resizePreviewSize.width,
              height: resizePreviewSize.height,
              borderRadius: 16,
              border: `2px dashed ${primaryColor}`,
              backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)',
              transform: `translate3d(${rPos.x}px, ${rPos.y}px, 0)`,
              transition: 'width 60ms ease-out, height 60ms ease-out',
              pointerEvents: 'none',
            }}
          />
        );
      })()}

      {visibleItems.map(({ id, isDragging, isResizing, defSize, rawSize }) => {
        const basePos = resolvedPositions[id] ?? { x: 20, y: 20 };
        const size = clampSize(rawSize.width, rawSize.height, basePos.x, basePos.y);
        const scale = Math.max(
          0.85,
          Math.min(2.1, Math.min(size.width / defSize.width, size.height / defSize.height))
        );
        const prefs = widgetUserPrefs[id];
        const effectiveAccent = prefs?.accentHex || primaryColor;
        const widgetTheme: WidgetThemeStyle = {
          ...baseTheme,
          primaryColor: effectiveAccent,
          cardStyle: resolveCustomizedWidgetCardStyle({
            baseCardStyle: baseTheme.cardStyle,
            isDark,
            effectiveAccent,
            prefs,
          }),
          width: size.width,
          height: size.height,
          scale,
        };

        return (
          <div
            key={id}
            data-desktop-widget={id}
            onMouseDown={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenCustomize?.(id, e.clientX, e.clientY);
            }}
            onPointerDown={(e) => handlePointerDown(e, id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: size.width,
              height: size.height,
              transform: `translate3d(${basePos.x}px, ${basePos.y}px, 0)`,
              pointerEvents: 'auto',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: isDragging || isResizing ? 'none' : undefined,
              opacity: isDragging ? 0.92 : 1,
              transition:
                isDragging || isResizing
                  ? 'none'
                  : 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), width 160ms ease, height 160ms ease',
            }}
          >
            <div
              title={locale === 'tr' ? 'Izgarada taşımak için sürükleyin' : 'Drag to move on grid'}
              style={{
                position: 'absolute',
                top: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,42,0.25)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <GripHorizontal size={12} />
            </div>

            {renderWidgetCard(id, widgetTheme, {
              qualityMode,
              setQualityMode,
              openWindowCount,
              glassBlur,
              onOpenApp,
              prefs,
            })}

            <div
              data-widget-resize={id}
              title={locale === 'tr' ? 'Boyutlandırmak için sürükleyin' : 'Drag to resize'}
              onPointerDown={(e) => handleResizePointerDown(e, id, basePos, size)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              style={{
                position: 'absolute',
                right: 3,
                bottom: 3,
                width: 16,
                height: 16,
                cursor: 'nwse-resize',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: 3,
                zIndex: 3,
                color: isDark ? 'rgba(255,255,255,0.34)' : 'rgba(15,23,42,0.30)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M9 3L3 9M9 6.5L6.5 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
