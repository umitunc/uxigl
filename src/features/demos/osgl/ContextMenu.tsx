import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Columns2,
  FolderPlus,
  Grid2x2,
  Layers,
  Palette,
  Pin,
  PinOff,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { OS_WALLPAPERS, type OSWallpaperId } from '../OSGLEngine';
import { ENTERPRISE_APPS, type WindowArrangeMode } from './types';
import { ContextMenuItem } from './WindowChrome';

export function ContextMenu({
  position,
  isDark,
  wallpaper,
  selectedAppIds,
  dockVisible,
  dockAppIds,
  onOpenApp,
  onCreateFolder,
  onOpenDockCustomizer,
  onArrange,
  onSelectWallpaper,
  onToggleDock,
  onTogglePinToDock,
  onResetIcons,
  onCloseAll,
  onCloseMenu,
}: {
  position: { x: number; y: number };
  isDark: boolean;
  wallpaper: OSWallpaperId;
  selectedAppIds: string[];
  dockVisible: boolean;
  dockAppIds: string[];
  onOpenApp: (id: string) => void;
  onCreateFolder?: (initialAppIds?: string[]) => void;
  onOpenDockCustomizer?: () => void;
  onArrange: (mode: WindowArrangeMode) => void;
  onSelectWallpaper: (wp: OSWallpaperId) => void;
  onToggleDock: () => void;
  onTogglePinToDock: (appId: string) => void;
  onResetIcons: () => void;
  onCloseAll: () => void;
  onCloseMenu: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onCloseMenu]);
  const singleAppId = selectedAppIds.length === 1 ? selectedAppIds[0] : null;
  const singleApp = singleAppId ? ENTERPRISE_APPS.find((a) => a.id === singleAppId) : null;
  const isPinned = singleAppId ? dockAppIds.includes(singleAppId) : false;
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number }>({
    left: position.x,
    top: position.y,
  });

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el || typeof window === 'undefined') return;
    const margin = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const w = rect.width || 232;
    const h = rect.height || 340;

    let left = position.x;
    if (left + w > vw - margin) {
      left = Math.max(margin, vw - w - margin);
    }
    left = Math.max(margin, left);

    let top = position.y;
    if (top + h > vh - margin) {
      // Flip above cursor if it fits better, otherwise clamp to bottom margin
      const flipped = position.y - h;
      top = flipped >= margin ? flipped : Math.max(margin, vh - h - margin);
    }
    top = Math.max(margin, top);

    setCoords({ left, top });
  }, [position.x, position.y, selectedAppIds.length]);

  return (
    <div
      ref={menuRef}
      data-macos-context="true"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: coords.left,
        top: coords.top,
        width: 232,
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        padding: 6,
        borderRadius: 14,
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        color: isDark ? '#f8fafc' : '#0f172a',
        backdropFilter: 'blur(26px)',
        border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(15,23,42,0.12)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.36)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 2200,
      }}
    >
      {onCreateFolder && (
        <ContextMenuItem
          icon={<FolderPlus size={14} />}
          label={
            selectedAppIds.length > 0
              ? `Seçilenlerle Klasör Oluştur (${selectedAppIds.length})`
              : 'Yeni Klasör Oluştur'
          }
          onClick={() => {
            onCreateFolder(selectedAppIds.length > 0 ? selectedAppIds : undefined);
            onCloseMenu();
          }}
        />
      )}
      {singleApp && singleAppId && (
        <ContextMenuItem
          icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          label={isPinned ? `${singleApp.shortLabel}: Dock'tan Çıkar` : `${singleApp.shortLabel}: Dock'ta Tut`}
          onClick={() => {
            onTogglePinToDock(singleAppId);
            onCloseMenu();
          }}
        />
      )}
      {selectedAppIds.length > 1 && (
        <ContextMenuItem
          icon={<Sparkles size={14} />}
          label={`Seçilenleri Aç (${selectedAppIds.length})`}
          onClick={() => {
            selectedAppIds.forEach((id) => onOpenApp(id));
            onCloseMenu();
          }}
        />
      )}
      {onOpenDockCustomizer && (
        <ContextMenuItem
          icon={<SlidersHorizontal size={14} />}
          label="Alt Dock Simgelerini Özelleştir..."
          onClick={() => {
            onOpenDockCustomizer();
            onCloseMenu();
          }}
        />
      )}
      <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
      <ContextMenuItem icon={<Sparkles size={14} />} label="Yeni Pencere (Dashboard)" onClick={() => { onOpenApp('overview'); onCloseMenu(); }} />
      <ContextMenuItem icon={<Grid2x2 size={14} />} label="Pencereleri Izgara Diz" onClick={() => { onArrange('grid'); onCloseMenu(); }} />
      <ContextMenuItem icon={<Grid2x2 size={14} />} label="4 Köşe Kadran (2×2)" onClick={() => { onArrange('quadrants'); onCloseMenu(); }} />
      <ContextMenuItem icon={<Layers size={14} />} label="Kademeli Diz (Cascade)" onClick={() => { onArrange('cascade'); onCloseMenu(); }} />
      <ContextMenuItem icon={<Columns2 size={14} />} label="Yan Yana Diz" onClick={() => { onArrange('side-by-side'); onCloseMenu(); }} />
      <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
      <div style={{ padding: '4px 8px', fontSize: 10.5, fontWeight: 700, opacity: 0.6 }}>macOS Duvar Kağıdı</div>
      <div style={{ display: 'flex', gap: 6, padding: '4px 8px 6px', flexWrap: 'wrap' }}>
        {(Object.keys(OS_WALLPAPERS) as OSWallpaperId[]).map((wpId) => (
          <button
            key={wpId}
            type="button"
            title={OS_WALLPAPERS[wpId].name}
            onClick={() => {
              onSelectWallpaper(wpId);
              onCloseMenu();
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              border: wallpaper === wpId ? '2px solid #3b82f6' : '1px solid rgba(148,163,184,0.4)',
              background: OS_WALLPAPERS[wpId].preview,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
      <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
      <ContextMenuItem icon={<Palette size={14} />} label="OS Tema Stüdyosu" onClick={() => { onOpenApp('os-theme-studio'); onCloseMenu(); }} />
      <ContextMenuItem icon={<Layers size={14} />} label={dockVisible ? "Dock'u Gizle" : "Dock'u Göster"} onClick={() => { onToggleDock(); onCloseMenu(); }} />
      <ContextMenuItem icon={<RotateCcw size={14} />} label="Simge Sıralamasını Sıfırla" onClick={() => { onResetIcons(); onCloseMenu(); }} />
      <ContextMenuItem icon={<Trash2 size={14} />} label="Tüm Pencereleri Kapat" onClick={() => { onCloseAll(); onCloseMenu(); }} />
    </div>
  );
}

