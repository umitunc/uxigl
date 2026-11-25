import React, { useEffect, useRef, useState } from 'react';
import { UXILogo } from '../../../components/brand/UXILogo';
import uxiNoBgPng from '../../../assets/logo/uxi_no_bg.png';
import type { ThemeStudioPanelProps } from './ThemeStudioPanel';
import type { SnapZone } from '../../osgl/windowGeometry';
import type { DesktopWidgetId, WindowArrangeMode } from './types';
import { TopMenuDropdowns, type TopMenuKey } from './TopMenuDropdowns';
import { TopMenuTray } from './TopMenuTray';

export function TopMenuBar({
  onNavigate,
  locale,
  setLocale,
  showMobileLayout,
  isMobileViewport,
  previewDevice,
  setPreviewDevice,
  arrangeMenuOpen,
  setArrangeMenuOpen,
  arrangeWindows,
  onSnapActiveWindow,
  onFullscreenActive,
  closeAllWindows,
  dockVisible,
  onToggleDock,
  widgetsVisible,
  onToggleWidgets,
  enabledWidgets,
  onToggleWidgetItem,
  onCustomizeWidget,
  onResetWidgetPositions,
  onResetIcons,
  onOpenApp,
  onOpenThemeStudio,
  onOpenSpotlight,
  sharedStudioProps,
  isDark,
  effectiveIsLightBg = false,
}: {
  onNavigate?: (sectionId: string, subItemId?: string) => void;
  locale: 'tr' | 'en';
  setLocale: (loc: 'tr' | 'en') => void;
  showMobileLayout: boolean;
  isMobileViewport: boolean;
  previewDevice: 'auto' | 'desktop' | 'mobile';
  setPreviewDevice: React.Dispatch<React.SetStateAction<'auto' | 'desktop' | 'mobile'>>;
  arrangeMenuOpen: boolean;
  setArrangeMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  arrangeWindows: (mode: WindowArrangeMode) => void;
  onSnapActiveWindow?: (zone: Exclude<SnapZone, null>) => void;
  onFullscreenActive?: () => void;
  closeAllWindows: () => void;
  dockVisible: boolean;
  onToggleDock: () => void;
  widgetsVisible?: boolean;
  onToggleWidgets?: () => void;
  enabledWidgets?: Record<DesktopWidgetId, boolean>;
  onToggleWidgetItem?: (id: DesktopWidgetId) => void;
  onCustomizeWidget?: (id: DesktopWidgetId, anchorX: number, anchorY: number) => void;
  onResetWidgetPositions?: () => void;
  onResetIcons: () => void;
  onOpenApp: (id: string) => void;
  onOpenThemeStudio: () => void;
  onOpenSpotlight: () => void;
  sharedStudioProps: ThemeStudioPanelProps;
  isDark: boolean;
  effectiveIsLightBg?: boolean;
  chromeBarBg?: string;
  chromeText?: string;
  chromeBorder?: string;
  chromePillBg?: string;
  glassBlur?: number;
}) {
  const [openMenu, setOpenMenu] = useState<TopMenuKey>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const isTR = locale === 'tr';
  const activeMenu: TopMenuKey = arrangeMenuOpen ? 'window' : openMenu;

  useEffect(() => {
    if (!activeMenu) return;
    const handleOutside = (e: MouseEvent | PointerEvent) => {
      if (headerRef.current && headerRef.current.contains(e.target as Node)) {
        return;
      }
      setOpenMenu(null);
      setArrangeMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setArrangeMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenu, setArrangeMenuOpen]);

  const topTextColor = effectiveIsLightBg ? '#0f172a' : '#ffffff';
  const topPillBg = effectiveIsLightBg ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.16)';

  const trayIconBtnStyle = (active = false): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 7,
    border: 'none',
    backgroundColor: active ? topPillBg : 'transparent',
    color: topTextColor,
    cursor: 'pointer',
  });

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 34,
    left: 0,
    width: 230,
    padding: 6,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
    color: isDark ? '#f8fafc' : '#0f172a',
    backdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(15,23,42,0.12)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.32)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    zIndex: 2100,
  };

  const menuBtnStyle = (active: boolean): React.CSSProperties => ({
    border: 'none',
    background: active ? topPillBg : 'transparent',
    color: topTextColor,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.008em',
    padding: '3px 9px',
    borderRadius: 6,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  const toggleMenu = (key: Exclude<TopMenuKey, null>, e: React.MouseEvent) => {
    e.stopPropagation();
    if (key === 'window') {
      setOpenMenu(null);
      setArrangeMenuOpen((v) => !v);
      return;
    }
    setArrangeMenuOpen(false);
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
    setArrangeMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      onClick={() => closeAllMenus()}
      style={{
        position: 'relative',
        height: 44,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        color: topTextColor,
        background: effectiveIsLightBg
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.12) 65%, rgba(255, 255, 255, 0) 100%)'
          : 'linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.08) 65%, rgba(0, 0, 0, 0) 100%)',
        textShadow: effectiveIsLightBg
          ? '0 1px 2px rgba(255, 255, 255, 0.65)'
          : '0 1px 3px rgba(0, 0, 0, 0.28)',
        zIndex: 2000,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onNavigate?.('landing', 'home')}
          title={onNavigate ? (isTR ? 'uxiGL Ana Sayfaya Dön' : 'Back to uxiGL Home') : 'OSGL'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'transparent',
            padding: '2px 6px 2px 2px',
            marginRight: 4,
            color: topTextColor,
            cursor: onNavigate ? 'pointer' : 'default',
          }}
        >
          <UXILogo
            width={24}
            height={22}
            src={uxiNoBgPng}
            style={{
              filter: effectiveIsLightBg ? 'brightness(0) opacity(0.88)' : 'brightness(100)',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.015em' }}>OSGL</span>
        </button>

        {!showMobileLayout && (
          <TopMenuDropdowns
            activeMenu={activeMenu}
            toggleMenu={toggleMenu}
            closeAllMenus={closeAllMenus}
            isTR={isTR}
            isDark={isDark}
            isMobileViewport={isMobileViewport}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            dockVisible={dockVisible}
            onToggleDock={onToggleDock}
            widgetsVisible={widgetsVisible}
            onToggleWidgets={onToggleWidgets}
            enabledWidgets={enabledWidgets}
            onToggleWidgetItem={onToggleWidgetItem}
            windowAnimation={sharedStudioProps.windowAnimation}
            onToggleWindowAnimation={() =>
              sharedStudioProps.setWindowAnimation(!sharedStudioProps.windowAnimation)
            }
            windowControlsSide={sharedStudioProps.windowControlsSide}
            onToggleWindowControlsSide={
              sharedStudioProps.setWindowControlsSide
                ? () =>
                    sharedStudioProps.setWindowControlsSide?.(
                      sharedStudioProps.windowControlsSide === 'right' ? 'left' : 'right'
                    )
                : undefined
            }
            onToggleMode={() => sharedStudioProps.setMode(isDark ? 'light' : 'dark')}
            onSnapActiveWindow={onSnapActiveWindow}
            onFullscreenActive={onFullscreenActive}
            arrangeWindows={arrangeWindows}
            closeAllWindows={closeAllWindows}
            onResetIcons={onResetIcons}
            onOpenApp={onOpenApp}
            onOpenThemeStudio={onOpenThemeStudio}
            menuBtnStyle={menuBtnStyle}
            dropdownStyle={dropdownStyle}
          />
        )}
      </div>

      <TopMenuTray
        isTR={isTR}
        locale={locale}
        setLocale={setLocale}
        showMobileLayout={showMobileLayout}
        isMobileViewport={isMobileViewport}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        activeMenu={activeMenu}
        toggleMenu={toggleMenu}
        closeAllMenus={closeAllMenus}
        onOpenSpotlight={onOpenSpotlight}
        onOpenThemeStudio={onOpenThemeStudio}
        widgetsVisible={widgetsVisible}
        onToggleWidgets={onToggleWidgets}
        enabledWidgets={enabledWidgets}
        onToggleWidgetItem={onToggleWidgetItem}
        onCustomizeWidget={onCustomizeWidget}
        onResetWidgetPositions={onResetWidgetPositions}
        isDark={isDark}
        trayIconBtnStyle={trayIconBtnStyle}
        dropdownStyle={dropdownStyle}
      />
    </header>
  );
}
