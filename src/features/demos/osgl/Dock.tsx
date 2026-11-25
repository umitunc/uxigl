import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Pin, PinOff, X } from 'lucide-react';
import { GoogleIcon } from '../../../components/primitives';
import {
  ENTERPRISE_APPS,
  resolveIconSurface,
  type FloatingWindowState,
  type IconBgStyle,
} from './types';
import { ContextMenuItem } from './WindowChrome';

export function Dock({
  isDark,
  glassBlur,
  windows,
  dockAppIds,
  onTogglePinToDock,
  onReorderDockApps,
  locale = 'tr',
  iconBgStyle,
  iconBgColor,
  iconGradColor1,
  iconGradColor2,
  iconColor,
  primaryColor,
  onOpenApp,
  onCloseApp,
  onOpenDockCustomizer,
  onArrangeGrid,
  onResetWindows,
  onCloseAll,
}: {
  isDark: boolean;
  glassBlur: number;
  windows: FloatingWindowState[];
  dockAppIds: string[];
  onTogglePinToDock: (id: string) => void;
  onReorderDockApps: (fromId: string, toId: string, position?: 'before' | 'after') => void;
  locale?: 'tr' | 'en';
  iconBgStyle: IconBgStyle;
  iconBgColor: string;
  iconGradColor1: string;
  iconGradColor2: string;
  iconColor: string;
  primaryColor: string;
  onOpenApp: (id: string) => void;
  onCloseApp?: (id: string) => void;
  onOpenDockCustomizer?: () => void;
  onArrangeGrid: () => void;
  onResetWindows: () => void;
  onCloseAll: () => void;
}) {
  const isTR = locale === 'tr';
  const dockItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dockRestingCenters = useRef<number[]>([]);
  const dockRafRef = useRef<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dockContext, setDockContext] = useState<{ appId: string; x: number; y: number } | null>(null);
  const [draggedDockId, setDraggedDockId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{ id: string; side: 'before' | 'after' } | null>(null);

  const visibleDockIds = useMemo(() => {
    const runningUnpinned = Array.from(
      new Set(windows.map((w) => w.appId).filter((id) => !dockAppIds.includes(id)))
    );
    return [...dockAppIds, ...runningUnpinned].filter((id) =>
      ENTERPRISE_APPS.some((a) => a.id === id)
    );
  }, [dockAppIds, windows]);

  useEffect(() => {
    if (!dockContext) return;
    const close = () => setDockContext(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dockContext]);

  const renderDockTooltip = (label: string) => (
    <span
      role="tooltip"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <span
        style={{
          padding: '5px 10px',
          borderRadius: 8,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)',
          color: isDark ? '#f8fafc' : '#0f172a',
          backdropFilter: glassBlur > 0 ? 'blur(16px) saturate(160%)' : undefined,
          WebkitBackdropFilter: glassBlur > 0 ? 'blur(16px) saturate(160%)' : undefined,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(15, 23, 42, 0.10)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </span>
  );

  const handleMouseEnter = () => {
    dockRestingCenters.current = dockItemRefs.current.map((btn) => {
      if (!btn) return 0;
      const rect = btn.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    if (dockRestingCenters.current.length === 0) handleMouseEnter();
    if (dockRafRef.current !== null) cancelAnimationFrame(dockRafRef.current);
    dockRafRef.current = requestAnimationFrame(() => {
      const maxDist = 150;
      dockItemRefs.current.forEach((btn, idx) => {
        if (!btn) return;
        const baseSize = idx >= visibleDockIds.length ? 44 : 46;
        const center = dockRestingCenters.current[idx] ?? 0;
        const dist = Math.abs(clientX - center);
        const factor = dist < maxDist ? Math.cos((dist / maxDist) * (Math.PI / 2)) : 0;
        const scale = 1 + factor * 0.48;
        const nextSize = Math.round(baseSize * scale);
        btn.style.transition = 'none';
        btn.style.width = `${nextSize}px`;
        btn.style.height = `${nextSize}px`;
        btn.style.borderRadius = `${Math.round(13 * scale)}px`;
        const glyph = btn.firstElementChild as HTMLElement | null;
        if (glyph) {
          glyph.style.transition = 'none';
          glyph.style.transform = `scale(${scale.toFixed(3)})`;
        }
      });
      dockRafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (dockRafRef.current !== null) {
      cancelAnimationFrame(dockRafRef.current);
      dockRafRef.current = null;
    }
    dockRestingCenters.current = [];
    dockItemRefs.current.forEach((btn, idx) => {
      if (!btn) return;
      const baseSize = idx >= visibleDockIds.length ? 44 : 46;
      btn.style.transition = 'width 0.16s ease-out, height 0.16s ease-out, border-radius 0.16s ease-out';
      btn.style.width = `${baseSize}px`;
      btn.style.height = `${baseSize}px`;
      btn.style.borderRadius = '13px';
      const glyph = btn.firstElementChild as HTMLElement | null;
      if (glyph) {
        glyph.style.transition = 'transform 0.16s ease-out';
        glyph.style.transform = 'scale(1)';
      }
    });
  };

  return (
    <div
      data-macos-dock="true"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 14,
        transform: 'translateX(-50%)',
        padding: '10px 14px',
        borderRadius: 22,
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.62)' : 'rgba(255, 255, 255, 0.54)',
        backdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(160%)` : undefined,
        WebkitBackdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(160%)` : undefined,
        border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(255, 255, 255, 0.56)',
        boxShadow: isDark ? '0 22px 54px rgba(0, 0, 0, 0.55)' : '0 20px 50px rgba(15, 23, 42, 0.22)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        zIndex: 1950,
      }}
    >
      {visibleDockIds.map((id, idx) => {
        const app = ENTERPRISE_APPS.find((m) => m.id === id);
        if (!app) return null;
        const isRunning = windows.some((w) => w.appId === id);
        const dropSide =
          draggedDockId !== null && draggedDockId !== id && dragOverInfo?.id === id
            ? dragOverInfo.side
            : null;
        const dockSurf = resolveIconSurface(app, iconBgStyle, primaryColor, isDark, iconColor, iconBgColor, iconGradColor1, iconGradColor2);
        return (
          <React.Fragment key={id}>
            {dropSide === 'before' && (
              <span
                aria-hidden="true"
                style={{
                  width: 3,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 10px ${primaryColor}`,
                  alignSelf: 'center',
                  flexShrink: 0,
                }}
              />
            )}
            <button
              ref={(el) => { dockItemRefs.current[idx] = el; }}
              type="button"
              draggable
              aria-label={app.label}
              onDragStart={(e) => {
                setDraggedDockId(id);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', id);
              }}
              onDragOver={(e) => {
                if (!draggedDockId || draggedDockId === id) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const rect = e.currentTarget.getBoundingClientRect();
                const side: 'before' | 'after' =
                  e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
                if (dragOverInfo?.id !== id || dragOverInfo?.side !== side) {
                  setDragOverInfo({ id, side });
                }
              }}
              onDragLeave={() => {
                if (dragOverInfo?.id === id) setDragOverInfo(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedDockId && draggedDockId !== id) {
                  onReorderDockApps(draggedDockId, id, dropSide ?? 'before');
                }
                setDraggedDockId(null);
                setDragOverInfo(null);
              }}
              onDragEnd={() => {
                setDraggedDockId(null);
                setDragOverInfo(null);
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx((prev) => (prev === idx ? null : prev))}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx((prev) => (prev === idx ? null : prev))}
              onClick={() => {
                setDockContext(null);
                onOpenApp(id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setDockContext({
                  appId: id,
                  x: Math.max(12, Math.min(rect.left, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 210)),
                  y: Math.max(12, rect.top - 92),
                });
              }}
              style={{
                position: 'relative',
                width: 46,
                height: 46,
                padding: 0,
                borderRadius: 13,
                border: dockSurf.border ?? 'none',
                background: dockSurf.background,
                backdropFilter: dockSurf.backdropFilter,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: dockSurf.color,
                opacity: draggedDockId === id ? 0.45 : 1,
                boxShadow: '0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)',
                transition: 'width 0.1s ease-out, height 0.1s ease-out, border-radius 0.1s ease-out, opacity 0.12s ease',
                flexShrink: 0,
              }}
            >
              {hoveredIdx === idx && renderDockTooltip(app.label)}
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s ease-out', pointerEvents: 'none' }}>
                <GoogleIcon name={app.googleIcon} size={28} />
              </span>
              {isRunning && (
                <span style={{ position: 'absolute', bottom: -7, width: 4.5, height: 4.5, borderRadius: 999, backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.45)' }} />
              )}
            </button>
            {dropSide === 'after' && (
              <span
                aria-hidden="true"
                style={{
                  width: 3,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 10px ${primaryColor}`,
                  alignSelf: 'center',
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      <div style={{ width: 1, height: 30, alignSelf: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.16)', margin: '0 2px' }} />

      {(
        [
          ...(onOpenDockCustomizer
            ? [
                {
                  id: 'dock-customize',
                  label: isTR ? 'Alt Dock Simgelerini Özelleştir' : 'Customize Dock Icons',
                  googleIcon: 'add_circle',
                  gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  onClick: onOpenDockCustomizer,
                },
              ]
            : []),
          {
            id: 'dock-arrange-grid',
            label: isTR ? 'Pencereleri Izgara Diz' : 'Tile Windows (Grid)',
            googleIcon: 'grid_view',
            gradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
            onClick: onArrangeGrid,
          },
          {
            id: 'dock-reset-windows',
            label: 'Pencereleri Sıfırla',
            googleIcon: 'restart_alt',
            gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
            onClick: onResetWindows,
          },
          {
            id: 'dock-close-all',
            label: 'Tüm Pencereleri Kapat',
            googleIcon: 'delete_sweep',
            gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            onClick: onCloseAll,
          },
        ] as const
      ).map((action, offsetIdx) => {
        const idx = visibleDockIds.length + offsetIdx;
        const dockSurf = resolveIconSurface(
          {
            id: action.id,
            label: action.label,
            shortLabel: action.label,
            googleIcon: action.googleIcon,
            category: 'Apps',
            gradient: action.gradient,
          },
          iconBgStyle,
          primaryColor,
          isDark,
          iconColor,
          iconBgColor,
          iconGradColor1,
          iconGradColor2
        );
        return (
          <button
            key={action.id}
            ref={(el) => { dockItemRefs.current[idx] = el; }}
            type="button"
            aria-label={action.label}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx((prev) => (prev === idx ? null : prev))}
            onFocus={() => setHoveredIdx(idx)}
            onBlur={() => setHoveredIdx((prev) => (prev === idx ? null : prev))}
            onClick={action.onClick}
            style={{
              position: 'relative',
              width: 46,
              height: 46,
              padding: 0,
              borderRadius: 13,
              border: dockSurf.border ?? 'none',
              background: dockSurf.background,
              backdropFilter: dockSurf.backdropFilter,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: dockSurf.color,
              boxShadow: '0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.4)',
              transition: 'width 0.1s ease-out, height 0.1s ease-out, border-radius 0.1s ease-out',
              flexShrink: 0,
            }}
          >
            {hoveredIdx === idx && renderDockTooltip(action.label)}
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s ease-out', pointerEvents: 'none' }}>
              <GoogleIcon name={action.googleIcon} size={26} />
            </span>
          </button>
        );
      })}

      {dockContext && typeof document !== 'undefined' && (() => {
        const isPinned = dockAppIds.includes(dockContext.appId);
        const isRunning = windows.some((w) => w.appId === dockContext.appId);
        return createPortal(
          <div
            data-macos-context="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: dockContext.x,
              top: dockContext.y,
              width: 196,
              padding: 6,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              color: isDark ? '#f8fafc' : '#0f172a',
              backdropFilter: 'blur(24px)',
              border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(15,23,42,0.12)',
              boxShadow: '0 18px 42px rgba(0,0,0,0.34)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              zIndex: 2300,
            }}
          >
            {isRunning && onCloseApp ? (
              <ContextMenuItem
                icon={<X size={14} />}
                label={isTR ? 'Uygulamayı Kapat' : 'Close App'}
                onClick={() => {
                  onCloseApp(dockContext.appId);
                  setDockContext(null);
                }}
              />
            ) : (
              <ContextMenuItem
                icon={<ExternalLink size={14} />}
                label={isTR ? 'Uygulamayı Aç' : 'Open App'}
                onClick={() => {
                  onOpenApp(dockContext.appId);
                  setDockContext(null);
                }}
              />
            )}
            <ContextMenuItem
              icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              label={
                isPinned
                  ? isTR
                    ? "Dock'tan Çıkar"
                    : 'Remove from Dock'
                  : isTR
                  ? "Dock'ta Tut"
                  : 'Keep in Dock'
              }
              onClick={() => {
                onTogglePinToDock(dockContext.appId);
                setDockContext(null);
              }}
            />
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
