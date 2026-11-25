import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DesktopFolderTile } from '../../osgl/DesktopFolderTile';
import {
  getGroupedAppIdSet,
  toFolderSlotKey,
} from '../../osgl/desktopFoldersAndDock';
import {
  ENTERPRISE_APPS,
  type DesktopFolder,
  type EnterpriseOSApp,
  type FloatingWindowState,
  type IconBgStyle,
} from './types';
import { DesktopIconTile } from './DesktopIconTile';
import { reorderIconSlotsOnDrop } from './desktopGridUtils';

export function DesktopGrid({
  isDark,
  barTextColor,
  effectiveIsLightBg,
  primaryColor,
  iconBgStyle,
  iconBgColor,
  iconGradColor1,
  iconGradColor2,
  iconColor,
  iconSizePx,
  iconLabelScale = 100,
  viewportSize,
  iconSlots,
  setIconSlots,
  selectedAppIds,
  setSelectedAppIds,
  windows,
  onOpenApp,
  folders = [],
  renamingFolderId = null,
  onOpenFolder,
  onCommitRenameFolder,
  onDropAppsIntoFolder,
  children,
}: {
  isDark: boolean;
  barTextColor: string;
  effectiveIsLightBg: boolean;
  primaryColor: string;
  iconBgStyle: IconBgStyle;
  iconBgColor: string;
  iconGradColor1: string;
  iconGradColor2: string;
  iconColor: string;
  iconSizePx: number;
  iconLabelScale?: number;
  viewportSize: { w: number; h: number };
  iconSlots: Record<string, number>;
  setIconSlots: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  selectedAppIds: string[];
  setSelectedAppIds: React.Dispatch<React.SetStateAction<string[]>>;
  windows: FloatingWindowState[];
  onOpenApp: (id: string) => void;
  folders?: DesktopFolder[];
  renamingFolderId?: string | null;
  onOpenFolder?: (folderId: string) => void;
  onCommitRenameFolder?: (folderId: string, nextName: string) => void;
  onDropAppsIntoFolder?: (folderId: string, appIds: string[]) => void;
  children?: React.ReactNode;
}) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [dropInsertSide, setDropInsertSide] = useState<'before' | 'after' | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const marqueeRef = useRef<{ startX: number; startY: number; active: boolean } | null>(null);
  const desktopIconRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const iconBoxSize = Math.max(44, Math.min(84, iconSizePx));
  const iconGlyphSize = Math.round(iconBoxSize * 0.62);
  const cellHeight = iconBoxSize + 50;
  const cellWidth = iconBoxSize + 36;
  const rowGap = 8;
  const colGap = 12;
  const availableGridHeight = Math.max(cellHeight, viewportSize.h - 156);
  const rowsPerColumn = Math.max(1, Math.floor((availableGridHeight + rowGap) / (cellHeight + rowGap)));
  const colsCount = Math.max(4, Math.floor((viewportSize.w - 48 + colGap) / (cellWidth + colGap)));
  const totalGridSlots = rowsPerColumn * colsCount;

  const groupedAppIds = useMemo(() => getGroupedAppIdSet(folders), [folders]);

  const slotToFolder = useMemo(() => {
    const map = new Map<number, DesktopFolder>();
    folders.forEach((folder) => {
      const slot = iconSlots[toFolderSlotKey(folder.id)] ?? 0;
      let resolved = Math.max(0, Math.min(totalGridSlots - 1, slot));
      while (map.has(resolved) && resolved < totalGridSlots - 1) resolved += 1;
      map.set(resolved, folder);
    });
    return map;
  }, [folders, iconSlots, totalGridSlots]);

  const slotToApp = useMemo(() => {
    const map = new Map<number, EnterpriseOSApp>();
    const overflow: EnterpriseOSApp[] = [];
    ENTERPRISE_APPS.forEach((app) => {
      if (groupedAppIds.has(app.id)) return;
      const slot = iconSlots[app.id] ?? 0;
      if (slot < totalGridSlots && !map.has(slot) && !slotToFolder.has(slot)) {
        map.set(slot, app);
      } else {
        overflow.push(app);
      }
    });
    let freeCursor = 0;
    overflow.forEach((app) => {
      while ((map.has(freeCursor) || slotToFolder.has(freeCursor)) && freeCursor < totalGridSlots) {
        freeCursor += 1;
      }
      if (freeCursor < totalGridSlots) map.set(freeCursor, app);
    });
    return map;
  }, [groupedAppIds, iconSlots, slotToFolder, totalGridSlots]);

  // Arrow-key icon selection & Enter-to-open across the column-major desktop grid
  const keyNavRef = useRef({
    slotToApp,
    selectedAppIds,
    rowsPerColumn,
    totalGridSlots,
    setSelectedAppIds,
    onOpenApp,
  });
  keyNavRef.current = {
    slotToApp,
    selectedAppIds,
    rowsPerColumn,
    totalGridSlots,
    setSelectedAppIds,
    onOpenApp,
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [data-menu-dropdown], [data-submenu-panel], nav[aria-label="OSGL Menu Bar"], [data-macos-window="true"]')
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"][aria-modal="true"], [data-menu-dropdown]')) {
        return;
      }

      const {
        slotToApp: sMap,
        selectedAppIds: sel,
        rowsPerColumn: rPerCol,
        totalGridSlots: total,
        setSelectedAppIds: setSel,
        onOpenApp: openFn,
      } = keyNavRef.current;

      if (e.key === 'Enter' && sel.length > 0 && !active?.closest('button:not(.macosgl-app-btn)')) {
        e.preventDefault();
        openFn(sel[0]);
        return;
      }

      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();

      const occupiedSlots = Array.from(sMap.keys()).sort((a, b) => a - b);
      if (occupiedSlots.length === 0) return;

      const currentAppId = sel[0];
      let currentSlot = -1;
      if (currentAppId) {
        for (const [slot, app] of sMap.entries()) {
          if (app.id === currentAppId) {
            currentSlot = slot;
            break;
          }
        }
      }

      if (currentSlot === -1) {
        const firstApp = sMap.get(occupiedSlots[0]);
        if (firstApp) {
          setSel([firstApp.id]);
          desktopIconRefs.current[firstApp.id]?.focus();
        }
        return;
      }

      const curCol = Math.floor(currentSlot / rPerCol);
      const curRow = currentSlot % rPerCol;
      const cols = Math.max(1, Math.ceil(total / rPerCol));

      let nextApp: EnterpriseOSApp | undefined;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const idx = occupiedSlots.indexOf(currentSlot);
        const nextIdx =
          e.key === 'ArrowDown'
            ? (idx + 1) % occupiedSlots.length
            : (idx - 1 + occupiedSlots.length) % occupiedSlots.length;
        nextApp = sMap.get(occupiedSlots[nextIdx]);
      } else {
        const colStep = e.key === 'ArrowRight' ? 1 : -1;
        for (let step = 1; step <= cols; step++) {
          const targetCol = (curCol + colStep * step + cols) % cols;
          const candidateSlot = targetCol * rPerCol + curRow;
          const found = sMap.get(candidateSlot);
          if (found) {
            nextApp = found;
            break;
          }
          // Fallback: any occupied slot in targetCol nearest to curRow
          const inCol = occupiedSlots.filter((s) => Math.floor(s / rPerCol) === targetCol);
          if (inCol.length > 0) {
            inCol.sort((a, b) => Math.abs((a % rPerCol) - curRow) - Math.abs((b % rPerCol) - curRow));
            nextApp = sMap.get(inCol[0]);
            break;
          }
        }
      }

      if (nextApp) {
        setSel([nextApp.id]);
        desktopIconRefs.current[nextApp.id]?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleDropOnSlot = (targetSlot: number, side: 'before' | 'after' | null = null) => {
    if (!draggedAppId) {
      setDragOverSlot(null);
      setDropInsertSide(null);
      return;
    }
    const resolvedTarget =
      side === 'after' ? Math.min(totalGridSlots - 1, targetSlot + 1) : targetSlot;
    setIconSlots((prev) => reorderIconSlotsOnDrop(prev, draggedAppId, resolvedTarget, selectedAppIds));
    setDraggedAppId(null);
    setDragOverSlot(null);
    setDropInsertSide(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[data-macos-window="true"]') ||
      target.closest('[data-macos-dock="true"]') ||
      target.closest('[data-macos-context="true"]')
    ) {
      return;
    }
    setSelectedAppIds([]);
    marqueeRef.current = { startX: e.clientX, startY: e.clientY, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const m = marqueeRef.current;
    if (!m || !m.active) return;
    const left = Math.min(m.startX, e.clientX);
    const top = Math.min(m.startY, e.clientY);
    const width = Math.abs(e.clientX - m.startX);
    const height = Math.abs(e.clientY - m.startY);
    if (width < 4 && height < 4) return;

    const box = { left, top, width, height };
    setSelectionBox(box);

    const hits: string[] = [];
    Object.entries(desktopIconRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!(r.right < box.left || r.left > box.left + box.width || r.bottom < box.top || r.top > box.top + box.height)) {
        hits.push(id);
      }
    });
    setSelectedAppIds(hits);
  };

  const handlePointerUp = () => {
    if (marqueeRef.current) {
      marqueeRef.current.active = false;
      marqueeRef.current = null;
    }
    setSelectionBox(null);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'relative',
        flex: 1,
        padding: '14px 24px 96px',
        overflow: 'hidden',
        userSelect: selectionBox ? 'none' : undefined,
      }}
    >
      <div
        className="macosgl-scroll"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: `repeat(${rowsPerColumn}, ${cellHeight}px)`,
          gridTemplateColumns: `repeat(${colsCount}, ${cellWidth}px)`,
          gap: '8px 12px',
          padding: '6px 4px',
          width: '100%',
          height: availableGridHeight + 12,
          overflow: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
        {Array.from({ length: totalGridSlots }, (_, slotIdx) => {
          const folder = slotToFolder.get(slotIdx);
          const app = slotToApp.get(slotIdx);
          const isDropHighlight = draggedAppId !== null && dragOverSlot === slotIdx;

          if (folder) {
            const folderKey = toFolderSlotKey(folder.id);
            const folderApps = folder.appIds
              .map((id) => ENTERPRISE_APPS.find((a) => a.id === id))
              .filter((a): a is EnterpriseOSApp => Boolean(a));
            return (
              <DesktopFolderTile
                key={folderKey}
                folder={folder}
                folderApps={folderApps}
                slotIdx={slotIdx}
                isRenaming={renamingFolderId === folder.id}
                isSelected={false}
                isDragged={draggedAppId === folderKey}
                isDropHighlight={isDropHighlight && draggedAppId !== folderKey}
                iconBoxSize={iconBoxSize}
                barTextColor={barTextColor}
                effectiveIsLightBg={effectiveIsLightBg}
                isDark={isDark}
                primaryColor={primaryColor}
                iconBgStyle={iconBgStyle}
                iconBgColor={iconBgColor}
                iconGradColor1={iconGradColor1}
                iconGradColor2={iconGradColor2}
                iconColor={iconColor}
                onOpenFolder={() => onOpenFolder?.(folder.id)}
                onCommitRename={(nextName) => onCommitRenameFolder?.(folder.id, nextName)}
                onContextMenu={() => {}}
                onDragStart={() => setDraggedAppId(folderKey)}
                onDragOver={(e) => {
                  if (!draggedAppId) return;
                  e.preventDefault();
                  if (dragOverSlot !== slotIdx) setDragOverSlot(slotIdx);
                }}
                onDragLeave={() => {
                  if (dragOverSlot === slotIdx) setDragOverSlot(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedAppId && !draggedAppId.startsWith('folder:') && onDropAppsIntoFolder) {
                    const batch = selectedAppIds.includes(draggedAppId) ? selectedAppIds : [draggedAppId];
                    onDropAppsIntoFolder(folder.id, batch);
                    setSelectedAppIds([]);
                    setDraggedAppId(null);
                    setDragOverSlot(null);
                    setDropInsertSide(null);
                    return;
                  }
                  handleDropOnSlot(slotIdx);
                }}
                onDragEnd={() => {
                  setDraggedAppId(null);
                  setDragOverSlot(null);
                  setDropInsertSide(null);
                }}
              />
            );
          }

          if (!app) {
            return (
              <div
                key={`slot-${slotIdx}`}
                onDragOver={(e) => {
                  if (!draggedAppId) return;
                  e.preventDefault();
                  if (dragOverSlot !== slotIdx) setDragOverSlot(slotIdx);
                }}
                onDragLeave={() => { if (dragOverSlot === slotIdx) setDragOverSlot(null); }}
                onDrop={(e) => { e.preventDefault(); handleDropOnSlot(slotIdx); }}
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  borderRadius: 16,
                  border: isDropHighlight ? '1.5px dashed rgba(255,255,255,0.65)' : '1.5px solid transparent',
                  backgroundColor: isDropHighlight ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'background-color 0.12s ease, border-color 0.12s ease',
                }}
              />
            );
          }

          return (
            <DesktopIconTile
              key={app.id}
              app={app}
              slotIdx={slotIdx}
              buttonRef={(el) => {
                desktopIconRefs.current[app.id] = el;
              }}
              isOpen={windows.some((w) => w.appId === app.id)}
              isSelected={selectedAppIds.includes(app.id)}
              isDragged={draggedAppId === app.id}
              isDropHighlight={isDropHighlight && draggedAppId !== app.id}
              dropInsertSide={
                isDropHighlight && draggedAppId !== app.id ? dropInsertSide : null
              }
              iconBoxSize={iconBoxSize}
              iconGlyphSize={iconGlyphSize}
              iconLabelScale={iconLabelScale}
              barTextColor={barTextColor}
              effectiveIsLightBg={effectiveIsLightBg}
              isDark={isDark}
              primaryColor={primaryColor}
              iconBgStyle={iconBgStyle}
              iconBgColor={iconBgColor}
              iconGradColor1={iconGradColor1}
              iconGradColor2={iconGradColor2}
              iconColor={iconColor}
              onDragStart={() => {
                if (!selectedAppIds.includes(app.id)) setSelectedAppIds([app.id]);
                setDraggedAppId(app.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const side: 'before' | 'after' =
                  e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                if (dragOverSlot !== slotIdx) setDragOverSlot(slotIdx);
                if (dropInsertSide !== side) setDropInsertSide(side);
              }}
              onDragLeave={() => {
                if (dragOverSlot === slotIdx) {
                  setDragOverSlot(null);
                  setDropInsertSide(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnSlot(slotIdx, dropInsertSide);
              }}
              onDragEnd={() => {
                setDraggedAppId(null);
                setDragOverSlot(null);
                setDropInsertSide(null);
              }}
              onContextMenu={() => {
                if (!selectedAppIds.includes(app.id)) {
                  setSelectedAppIds([app.id]);
                }
              }}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                  e.stopPropagation();
                  setSelectedAppIds((prev) =>
                    prev.includes(app.id) ? prev.filter((id) => id !== app.id) : [...prev, app.id]
                  );
                  return;
                }
                setSelectedAppIds([app.id]);
                onOpenApp(app.id);
              }}
            />
          );
        })}
      </div>

      {selectionBox && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: selectionBox.left,
            top: selectionBox.top,
            width: selectionBox.width,
            height: selectionBox.height,
            backgroundColor: 'rgba(59, 130, 246, 0.16)',
            border: '1px solid rgba(96, 165, 250, 0.78)',
            borderRadius: 5,
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}

      {children}
    </div>
  );
}
