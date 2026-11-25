import React from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  Monitor,
  Palette,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import { ContextMenuItem, MenuBarClock } from './WindowChrome';
import type { TopMenuKey } from './TopMenuDropdowns';
import type { DesktopWidgetId } from './types';
import { WIDGET_LABELS } from './widgets/renderWidgetCard';

export function TopMenuTray({
  isTR,
  locale,
  setLocale,
  showMobileLayout,
  isMobileViewport,
  previewDevice,
  setPreviewDevice,
  activeMenu,
  toggleMenu,
  closeAllMenus,
  onOpenSpotlight,
  onOpenThemeStudio,
  widgetsVisible,
  onToggleWidgets,
  enabledWidgets,
  onToggleWidgetItem,
  onCustomizeWidget,
  onResetWidgetPositions,
  isDark = false,
  trayIconBtnStyle,
  dropdownStyle,
}: {
  isTR: boolean;
  locale: 'tr' | 'en';
  setLocale: (loc: 'tr' | 'en') => void;
  showMobileLayout: boolean;
  isMobileViewport: boolean;
  previewDevice: 'auto' | 'desktop' | 'mobile';
  setPreviewDevice: React.Dispatch<React.SetStateAction<'auto' | 'desktop' | 'mobile'>>;
  activeMenu: TopMenuKey;
  toggleMenu: (key: Exclude<TopMenuKey, null>, e: React.MouseEvent) => void;
  closeAllMenus: () => void;
  onOpenSpotlight: () => void;
  onOpenThemeStudio: () => void;
  widgetsVisible?: boolean;
  onToggleWidgets?: () => void;
  enabledWidgets?: Record<DesktopWidgetId, boolean>;
  onToggleWidgetItem?: (id: DesktopWidgetId) => void;
  onCustomizeWidget?: (id: DesktopWidgetId, anchorX: number, anchorY: number) => void;
  onResetWidgetPositions?: () => void;
  isDark?: boolean;
  trayIconBtnStyle: (active?: boolean) => React.CSSProperties;
  dropdownStyle: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {!showMobileLayout && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSpotlight();
          }}
          title={isTR ? 'Hızlı Arama (Ctrl+K)' : 'Quick Search (Ctrl+K)'}
          style={trayIconBtnStyle()}
        >
          <Search size={16} />
        </button>
      )}
      {!isMobileViewport && (
        <button
          type="button"
          onClick={() => setPreviewDevice((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'))}
          title={isTR ? 'Masaüstü / Mobil Görünüm Değiştir' : 'Toggle Desktop / Mobile'}
          style={trayIconBtnStyle(previewDevice === 'mobile')}
        >
          {previewDevice === 'mobile' ? <Monitor size={16} /> : <Smartphone size={16} />}
        </button>
      )}

      <button
        type="button"
        onClick={onOpenThemeStudio}
        title={isTR ? 'OS Tema Stüdyosu' : 'OS Theme Studio'}
        style={trayIconBtnStyle()}
      >
        <Palette size={16} />
      </button>

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={(e) => toggleMenu('lang', e)}
          title={isTR ? `Dil: ${locale.toUpperCase()}` : `Language: ${locale.toUpperCase()}`}
          style={trayIconBtnStyle(activeMenu === 'lang')}
        >
          <Globe size={16} />
        </button>
        {activeMenu === 'lang' && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...dropdownStyle,
              left: 'auto',
              right: 0,
              width: 140,
            }}
          >
            <ContextMenuItem
              icon={<span style={{ fontSize: 12, fontWeight: 800 }}>TR</span>}
              label="Türkçe"
              onClick={() => {
                setLocale('tr');
                closeAllMenus();
              }}
            />
            <ContextMenuItem
              icon={<span style={{ fontSize: 12, fontWeight: 800 }}>EN</span>}
              label="English"
              onClick={() => {
                setLocale('en');
                closeAllMenus();
              }}
            />
          </div>
        )}
      </div>

      {/* Widget Settings Trigger Right Next to the Clock */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          aria-label={isTR ? 'Widget Ayarları' : 'Widget Settings'}
          title={isTR ? 'Widget Ayarları' : 'Widget Settings'}
          onClick={(e) => toggleMenu('widgets', e)}
          style={trayIconBtnStyle(activeMenu === 'widgets')}
        >
          <LayoutGrid size={15.5} />
        </button>
        {activeMenu === 'widgets' && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...dropdownStyle,
              left: 'auto',
              right: 0,
              width: 268,
            }}
          >
            <div
              style={{
                padding: '5px 8px 3px',
                fontSize: 11,
                fontWeight: 700,
                opacity: 0.65,
                letterSpacing: '0.02em',
              }}
            >
              {isTR ? 'Masaüstü Widget Ayarları' : 'Desktop Widget Settings'}
            </div>
            {onToggleWidgets && (
              <ContextMenuItem
                icon={widgetsVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                label={
                  widgetsVisible
                    ? isTR
                      ? "Tüm Widget'ları Gizle"
                      : 'Hide All Widgets'
                    : isTR
                      ? "Widget'ları Göster"
                      : 'Show All Widgets'
                }
                onClick={() => onToggleWidgets()}
              />
            )}
            <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
            {enabledWidgets &&
              onToggleWidgetItem &&
              WIDGET_LABELS.map((w) => {
                const label = isTR ? w.tr : w.en;
                return (
                  <div
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
                      padding: '1px 3px 1px 0',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ContextMenuItem
                        icon={
                          <span
                            style={{
                              width: 14,
                              display: 'inline-flex',
                              justifyContent: 'center',
                              color: enabledWidgets[w.id] ? '#3b82f6' : 'transparent',
                            }}
                          >
                            <Check size={13} />
                          </span>
                        }
                        label={label}
                        onClick={() => onToggleWidgetItem(w.id)}
                      />
                    </div>
                    {onCustomizeWidget && (
                      <button
                        type="button"
                        data-menu-widget-settings={w.id}
                        title={isTR ? `${label} Ayarları` : `${label} Settings`}
                        aria-label={isTR ? `${label} Ayarları` : `${label} Settings`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          closeAllMenus();
                          onCustomizeWidget(w.id, rect.right - 304, rect.bottom + 8);
                        }}
                        style={{
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          borderRadius: 7,
                          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.10)',
                          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
                          color: isDark ? '#cbd5e1' : '#475569',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <SlidersHorizontal size={12.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            {!showMobileLayout && onResetWidgetPositions && (
              <>
                <div style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.2)', margin: '4px 0' }} />
                <ContextMenuItem
                  icon={<RotateCcw size={14} />}
                  label={isTR ? 'Izgara Konumlarını Sıfırla' : 'Reset Grid Positions'}
                  onClick={() => {
                    onResetWidgetPositions();
                    closeAllMenus();
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      <MenuBarClock />
    </div>
  );
}
