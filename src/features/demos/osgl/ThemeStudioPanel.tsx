import React, { useState } from 'react';
import { Button, GoogleIcon, Slider, Switch } from '../../../components/primitives';
import type {
  FontFamilyPreset,
  FontFamilyPresetDefinition,
  GoogleIconStyle,
  SeedPaletteDefinition,
  SeedPaletteId,
  ThemeMode,
  ThemePreferences,
  WorkspaceShellPreset,
} from '../../../core/contracts/ThemeContract';
import { WorkspaceShellGallery } from '../../theme-studio/WorkspaceShellGallery';
import type { OSWallpaperId } from '../OSGLEngine';
import type { BgMode, IconBgStyle, QualityMode, WindowControlsSide } from './types';
import { BackgroundSettingsSection } from './BackgroundSettingsSection';
import { IconSettingsSection } from './IconSettingsSection';

export interface ThemeStudioPanelProps {
  wallpaper: OSWallpaperId;
  setWallpaper: (wp: OSWallpaperId) => void;
  bgMode: BgMode;
  setBgMode: (m: BgMode) => void;
  solidBgColor: string;
  setSolidBgColor: (c: string) => void;
  bgGradColor1: string;
  setBgGradColor1: (c: string) => void;
  bgGradColor2: string;
  setBgGradColor2: (c: string) => void;
  customBgUrl: string;
  setCustomBgUrl: (url: string) => void;
  uploadedBgDataUrl: string;
  setUploadedBgDataUrl: (url: string) => void;
  qualityMode: QualityMode;
  setQualityMode: (q: QualityMode) => void;
  dockVisible: boolean;
  setDockVisible: (v: boolean) => void;
  windowAnimation: boolean;
  setWindowAnimation: (v: boolean) => void;
  windowControlsSide?: WindowControlsSide;
  setWindowControlsSide?: (side: WindowControlsSide) => void;
  iconBgStyle: IconBgStyle;
  setIconBgStyle: (s: IconBgStyle) => void;
  iconBgColor: string;
  setIconBgColor: (c: string) => void;
  iconGradColor1: string;
  setIconGradColor1: (c: string) => void;
  iconGradColor2: string;
  setIconGradColor2: (c: string) => void;
  iconColor: string;
  setIconColor: (c: string) => void;
  iconSizePx: number;
  setIconSizePx: (px: number) => void;
  iconLabelScale: number;
  setIconLabelScale: (scale: number) => void;
  preferences: ThemePreferences;
  availablePalettes: SeedPaletteDefinition[];
  availableFontPresets: FontFamilyPresetDefinition[];
  setMode: (m: ThemeMode) => void;
  setSeedPalette: (id: SeedPaletteId) => void;
  setFontFamilyPreset: (preset: FontFamilyPreset) => void;
  setFontScale: (scale: number) => void;
  setGlassIntensity: (v: number) => void;
  setIconStyle: (s: GoogleIconStyle) => void;
  setIconFilled: (f: boolean) => void;
  setCustomRadiusPx: (px: number) => void;
  setWorkspaceShell?: (shell: WorkspaceShellPreset) => void;
  onCreateFolder?: () => void;
  onOpenDockCustomizer?: () => void;
  onResetDock?: () => void;
  resetPreferences: () => void;
}

type SettingsCategoryId =
  | 'appearance'
  | 'wallpaper'
  | 'desktop'
  | 'icons'
  | 'typography'
  | 'system';

const SETTINGS_CATEGORIES: Array<{
  id: SettingsCategoryId;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'appearance',
    label: 'Görünüm',
    subtitle: 'Tema modu, tohum renk paleti, cam yoğunluğu ve köşe yuvarlaklığı',
    icon: 'palette',
    color: '#3b82f6',
  },
  {
    id: 'wallpaper',
    label: 'Duvar Kağıdı',
    subtitle: 'Masaüstü arka planı, gradyan ve özel görsel ayarları',
    icon: 'wallpaper',
    color: '#06b6d4',
  },
  {
    id: 'desktop',
    label: 'Masaüstü & Dock',
    subtitle: 'Dock görünürlüğü, animasyonlar, simge ve etiket ölçekleri',
    icon: 'dock_to_bottom',
    color: '#6366f1',
  },
  {
    id: 'icons',
    label: 'Simgeler',
    subtitle: 'Simge boyutu, etiket ölçeği, arka plan stili, renkler ve ikon dolgu tipi',
    icon: 'apps',
    color: '#ec4899',
  },
  {
    id: 'typography',
    label: 'Yazı Tipi',
    subtitle: 'Sistem font ailesi ve genel yazı boyutu ölçeği',
    icon: 'text_fields',
    color: '#f59e0b',
  },
  {
    id: 'system',
    label: 'Performans & Sıfırla',
    subtitle: 'Donanım/kalite profili ve varsayılan tema ayarları',
    icon: 'tune',
    color: '#10b981',
  },
];

export function ThemeStudioPanel(props: ThemeStudioPanelProps) {
  const {
    qualityMode,
    setQualityMode,
    dockVisible,
    setDockVisible,
    windowAnimation,
    setWindowAnimation,
    iconSizePx,
    setIconSizePx,
    iconLabelScale,
    setIconLabelScale,
    preferences,
    availablePalettes,
    availableFontPresets,
    setMode,
    setSeedPalette,
    setFontFamilyPreset,
    setFontScale,
    setGlassIntensity,
    setCustomRadiusPx,
    resetPreferences,
  } = props;

  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>('appearance');
  const currentCategory =
    SETTINGS_CATEGORIES.find((c) => c.id === activeCategory) ?? SETTINGS_CATEGORIES[0];

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100%',
        minHeight: 0,
        gap: 0,
      }}
    >
      {/* Left Sidebar (Apple System Settings style) */}
      <aside
        style={{
          width: 204,
          flexShrink: 0,
          borderRight: '1px solid var(--uxu-border-subtle)',
          paddingRight: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
        }}
      >
        {SETTINGS_CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 10,
                border: 'none',
                background: active
                  ? 'var(--uxu-primary-container)'
                  : 'transparent',
                color: active
                  ? 'var(--uxu-primary)'
                  : 'var(--uxu-text-primary)',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 140ms ease, color 140ms ease',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  background: cat.color,
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <GoogleIcon name={cat.icon} size={15} filled />
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Right Content Pane */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '0 12px 0 20px',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          style={{
            paddingBottom: 12,
            borderBottom: '1px solid var(--uxu-border-subtle)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{currentCategory.label}</h3>
          <p
            style={{
              fontSize: 12,
              color: 'var(--uxu-text-secondary)',
              margin: '4px 0 0 0',
            }}
          >
            {currentCategory.subtitle}
          </p>
        </div>

        {activeCategory === 'appearance' && (
          <div className="uxu-stack-md">
            {props.setWorkspaceShell && (
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                  Çalışma Alanı Kabuğu (6 Tasarım)
                </div>
                <WorkspaceShellGallery
                  value={preferences.workspaceShell}
                  onChange={props.setWorkspaceShell}
                  defaultRoleShell="osgl"
                  compact
                />
              </div>
            )}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                Görünüm Modu (Dark / Light / System)
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                  <Button
                    key={m}
                    size="sm"
                    variant={preferences.mode === m ? 'filled' : 'outlined'}
                    onClick={() => setMode(m)}
                  >
                    {m === 'light' ? 'Aydınlık' : m === 'dark' ? 'Karanlık' : 'Sistem'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                Tohum Renk Paleti (Seed Palette)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {availablePalettes.map((pal) => (
                  <Button
                    key={pal.id}
                    size="sm"
                    variant={preferences.seedPalette === pal.id ? 'filled' : 'outlined'}
                    onClick={() => setSeedPalette(pal.id)}
                  >
                    {pal.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                Pencere Cam Yoğunluğu ({preferences.glassIntensity}%)
              </div>
              <Slider
                min={0}
                max={100}
                value={preferences.glassIntensity}
                onChange={setGlassIntensity}
              />
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                Pencere Köşe Yuvarlaklığı ({preferences.customRadiusPx ?? 12}px)
              </div>
              <Slider
                min={0}
                max={28}
                value={preferences.customRadiusPx ?? 12}
                onChange={setCustomRadiusPx}
              />
            </div>
          </div>
        )}

        {activeCategory === 'wallpaper' && (
          <div className="uxu-stack-md">
            <BackgroundSettingsSection {...props} />
          </div>
        )}

        {activeCategory === 'desktop' && (
          <div className="uxu-stack-md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>Dock Göster</span>
                <Switch value={dockVisible} onChange={setDockVisible} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>Açılma / Kapanma Efekti</span>
                <Switch value={windowAnimation} onChange={setWindowAnimation} />
              </div>
              {props.setWindowControlsSide && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>Pencere Düğmeleri Yönü</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button
                      size="xs"
                      variant={(props.windowControlsSide ?? 'left') === 'left' ? 'filled' : 'outlined'}
                      onClick={() => props.setWindowControlsSide?.('left')}
                    >
                      Sol
                    </Button>
                    <Button
                      size="xs"
                      variant={props.windowControlsSide === 'right' ? 'filled' : 'outlined'}
                      onClick={() => props.setWindowControlsSide?.('right')}
                    >
                      Sağ
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                Masaüstü Simge Büyüklüğü ({iconSizePx}px)
              </div>
              <Slider min={44} max={84} value={iconSizePx} onChange={setIconSizePx} />
            </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                  Masaüstü Simge Yazı Boyutu Ölçeği ({iconLabelScale}%)
                </div>
                <Slider min={75} max={140} value={iconLabelScale} onChange={setIconLabelScale} />
              </div>

              {(props.onOpenDockCustomizer || props.onCreateFolder || props.onResetDock) && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                    Klasörler &amp; Alt Dock Kişiselleştirme
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {props.onOpenDockCustomizer && (
                      <Button size="sm" variant="filled" onClick={props.onOpenDockCustomizer}>
                        Dock Simgelerini Seç / Sırala
                      </Button>
                    )}
                    {props.onCreateFolder && (
                      <Button size="sm" variant="outlined" onClick={props.onCreateFolder}>
                        + Yeni Masaüstü Klasörü
                      </Button>
                    )}
                    {props.onResetDock && (
                      <Button size="sm" variant="outlined" onClick={props.onResetDock}>
                        Dock Varsayılanına Dön
                      </Button>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {activeCategory === 'icons' && (
          <div className="uxu-stack-md">
            <IconSettingsSection
              {...props}
              iconStyle={preferences.iconStyle}
              iconFilled={preferences.iconFilled}
            />
          </div>
        )}

        {activeCategory === 'typography' && (
          <div className="uxu-stack-md">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                Yazı Tipi (Font Ailesi)
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: 8,
                }}
              >
                {availableFontPresets.map((font) => {
                  const active = (preferences.fontFamilyPreset ?? 'inter-jakarta') === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFontFamilyPreset(font.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: active
                          ? '2px solid var(--uxu-primary)'
                          : '1px solid var(--uxu-border-subtle)',
                        background: active ? 'var(--uxu-primary-container)' : 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: font.sansStack,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                        {font.name}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.72 }}>
                        Aa Bb Cc • 1234 — {font.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                Yazı Boyutu Ölçeği ({preferences.fontScale}%)
              </div>
              <Slider min={80} max={125} value={preferences.fontScale} onChange={setFontScale} />
            </div>
          </div>
        )}

        {activeCategory === 'system' && (
          <div className="uxu-stack-md">
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                Performans & Kalite Modu
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  variant={qualityMode === 'quality' ? 'filled' : 'outlined'}
                  onClick={() => setQualityMode('quality')}
                >
                  Kalite Modu (Aurora + Cam)
                </Button>
                <Button
                  size="sm"
                  variant={qualityMode === 'performance' ? 'filled' : 'outlined'}
                  onClick={() => setQualityMode('performance')}
                >
                  Performans Modu (Hafif)
                </Button>
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <Button variant="outlined" size="sm" onClick={resetPreferences}>
                Varsayılan Ayarlara Sıfırla
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
