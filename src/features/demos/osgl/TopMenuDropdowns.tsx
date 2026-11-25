import React from 'react';
import {
  BookOpen,
  Box,
  Check,
  Columns2,
  FileText,
  FolderOpen,
  Grid2x2,
  Layers,
  LayoutDashboard,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Smartphone,
  Sparkles,
  Sun,
  Table2,
  Trash2,
  X,
} from 'lucide-react';
import { ContextMenuItem, ContextSubMenu } from './WindowChrome';
import type { SnapZone } from '../../osgl/windowGeometry';
import type { DesktopWidgetId, WindowArrangeMode, WindowControlsSide } from './types';

export type TopMenuKey = 'apps' | 'components' | 'window' | 'view' | 'tools' | 'lang' | 'widgets' | null;

export function TopMenuDropdowns({
  activeMenu,
  toggleMenu,
  closeAllMenus,
  isTR,
  isDark,
  isMobileViewport,
  previewDevice,
  setPreviewDevice,
  dockVisible,
  onToggleDock,
  widgetsVisible,
  onToggleWidgets,
  enabledWidgets,
  onToggleWidgetItem,
  windowAnimation,
  onToggleWindowAnimation,
  windowControlsSide = 'left',
  onToggleWindowControlsSide,
  onToggleMode,
  onSnapActiveWindow,
  onFullscreenActive,
  arrangeWindows,
  closeAllWindows,
  onResetIcons,
  onOpenApp,
  onOpenThemeStudio,
  menuBtnStyle,
  dropdownStyle,
}: {
  activeMenu: TopMenuKey;
  toggleMenu: (key: Exclude<TopMenuKey, null>, e: React.MouseEvent) => void;
  closeAllMenus: () => void;
  isTR: boolean;
  isDark: boolean;
  isMobileViewport: boolean;
  previewDevice: 'auto' | 'desktop' | 'mobile';
  setPreviewDevice: React.Dispatch<React.SetStateAction<'auto' | 'desktop' | 'mobile'>>;
  dockVisible: boolean;
  onToggleDock: () => void;
  widgetsVisible?: boolean;
  onToggleWidgets?: () => void;
  enabledWidgets?: Record<DesktopWidgetId, boolean>;
  onToggleWidgetItem?: (id: DesktopWidgetId) => void;
  windowAnimation: boolean;
  onToggleWindowAnimation: () => void;
  windowControlsSide?: WindowControlsSide;
  onToggleWindowControlsSide?: () => void;
  onToggleMode: () => void;
  onSnapActiveWindow?: (zone: Exclude<SnapZone, null>) => void;
  onFullscreenActive?: () => void;
  arrangeWindows: (mode: WindowArrangeMode) => void;
  closeAllWindows: () => void;
  onResetIcons: () => void;
  onOpenApp: (id: string) => void;
  onOpenThemeStudio: () => void;
  menuBtnStyle: (active: boolean) => React.CSSProperties;
  dropdownStyle: React.CSSProperties;
}) {
  const navRef = React.useRef<HTMLElement | null>(null);
  const TOP_BAR_KEYS = ['apps', 'components', 'window', 'view', 'tools', 'docs'] as const;

  const getDropdownItems = (container: Element | null): HTMLButtonElement[] => {
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLButtonElement>('[data-menu-item="true"]')).filter(
      (btn) => {
        const sub = btn.closest('[data-submenu-panel="true"]');
        return !sub || sub === container;
      }
    );
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const nav = navRef.current;
    if (!nav) return;

    if (e.key === 'Escape' && activeMenu) {
      e.preventDefault();
      e.stopPropagation();
      const key = activeMenu;
      closeAllMenus();
      requestAnimationFrame(() => {
        nav.querySelector<HTMLButtonElement>(`[data-top-menu="${key}"]`)?.focus();
      });
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const activeEl = document.activeElement as HTMLElement | null;
      const inSubmenu = activeEl?.closest('[data-submenu-panel="true"]');
      const activeDropdown = activeMenu
        ? nav.querySelector(`[data-menu-dropdown="${activeMenu}"]`)
        : null;

      if (!activeDropdown) {
        const focusedTop = activeEl?.getAttribute('data-top-menu') as Exclude<TopMenuKey, null> | null;
        if (focusedTop) {
          toggleMenu(focusedTop, e as unknown as React.MouseEvent);
          requestAnimationFrame(() => {
            const panel = nav.querySelector(`[data-menu-dropdown="${focusedTop}"]`);
            const items = getDropdownItems(panel);
            (e.key === 'ArrowUp' ? items[items.length - 1] : items[0])?.focus();
          });
        }
        return;
      }

      const container = inSubmenu ?? activeDropdown;
      const items = getDropdownItems(container);
      if (items.length === 0) return;
      const curIdx = items.findIndex((el) => el === activeEl);
      const nextIdx =
        curIdx === -1
          ? e.key === 'ArrowDown'
            ? 0
            : items.length - 1
          : e.key === 'ArrowDown'
          ? (curIdx + 1) % items.length
          : (curIdx - 1 + items.length) % items.length;
      items[nextIdx]?.focus();
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const activeEl = document.activeElement as HTMLElement | null;
      const focusedTop = activeEl?.getAttribute('data-top-menu');
      const currentKey =
        (activeMenu as (typeof TOP_BAR_KEYS)[number] | null) ??
        (focusedTop as (typeof TOP_BAR_KEYS)[number] | undefined) ??
        null;
      if (!currentKey) return;

      const curIdx = TOP_BAR_KEYS.indexOf(currentKey);
      if (curIdx === -1) return;
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const nextKey = TOP_BAR_KEYS[(curIdx + delta + TOP_BAR_KEYS.length) % TOP_BAR_KEYS.length];

      if (nextKey === 'docs') {
        closeAllMenus();
        nav.querySelector<HTMLButtonElement>('[data-top-menu="docs"]')?.focus();
        return;
      }

      if (activeMenu) {
        toggleMenu(nextKey, e as unknown as React.MouseEvent);
        requestAnimationFrame(() => {
          const panel = nav.querySelector(`[data-menu-dropdown="${nextKey}"]`);
          const items = getDropdownItems(panel);
          if (items.length > 0) {
            items[0].focus();
          } else {
            nav.querySelector<HTMLButtonElement>(`[data-top-menu="${nextKey}"]`)?.focus();
          }
        });
      } else {
        nav.querySelector<HTMLButtonElement>(`[data-top-menu="${nextKey}"]`)?.focus();
      }
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="OSGL Menu Bar"
      onKeyDown={handleMenuKeyDown}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      <div style={{ position: 'relative' }}>
        <button type="button" data-top-menu="apps" onClick={(e) => toggleMenu('apps', e)} style={menuBtnStyle(activeMenu === 'apps')}>
          {isTR ? 'Uygulamalar' : 'Apps'}
        </button>
        {activeMenu === 'apps' && (
          <div data-menu-dropdown="apps" onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
            <ContextMenuItem icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => { onOpenApp('overview'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Sparkles size={14} />} label="Analytics" onClick={() => { onOpenApp('analytics'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Layers size={14} />} label="Kanban" onClick={() => { onOpenApp('page-kanban'); closeAllMenus(); }} />
            <ContextMenuItem icon={<FileText size={14} />} label="Messages" onClick={() => { onOpenApp('messages'); closeAllMenus(); }} />
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" data-top-menu="components" onClick={(e) => toggleMenu('components', e)} style={menuBtnStyle(activeMenu === 'components')}>
          {isTR ? 'Bileşenler' : 'Components'}
        </button>
        {activeMenu === 'components' && (
          <div data-menu-dropdown="components" onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
            <ContextMenuItem icon={<Table2 size={14} />} label="SheetGL Grid" onClick={() => { onOpenApp('datatable-statcard'); closeAllMenus(); }} />
            <ContextMenuItem icon={<FolderOpen size={14} />} label="FileManGL Explorer" onClick={() => { onOpenApp('filemangl-explorer'); closeAllMenus(); }} />
            <ContextMenuItem icon={<FileText size={14} />} label="Forms & Inputs" onClick={() => { onOpenApp('forms'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Box size={14} />} label="UI Components" onClick={() => { onOpenApp('elements-overview'); closeAllMenus(); }} />
            <ContextSubMenu icon={<Layers size={14} />} label="Page Templates" isDark={isDark}>
              <ContextMenuItem icon={<Layers size={14} />} label="Login & Auth" onClick={() => { onOpenApp('page-login'); closeAllMenus(); }} />
              <ContextMenuItem icon={<Sparkles size={14} />} label="SaaS Pricing" onClick={() => { onOpenApp('page-pricing'); closeAllMenus(); }} />
              <ContextMenuItem icon={<Grid2x2 size={14} />} label="Kanban Board" onClick={() => { onOpenApp('page-kanban'); closeAllMenus(); }} />
              <ContextMenuItem icon={<FileText size={14} />} label="User Profile" onClick={() => { onOpenApp('page-profile'); closeAllMenus(); }} />
              <ContextMenuItem icon={<Palette size={14} />} label="Enterprise Settings" onClick={() => { onOpenApp('page-settings'); closeAllMenus(); }} />
            </ContextSubMenu>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" data-top-menu="window" onClick={(e) => toggleMenu('window', e)} style={menuBtnStyle(activeMenu === 'window')}>
          {isTR ? 'Pencere' : 'Window'}
        </button>
        {activeMenu === 'window' && (
          <div data-menu-dropdown="window" onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
            {onFullscreenActive && (
              <ContextMenuItem
                icon={<Monitor size={14} />}
                label={isTR ? 'Aktif Pencereyi Tam Ekran Yap' : 'Fullscreen Active Window'}
                onClick={() => { onFullscreenActive(); closeAllMenus(); }}
              />
            )}
            {onSnapActiveWindow && (
              <ContextSubMenu icon={<Columns2 size={14} />} label={isTR ? 'Aktif Pencereyi Köşeye Yasla' : 'Snap Active Window'} isDark={isDark}>
                <ContextMenuItem icon={<Columns2 size={14} />} label={isTR ? 'Sol Yarıya Yasla' : 'Snap Left Half'} onClick={() => { onSnapActiveWindow('left-half'); closeAllMenus(); }} />
                <ContextMenuItem icon={<Columns2 size={14} />} label={isTR ? 'Sağ Yarıya Yasla' : 'Snap Right Half'} onClick={() => { onSnapActiveWindow('right-half'); closeAllMenus(); }} />
                <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? 'Sol Üst Çeyrek (1/4)' : 'Top-Left Quadrant'} onClick={() => { onSnapActiveWindow('top-left'); closeAllMenus(); }} />
                <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? 'Sağ Üst Çeyrek (1/4)' : 'Top-Right Quadrant'} onClick={() => { onSnapActiveWindow('top-right'); closeAllMenus(); }} />
                <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? 'Sol Alt Çeyrek (1/4)' : 'Bottom-Left Quadrant'} onClick={() => { onSnapActiveWindow('bottom-left'); closeAllMenus(); }} />
                <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? 'Sağ Alt Çeyrek (1/4)' : 'Bottom-Right Quadrant'} onClick={() => { onSnapActiveWindow('bottom-right'); closeAllMenus(); }} />
              </ContextSubMenu>
            )}
            <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? 'Izgara Dizilimi (Grid)' : 'Tile Grid'} onClick={() => { arrangeWindows('grid'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? '4 Köşe Kadran (2×2)' : '4-Corner Quadrants'} onClick={() => { arrangeWindows('quadrants'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Layers size={14} />} label={isTR ? 'Kademeli Dizilim (Cascade)' : 'Cascade'} onClick={() => { arrangeWindows('cascade'); closeAllMenus(); }} />
            <ContextMenuItem icon={<Columns2 size={14} />} label={isTR ? 'Yan Yana Diz' : 'Side by Side'} onClick={() => { arrangeWindows('side-by-side'); closeAllMenus(); }} />
            {onToggleWindowControlsSide && (
              <ContextMenuItem
                icon={<Monitor size={14} />}
                label={
                  windowControlsSide === 'left'
                    ? isTR
                      ? 'Pencere Düğmeleri: Sağa Al'
                      : 'Window Controls: Move Right'
                    : isTR
                    ? 'Pencere Düğmeleri: Sola Al'
                    : 'Window Controls: Move Left'
                }
                onClick={() => {
                  onToggleWindowControlsSide();
                  closeAllMenus();
                }}
              />
            )}
            <ContextSubMenu icon={<Monitor size={14} />} label={isTR ? 'Hızlı Düzenler' : 'Quick Layouts'} isDark={isDark}>
              <ContextMenuItem icon={<Grid2x2 size={14} />} label={isTR ? '2×2 Eşit Izgara' : '2×2 Even Grid'} onClick={() => { arrangeWindows('grid'); closeAllMenus(); }} />
              <ContextMenuItem icon={<Columns2 size={14} />} label={isTR ? 'Sol / Sağ Bölünmüş' : 'Split Left / Right'} onClick={() => { arrangeWindows('side-by-side'); closeAllMenus(); }} />
              <ContextMenuItem icon={<Layers size={14} />} label={isTR ? 'Kademeli Yığın' : 'Stacked Cascade'} onClick={() => { arrangeWindows('cascade'); closeAllMenus(); }} />
            </ContextSubMenu>
            <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
            <ContextMenuItem icon={<X size={14} />} label={isTR ? 'Tüm Pencereleri Kapat' : 'Close All Windows'} onClick={() => { closeAllWindows(); closeAllMenus(); }} />
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" data-top-menu="view" onClick={(e) => toggleMenu('view', e)} style={menuBtnStyle(activeMenu === 'view')}>
          {isTR ? 'Görünüm' : 'View'}
        </button>
        {activeMenu === 'view' && (
          <div data-menu-dropdown="view" onClick={(e) => e.stopPropagation()} style={{ ...dropdownStyle, width: 245 }}>
            <ContextMenuItem
              icon={isDark ? <Sun size={14} /> : <Moon size={14} />}
              label={isDark ? (isTR ? 'Aydınlık Moda Geç' : 'Switch to Light Mode') : isTR ? 'Karanlık Moda Geç' : 'Switch to Dark Mode'}
              onClick={() => { onToggleMode(); closeAllMenus(); }}
            />
            <ContextMenuItem
              icon={<Layers size={14} />}
              label={dockVisible ? (isTR ? "Dock'u Gizle" : 'Hide Dock') : isTR ? "Dock'u Göster" : 'Show Dock'}
              onClick={() => { onToggleDock(); closeAllMenus(); }}
            />
            {onToggleWidgets && (
              <ContextMenuItem
                icon={<LayoutDashboard size={14} />}
                label={widgetsVisible ? (isTR ? "Widget'ları Gizle" : 'Hide Widgets') : isTR ? "Widget'ları Göster" : 'Show Widgets'}
                onClick={() => { onToggleWidgets(); closeAllMenus(); }}
              />
            )}
            {widgetsVisible && enabledWidgets && onToggleWidgetItem && (
              <ContextSubMenu
                icon={<Grid2x2 size={14} />}
                label={isTR ? 'Masaüstü Widgetları' : 'Desktop Widgets'}
                isDark={isDark}
              >
                {(
                  [
                    { id: 'clock', tr: 'Saat & Takvim', en: 'Clock & Calendar' },
                    { id: 'kpi', tr: 'Dashboard KPI & Grafik', en: 'Dashboard KPI & Chart' },
                    { id: 'timer', tr: 'Odak Sayacı', en: 'Focus Timer' },
                    { id: 'todo', tr: 'Yapılacaklar', en: 'To-Do List' },
                    { id: 'notes', tr: 'Hızlı Notlar', en: 'Quick Notes' },
                    { id: 'system', tr: 'Sistem Özeti', en: 'System Status' },
                  ] as Array<{ id: DesktopWidgetId; tr: string; en: string }>
                ).map((w) => (
                  <ContextMenuItem
                    key={w.id}
                    icon={
                      <span style={{ width: 14, display: 'inline-flex', justifyContent: 'center', color: enabledWidgets[w.id] ? '#3b82f6' : 'transparent' }}>
                        <Check size={13} />
                      </span>
                    }
                    label={isTR ? w.tr : w.en}
                    onClick={() => onToggleWidgetItem(w.id)}
                  />
                ))}
              </ContextSubMenu>
            )}
            <ContextMenuItem
              icon={<Sparkles size={14} />}
              label={windowAnimation ? (isTR ? 'Pencere Efektini Kapat' : 'Disable Window Effects') : isTR ? 'Pencere Efektini Aç' : 'Enable Window Effects'}
              onClick={() => { onToggleWindowAnimation(); closeAllMenus(); }}
            />
            {!isMobileViewport && (
              <ContextMenuItem
                icon={previewDevice === 'mobile' ? <Monitor size={14} /> : <Smartphone size={14} />}
                label={previewDevice === 'mobile' ? (isTR ? 'Masaüstü Görünümü' : 'Desktop View') : isTR ? 'Mobil Önizleme' : 'Mobile Preview'}
                onClick={() => { setPreviewDevice((prev) => (prev === 'mobile' ? 'desktop' : 'mobile')); closeAllMenus(); }}
              />
            )}
            <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
            <ContextMenuItem
              icon={<Palette size={14} />}
              label={isTR ? 'Tema Stüdyosu...' : 'Theme Studio...'}
              onClick={() => { closeAllMenus(); onOpenThemeStudio(); }}
            />
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" data-top-menu="tools" onClick={(e) => toggleMenu('tools', e)} style={menuBtnStyle(activeMenu === 'tools')}>
          {isTR ? 'Araçlar' : 'Tools'}
        </button>
        {activeMenu === 'tools' && (
          <div data-menu-dropdown="tools" onClick={(e) => e.stopPropagation()} style={dropdownStyle}>
            <ContextMenuItem icon={<RotateCcw size={14} />} label={isTR ? 'Simge Sıralamasını Sıfırla' : 'Reset Icon Layout'} onClick={() => { onResetIcons(); closeAllMenus(); }} />
            <ContextMenuItem icon={<Trash2 size={14} />} label={isTR ? 'Masaüstünü Temizle' : 'Clear Desktop'} onClick={() => { closeAllWindows(); closeAllMenus(); }} />
          </div>
        )}
      </div>

      <button
        type="button"
        data-top-menu="docs"
        onClick={() => { closeAllMenus(); onOpenApp('docs'); }}
        style={{ ...menuBtnStyle(false), display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        <BookOpen size={13} />
        <span>{isTR ? 'Dokümantasyon' : 'Docs'}</span>
      </button>
    </nav>
  );
}

