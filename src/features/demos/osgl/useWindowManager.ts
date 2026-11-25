import { useEffect, useRef, useState } from 'react';
import { osWasmEngine } from '../OSGLEngine';
import {
  applySnapWindow,
  applyToggleFullscreen,
  applyToggleMaximize,
} from '../../osgl/windowStateReducers';
import type { SnapZone } from '../../osgl/windowGeometry';
import type {
  FloatingWindowState,
  PersistedOSGLState,
  QualityMode,
  WindowArrangeMode,
  WindowBounds,
} from './types';

export const FULLBLEED_APP_IDS = new Set([
  'analytics-telemetry',
  'datatable-statcard',
  'crm-orders',
  'filemangl-explorer',
  'file-manager',
  'messages',
]);

const DESKTOP_PADDING_X = 12;
const DESKTOP_TOP_BAR_H = 44;
const DESKTOP_DOCK_RESERVE = 96;

export function clampWindowToViewport(
  win: FloatingWindowState,
  vw: number,
  vh: number
): FloatingWindowState {
  if (win.maximized || win.fullscreen) return win;
  const maxAvailW = Math.max(280, vw - DESKTOP_PADDING_X * 2);
  const maxAvailH = Math.max(220, vh - DESKTOP_TOP_BAR_H - DESKTOP_DOCK_RESERVE);
  const minW = Math.min(340, maxAvailW);
  const minH = Math.min(240, maxAvailH);

  const width = Math.max(minW, Math.min(win.width, maxAvailW));
  const height = Math.max(minH, Math.min(win.height, maxAvailH));
  const maxX = Math.max(DESKTOP_PADDING_X, vw - width - DESKTOP_PADDING_X);
  const maxY = Math.max(8, maxAvailH - height + 8);
  const x = Math.max(DESKTOP_PADDING_X, Math.min(win.x, maxX));
  const y = Math.max(8, Math.min(win.y, maxY));

  if (x === win.x && y === win.y && width === win.width && height === win.height) {
    return win;
  }
  return { ...win, x, y, width, height };
}

export function useWindowManager({
  savedState,
  showMobileLayout,
  setMobileOpenAppId,
  windowAnimation,
  qualityMode,
  dockVisible = true,
  notify,
}: {
  savedState: PersistedOSGLState | null;
  showMobileLayout: boolean;
  setMobileOpenAppId: (id: string | null) => void;
  windowAnimation: boolean;
  qualityMode: QualityMode;
  dockVisible?: boolean;
  notify: (input: { title: string; description: string; tone: 'info' | 'success' | 'warning' | 'danger' }) => void;
}) {
  const [windows, setWindows] = useState<FloatingWindowState[]>(() => {
    const initial = savedState?.windows ?? [
      {
        id: 'win-overview',
        appId: 'overview',
        x: 320,
        y: 20,
        width: 680,
        height: 480,
        zIndex: 20,
        minimized: false,
        maximized: false,
      },
    ];
    if (typeof window === 'undefined') return initial;
    return initial.map((w) => clampWindowToViewport(w, window.innerWidth, window.innerHeight));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleViewportResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setWindows((prev) => {
        let changed = false;
        const next = prev.map((w) => {
          const clamped = clampWindowToViewport(w, vw, vh);
          if (clamped !== w) changed = true;
          return clamped;
        });
        return changed ? next : prev;
      });
    };
    handleViewportResize();
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, []);

  const [windowBoundsByApp, setWindowBoundsByApp] = useState<Record<string, WindowBounds>>(
    () => savedState?.windowBoundsByApp ?? {}
  );
  const [topZ, setTopZ] = useState(savedState?.topZ ?? 21);
  const [closingWindowIds, setClosingWindowIds] = useState<string[]>([]);
  const [highlightedWindowId, setHighlightedWindowId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setWindowBoundsByApp((prev) => {
      let changed = false;
      const next = { ...prev };
      windows.forEach((w) => {
        if (w.maximized || w.fullscreen) return;
        const cur = next[w.appId];
        if (!cur || cur.x !== w.x || cur.y !== w.y || cur.width !== w.width || cur.height !== w.height) {
          next[w.appId] = { x: w.x, y: w.y, width: w.width, height: w.height };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [windows]);

  const openApp = (appId: string) => {
    if (showMobileLayout) {
      setMobileOpenAppId(appId);
      return;
    }
    const existing = windows.find((w) => w.appId === appId);
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    if (existing) {
      const wasVisible = !existing.minimized;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, maximized: appId === 'docs' ? true : w.maximized, zIndex: nextZ }
            : w
        )
      );
      if (wasVisible) {
        if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
        setHighlightedWindowId(existing.id);
        highlightTimerRef.current = window.setTimeout(() => {
          setHighlightedWindowId(null);
          highlightTimerRef.current = null;
        }, 650);
      }
      return;
    }
    const savedBounds = windowBoundsByApp[appId];
    const offset = (windows.length % 6) * 26;
    const isLargeApp =
      FULLBLEED_APP_IDS.has(appId) ||
      appId === 'overview' ||
      appId === 'analytics' ||
      appId === 'forms' ||
      appId === 'docs' ||
      appId.startsWith('page-');
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const defaultW =
      appId === 'forms'
        ? 780
        : appId === 'os-theme-studio'
          ? 760
          : isLargeApp
            ? 740
            : 620;
    const defaultH =
      appId === 'forms' || appId === 'os-theme-studio'
        ? 560
        : isLargeApp
          ? 520
          : 460;
    const newWin = clampWindowToViewport(
      {
        id: `win-${appId}-${Date.now()}`,
        appId,
        x: savedBounds?.x ?? 240 + offset,
        y: savedBounds?.y ?? 20 + offset,
        width: savedBounds?.width ?? defaultW,
        height: savedBounds?.height ?? defaultH,
        zIndex: nextZ,
        minimized: false,
        maximized: appId === 'docs',
        fullscreen: false,
      },
      vw,
      vh
    );
    setWindows((prev) => [...prev, newWin]);
  };

  const focusWindow = (winId: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => prev.map((w) => (w.id === winId ? { ...w, zIndex: nextZ } : w)));
  };

  const closeWindow = (winId: string) => {
    if (windowAnimation && qualityMode === 'quality') {
      setClosingWindowIds((prev) => (prev.includes(winId) ? prev : [...prev, winId]));
      setTimeout(() => {
        setWindows((prev) => prev.filter((w) => w.id !== winId));
        setClosingWindowIds((prev) => prev.filter((id) => id !== winId));
      }, 150);
    } else {
      setWindows((prev) => prev.filter((w) => w.id !== winId));
    }
  };

  const toggleMinimize = (winId: string) =>
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, minimized: !w.minimized, fullscreen: false } : w))
    );

  const toggleMaximize = (winId: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => applyToggleMaximize(prev, winId, nextZ));
  };

  const toggleFullscreen = (winId: string) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => applyToggleFullscreen(prev, winId, nextZ));
  };

  const snapWindow = (winId: string, zone: Exclude<SnapZone, null>) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => applySnapWindow(prev, winId, zone, nextZ, vw, vh, dockVisible));
  };

  const latestStateRef = useRef({ windows, closingWindowIds, closeWindow, toggleFullscreen });
  latestStateRef.current = { windows, closingWindowIds, closeWindow, toggleFullscreen };
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const { windows: wins, closingWindowIds: closing, closeWindow: closeFn, toggleFullscreen: exitFullFn } =
        latestStateRef.current;
      const activeTop = wins
        .filter((w) => !w.minimized && !closing.includes(w.id))
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      if (activeTop) {
        e.preventDefault();
        if (activeTop.fullscreen) exitFullFn(activeTop.id);
        else closeFn(activeTop.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const arrangeWindows = (mode: WindowArrangeMode) => {
    const visible = windows.filter((w) => !w.minimized);
    if (visible.length === 0) return;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const rects = osWasmEngine.computeArrangeRects(
      visible.length,
      mode,
      Math.max(640, vw - 48),
      Math.max(420, vh - 160)
    );
    setWindows((prev) =>
      prev.map((w) => {
        if (w.minimized) return w;
        const rect = rects[visible.findIndex((v) => v.id === w.id)];
        return rect ? { ...w, maximized: false, fullscreen: false, restoreBounds: undefined, ...rect } : w;
      })
    );
    notify({
      title: 'Pencereler Düzenlendi',
      description:
        mode === 'grid'
          ? 'Izgara (Grid) dizilimi uygulandı.'
          : mode === 'quadrants'
            ? '4 Köşe Kadran dizilimi uygulandı.'
            : mode === 'side-by-side'
              ? 'Yan yana dizilim uygulandı.'
              : 'Kademeli (Cascade) dizilim uygulandı.',
      tone: 'info',
    });
  };

  return {
    windows,
    setWindows,
    windowBoundsByApp,
    topZ,
    closingWindowIds,
    highlightedWindowId,
    openApp,
    focusWindow,
    closeWindow,
    toggleMinimize,
    toggleMaximize,
    toggleFullscreen,
    snapWindow,
    arrangeWindows,
  };
}
