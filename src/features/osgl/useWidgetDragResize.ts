import type React from 'react';
import { useRef, useState } from 'react';
import type { OSDesktopWidgetDefinition, WidgetPosition, WidgetSize } from './types';
import {
  clampWidgetPosition,
  clampWidgetSize,
  computeWidgetMagneticSnap,
  computeWidgetResizeMagneticSnap,
  resolveWidgetOverlaps,
  snapWidgetToGrid,
  type MagneticGuideLine,
  type WidgetNeighborRect,
} from './widgetLayout';

/**
 * Etkileşim katmanı: masaüstü widget'ları için manyetik boşluk (16px magnetic margin),
 * kenar hizalama (edge alignment) destekli sürükleme ve boyutlandırma kancası.
 */
export function useWidgetDragResize({
  viewportSize,
  getNeighbors,
  onMoveWidget,
  onResizeWidget,
}: {
  viewportSize: { w: number; h: number };
  getNeighbors?: (excludeId: string) => WidgetNeighborRect[];
  onMoveWidget: (id: string, pos: WidgetPosition) => void;
  onResizeWidget: (id: string, size: WidgetSize) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPreviewPos, setDragPreviewPos] = useState<WidgetPosition | null>(null);
  const [magneticGuides, setMagneticGuides] = useState<MagneticGuideLine[]>([]);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    width: number;
    height: number;
    snappedX: boolean;
    snappedY: boolean;
  } | null>(null);

  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizePreviewSize, setResizePreviewSize] = useState<WidgetSize | null>(null);
  const resizeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    posX: number;
    posY: number;
    snappedW: boolean;
    snappedH: boolean;
  } | null>(null);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    def: OSDesktopWidgetDefinition,
    curPos: WidgetPosition,
    curSize: WidgetSize
  ) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('[data-widget-resize]')
    ) {
      return;
    }
    e.stopPropagation();
    dragRef.current = {
      id: def.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: curPos.x,
      origY: curPos.y,
      width: curSize.width,
      height: curSize.height,
      snappedX: false,
      snappedY: false,
    };
    setDraggingId(def.id);
    setDragPreviewPos(curPos);
    setMagneticGuides([]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const neighbors = getNeighbors ? getNeighbors(d.id) : [];
    const snapped = computeWidgetMagneticSnap({
      rawX: d.origX + (e.clientX - d.startX),
      rawY: d.origY + (e.clientY - d.startY),
      width: d.width,
      height: d.height,
      neighbors,
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
    const neighbors = getNeighbors ? getNeighbors(d.id) : [];
    let finalPos: WidgetPosition = { x: d.origX, y: d.origY };
    if (dragPreviewPos) {
      const candidateX = d.snappedX ? dragPreviewPos.x : snapWidgetToGrid(dragPreviewPos.x);
      const candidateY = d.snappedY ? dragPreviewPos.y : snapWidgetToGrid(dragPreviewPos.y);
      const postSnap = computeWidgetMagneticSnap({
        rawX: candidateX,
        rawY: candidateY,
        width: d.width,
        height: d.height,
        neighbors,
        viewportW: viewportSize.w,
        viewportH: viewportSize.h,
      });
      const clamped = clampWidgetPosition(
        postSnap.snappedX ? postSnap.x : candidateX,
        postSnap.snappedY ? postSnap.y : candidateY,
        d.width,
        d.height,
        viewportSize.w,
        viewportSize.h
      );
      const resolved = resolveWidgetOverlaps(
        [
          ...neighbors.map((n) => ({
            id: n.id,
            pos: { x: n.x, y: n.y },
            size: { width: n.width, height: n.height },
            locked: true,
          })),
          {
            id: d.id,
            pos: clamped,
            size: { width: d.width, height: d.height },
            locked: false,
          },
        ],
        viewportSize.h
      );
      finalPos = resolved[d.id] ?? clamped;
    }
    dragRef.current = null;
    setDraggingId(null);
    setDragPreviewPos(null);
    setMagneticGuides([]);
    onMoveWidget(d.id, finalPos);
  };

  const handleResizeDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: string,
    pos: WidgetPosition,
    size: WidgetSize
  ) => {
    e.stopPropagation();
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

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r) return;
    const neighbors = getNeighbors ? getNeighbors(r.id) : [];
    const snapped = computeWidgetResizeMagneticSnap({
      posX: r.posX,
      posY: r.posY,
      rawW: r.origW + (e.clientX - r.startX),
      rawH: r.origH + (e.clientY - r.startY),
      neighbors,
      viewportW: viewportSize.w,
      viewportH: viewportSize.h,
    });
    r.snappedW = snapped.snappedW;
    r.snappedH = snapped.snappedH;
    setResizePreviewSize({ width: snapped.width, height: snapped.height });
    setMagneticGuides(snapped.guides);
  };

  const handleResizeUp = () => {
    const r = resizeRef.current;
    if (!r) return;
    const finalSize = resizePreviewSize
      ? clampWidgetSize(
          r.snappedW ? resizePreviewSize.width : snapWidgetToGrid(resizePreviewSize.width),
          r.snappedH ? resizePreviewSize.height : snapWidgetToGrid(resizePreviewSize.height),
          r.posX,
          r.posY,
          viewportSize.w,
          viewportSize.h
        )
      : { width: r.origW, height: r.origH };
    resizeRef.current = null;
    setResizingId(null);
    setResizePreviewSize(null);
    setMagneticGuides([]);
    onResizeWidget(r.id, finalSize);
  };

  return {
    draggingId,
    dragPreviewPos,
    resizingId,
    resizePreviewSize,
    magneticGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleResizeDown,
    handleResizeMove,
    handleResizeUp,
  };
}
