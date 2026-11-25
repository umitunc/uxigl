import React from 'react';
import { Badge, GoogleIcon } from '../../../components/primitives';
import { useFloatingWindowPointer } from '../../osgl/useFloatingWindowPointer';
import {
  computeSnapBounds,
  RESIZE_HANDLE_SPECS,
  type SnapZone,
} from '../../osgl/windowGeometry';
import {
  ENTERPRISE_APPS,
  type FloatingWindowState,
  type QualityMode,
  type WindowControlsSide,
} from './types';
import { TrafficLights } from './WindowChrome';
import { WindowContent } from './WindowContent';
import { FULLBLEED_APP_IDS } from './useWindowManager';

export function FloatingWindows({
  windows,
  setWindows,
  closingWindowIds,
  highlightedWindowId,
  windowAnimation,
  windowControlsSide = 'left',
  qualityMode,
  glassOpacity,
  glassBlur,
  customRadiusPx,
  paletteTokens,
  dockVisible = true,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onFullscreen,
  onSnapWindow,
  renderWindowContent,
  sharedStudioProps,
}: {
  windows: FloatingWindowState[];
  setWindows: React.Dispatch<React.SetStateAction<FloatingWindowState[]>>;
  closingWindowIds: string[];
  highlightedWindowId: string | null;
  windowAnimation: boolean;
  windowControlsSide?: WindowControlsSide;
  qualityMode: QualityMode;
  glassOpacity: number;
  glassBlur: number;
  customRadiusPx?: number;
  paletteTokens: {
    primary: string;
    bgElevated: string;
    borderStrong: string;
    borderSubtle: string;
    surfaceTonal: string;
    textPrimary: string;
  };
  dockVisible?: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFullscreen?: (id: string) => void;
  onSnapWindow?: (id: string, zone: Exclude<SnapZone, null>) => void;
  renderWindowContent?: (appId: string) => React.ReactNode;
  sharedStudioProps: Omit<
    React.ComponentProps<typeof WindowContent>,
    'app' | 'contentWidth' | 'renderWindowContent'
  >;
}) {
  const ptr = useFloatingWindowPointer({
    windows,
    dockVisible,
    setWindows,
    onFocus,
    onSnapWindow: onSnapWindow ?? ((id) => onMaximize(id)),
  });

  const visibleWindows = windows.filter((w) => !w.minimized);
  const vwNow = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vhNow = typeof window !== 'undefined' ? window.innerHeight : 800;
  const snapRect = ptr.snapPreview ? computeSnapBounds(ptr.snapPreview, vwNow, vhNow, dockVisible) : null;

  return (
    <>
      {ptr.magneticGuides.map((g, idx) => (
        <div
          key={`${g.orientation}-${g.pos}-${idx}`}
          data-osgl-window-guide={g.kind}
          aria-hidden="true"
          style={
            g.orientation === 'vertical'
              ? {
                  position: 'absolute',
                  left: g.pos,
                  top: g.start,
                  width: 0,
                  height: Math.max(24, g.end - g.start),
                  borderLeft: `1.5px ${g.kind === 'margin' ? 'dashed' : 'solid'} ${paletteTokens.primary}`,
                  boxShadow: `0 0 8px ${paletteTokens.primary}`,
                  opacity: 0.9,
                  pointerEvents: 'none',
                  zIndex: 1945,
                }
              : {
                  position: 'absolute',
                  left: g.start,
                  top: g.pos,
                  width: Math.max(24, g.end - g.start),
                  height: 0,
                  borderTop: `1.5px ${g.kind === 'margin' ? 'dashed' : 'solid'} ${paletteTokens.primary}`,
                  boxShadow: `0 0 8px ${paletteTokens.primary}`,
                  opacity: 0.9,
                  pointerEvents: 'none',
                  zIndex: 1945,
                }
          }
        />
      ))}

      {snapRect && (
        <div
          data-osgl-snap-preview={ptr.snapPreview ?? undefined}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: snapRect.x + 6,
            top: snapRect.y + 6,
            width: Math.max(120, snapRect.width - 12),
            height: Math.max(120, snapRect.height - 12),
            borderRadius: 14,
            border: `2px dashed ${paletteTokens.primary}`,
            backgroundColor: `color-mix(in srgb, ${paletteTokens.primary} 16%, transparent)`,
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 1940,
            transition: 'all 0.12s ease-out',
          }}
        />
      )}

      {visibleWindows.map((win) => {
        const app = ENTERPRISE_APPS.find((m) => m.id === win.appId);
        if (!app) return null;
        const isFullBleed = FULLBLEED_APP_IDS.has(app.id);
        const isFullscreen = Boolean(win.fullscreen);
        const isMaximized = Boolean(win.maximized) && !isFullscreen;
        const isClosing = closingWindowIds.includes(win.id);
        const isHighlighted = highlightedWindowId === win.id;
        const radius = isFullscreen ? 0 : customRadiusPx ? customRadiusPx + 6 : 18;
        const maxBottomReserve = dockVisible ? 104 : 20;

        const winAnimClass = [
          windowAnimation && qualityMode === 'quality'
            ? isClosing
              ? 'macosgl-win-anim-close'
              : 'macosgl-win-anim-open'
            : '',
          isHighlighted ? 'osgl-win-highlight' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={win.id}
            data-macos-window="true"
            data-osgl-window-app={app.id}
            data-osgl-window-maximized={isMaximized ? 'true' : 'false'}
            data-osgl-window-fullscreen={isFullscreen ? 'true' : 'false'}
            className={winAnimClass}
            ref={(el) => {
              ptr.windowRefs.current[win.id] = el;
            }}
            onMouseDown={() => onFocus(win.id)}
            style={
              {
                '--osgl-win-w': `${win.width}px`,
                '--osgl-win-body-h': isFullscreen
                  ? 'calc(100dvh - 44px)'
                  : `${Math.max(180, win.height - 44)}px`,
                position: isFullscreen ? 'fixed' : 'absolute',
                left: isFullscreen ? 0 : isMaximized ? 14 : win.x,
                top: isFullscreen ? 0 : isMaximized ? 12 : win.y,
                width: isFullscreen ? '100vw' : isMaximized ? 'calc(100% - 28px)' : win.width,
                height: isFullscreen
                  ? '100dvh'
                  : isMaximized
                    ? `calc(100% - ${maxBottomReserve}px)`
                    : win.height,
                maxWidth: isFullscreen ? '100vw' : 'calc(100% - 24px)',
                maxHeight: isFullscreen ? '100dvh' : `calc(100% - ${maxBottomReserve}px)`,
                zIndex: isFullscreen ? 3100 + (win.zIndex % 200) : win.zIndex,
                borderRadius: radius,
                border: isFullscreen
                  ? 'none'
                  : isHighlighted
                    ? `2px solid ${paletteTokens.primary}`
                    : `1px solid ${paletteTokens.borderStrong}`,
                boxShadow: isFullscreen
                  ? 'none'
                  : isHighlighted
                    ? `0 0 0 4px color-mix(in srgb, ${paletteTokens.primary} 32%, transparent), 0 28px 80px color-mix(in srgb, ${paletteTokens.primary} 45%, rgba(0,0,0,0.45))`
                    : `0 28px 70px rgba(0, 0, 0, 0.34), inset 0 1px 0 ${paletteTokens.surfaceTonal}`,
                transition: 'border-color 0.18s ease, box-shadow 0.22s ease',
                display: 'flex',
                flexDirection: 'column',
                color: paletteTokens.textPrimary,
              } as React.CSSProperties
            }
          >
            {/* Isolated frosted glass layer so portals inside windows are not trapped by backdrop-filter */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: radius,
                backgroundColor: `color-mix(in srgb, ${paletteTokens.bgElevated} ${Math.round(glassOpacity * 100)}%, transparent)`,
                backdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(160%)` : undefined,
                WebkitBackdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(160%)` : undefined,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            <div
              data-osgl-window-titlebar="true"
              onPointerDown={(e) => ptr.handlePointerDownTitle(e, win)}
              onPointerMove={ptr.handlePointerMoveTitle}
              onPointerUp={ptr.finishDragTitle}
              onPointerCancel={ptr.finishDragTitle}
              onDoubleClick={() => {
                if (isFullscreen && onFullscreen) onFullscreen(win.id);
                else onMaximize(win.id);
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                height: 44,
                padding: '0 14px',
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
                display: 'flex',
                flexDirection: windowControlsSide === 'right' ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: `color-mix(in srgb, ${paletteTokens.surfaceTonal} 42%, transparent)`,
                borderBottom: `1px solid ${paletteTokens.borderSubtle}`,
                cursor: isFullscreen ? 'default' : 'grab',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: windowControlsSide === 'right' ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <TrafficLights
                  maximized={isMaximized}
                  fullscreen={isFullscreen}
                  controlsSide={windowControlsSide}
                  onClose={() => onClose(win.id)}
                  onMinimize={() => onMinimize(win.id)}
                  onMaximize={() => onMaximize(win.id)}
                  onFullscreen={onFullscreen ? () => onFullscreen(win.id) : undefined}
                />
                <div
                  style={{
                    margin: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.85,
                  }}
                >
                  <GoogleIcon name={app.googleIcon} size={16} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 800 }}>{app.label}</span>
              </div>
              <Badge size="sm" variant="tonal" tone="info">
                {app.category}
              </Badge>
            </div>

            <div
              className="macosgl-scroll osgl-win-container"
              style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                minHeight: 0,
                borderBottomLeftRadius: radius,
                borderBottomRightRadius: radius,
                display: 'flex',
                flexDirection: 'column',
                padding: isFullBleed ? 0 : 20,
                overflowY: isFullBleed ? 'hidden' : 'auto',
                overflowX: 'hidden',
              }}
            >
              <WindowContent
                app={app}
                contentWidth={
                  isFullscreen
                    ? vwNow
                    : isMaximized
                      ? vwNow - 28
                      : win.width
                }
                renderWindowContent={renderWindowContent}
                {...sharedStudioProps}
              />
            </div>

            {!isFullscreen &&
              !isMaximized &&
              RESIZE_HANDLE_SPECS.map((spec) => (
                <div
                  key={spec.dir}
                  data-osgl-resize={spec.dir}
                  aria-label={spec.label}
                  title={spec.dir === 'se' ? 'Boyutlandır' : undefined}
                  className={spec.dir === 'se' ? 'macosgl-resize-handle' : undefined}
                  onPointerDown={(e) => ptr.handlePointerDownResize(e, win, spec.dir)}
                  onPointerMove={ptr.handlePointerMoveResize}
                  onPointerUp={ptr.finishResize}
                  onPointerCancel={ptr.finishResize}
                  style={{ ...spec.style, cursor: spec.cursor, touchAction: 'none' }}
                >
                  {spec.dir === 'se' && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRight: '2px solid currentColor',
                        borderBottom: '2px solid currentColor',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </div>
              ))}
          </div>
        );
      })}
    </>
  );
}
