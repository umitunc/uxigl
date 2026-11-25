import type { DocPropRow } from '../types';

export const OSGL_FULL_INTEGRATION_SNIPPET = `import React, { useState } from 'react';
import {
  ThemeProvider,
  ToastProvider,
  OSWorkspaceShell,
  FocusTimerWidget,
  FOCUS_TIMER_SIZE_PRESETS,
  FOCUS_TIMER_CUSTOM_FIELDS,
  type OSWorkspaceApp,
  type OSDesktopWidgetDefinition,
} from 'truncgil-uxigl';

const MY_APPS: OSWorkspaceApp[] = [
  {
    id: 'analytics',
    label: 'Canlı Telemetri',
    shortLabel: 'Telemetri',
    googleIcon: 'monitoring',
    category: 'Operasyon',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    description: 'Sistem metrikleri ve canlı performans panosu',
    defaultSize: { width: 920, height: 600 },
  },
  {
    id: 'files',
    label: 'FileManGL Gezgini',
    shortLabel: 'Dosyalar',
    googleIcon: 'folder_open',
    category: 'Depolama',
    gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)',
    fullBleed: true,
    defaultMaximized: false,
  },
];

const MY_WIDGETS: OSDesktopWidgetDefinition[] = [
  {
    id: 'focus-timer',
    labelTr: 'Odak Sayacı',
    labelEn: 'Focus Timer',
    defaultEnabled: true,
    defaultSize: { width: 360, height: 190 },
    sizePresets: FOCUS_TIMER_SIZE_PRESETS,
    customFields: FOCUS_TIMER_CUSTOM_FIELDS,
    render: (ctx) => <FocusTimerWidget ctx={ctx} storageScopeKey="my-app-os" />,
  },
  {
    id: 'quick-kpi',
    labelTr: 'Hızlı Özet',
    labelEn: 'Quick Summary',
    defaultEnabled: true,
    defaultSize: { width: 300, height: 140 },
    render: (ctx) => (
      <div style={{ ...ctx.cardStyle, padding: 14, height: '100%' }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          {ctx.customPrefs?.customTitle || (ctx.locale === 'tr' ? 'Hızlı Özet' : 'Quick Summary')}
        </div>
        <button type="button" onClick={() => ctx.openSideBySide('analytics', 'files')}>
          {ctx.locale === 'tr' ? 'Yan Yana Aç' : 'Open Side-by-Side'}
        </button>
      </div>
    ),
  },
];

export function MyOSApp() {
  const [openReq, setOpenReq] = useState<{ appId: string; nonce: number } | null>(null);

  return (
    <ThemeProvider defaultMode="dark" defaultPalette="ocean">
      <ToastProvider>
        <OSWorkspaceShell
          apps={MY_APPS}
          dockAppIds={['analytics', 'files']}
          widgets={MY_WIDGETS}
          storageScopeKey="my-app-os"
          initialWallpaper="dijios-oxford"
          brandTitle="MyWorkspace"
          brandSubtitle="OSGL v2"
          externalOpenRequest={openReq}
          onSwitchToClassic={() => console.log('Switch to classic layout')}
          onOpenGlobalThemeStudio={() => setOpenReq({ appId: 'os-theme-studio', nonce: Date.now() })}
          renderWindowContent={(appId) => {
            if (appId === 'analytics') return <div>Analytics Module</div>;
            if (appId === 'files') return <div>FileManGL Module</div>;
            return null;
          }}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}`;

export const OSGL_WIDGET_PERSISTENCE_SNIPPET = `import {
  loadOSGLState,
  saveOSGLState,
  loadOSGLWidgetData,
  saveOSGLWidgetData,
  buildScopedOSGLKey,
} from 'truncgil-uxigl';

// 1. OSGL masaüstü durumunu oku / kaydet (anahtar: uxu.osgl.state.v4.<scopeKey>)
const current = loadOSGLState('my-app-os');
saveOSGLState('my-app-os', { ...current, dockVisible: true });

// 2. Özel widget verisini oku / kaydet (anahtar: uxu.osgl.widget.v2.<scopeKey>.<widgetKey>)
const savedNotes = loadOSGLWidgetData<string[]>('sticky_notes', [], 'my-app-os');
saveOSGLWidgetData('sticky_notes', [...savedNotes, 'Yeni görev'], 'my-app-os');`;

export const OSGL_MAGNETIC_AND_WINDOW_OPS_SNIPPET = `import {
  WIDGET_MAGNETIC_MARGIN, // 16px minimum breathing room between widgets
  WINDOW_MAGNETIC_MARGIN, // 12px magnetic margin between floating/snapped windows
  RESIZE_HANDLE_SPECS,    // 8-way resize handles: n, s, e, w, ne, nw, se, sw
  resolveWidgetOverlaps,
  computeWidgetMagneticSnap,
  computeWindowMagneticSnap,
  computeSnapBounds,
} from 'truncgil-uxigl';

// 1. Widget'ların bitişik (0-15px) durmasını engeller; en az 16px nefes payı bırakır
const resolvedWidgets = resolveWidgetOverlaps(
  [
    { id: 'focus-timer', pos: { x: 1020, y: 280 }, size: { width: 360, height: 180 }, locked: true },
    { id: 'daily-flow', pos: { x: 1080, y: 460 }, size: { width: 300, height: 220 } },
  ],
  900
);
// resolvedWidgets['daily-flow'].y === 476 (280 + 180 + WIDGET_MAGNETIC_MARGIN)

// 2. Pencere sürüklemede 12px manyetik boşluk + komşu kenar hizalama kılavuzları üretir
const windowSnap = computeWindowMagneticSnap({
  rawX: 656,
  rawY: 44,
  winW: 600,
  winH: 480,
  siblings: [{ x: 40, y: 44, width: 600, height: 480 }],
  vw: 1440,
  vh: 900,
  dockVisible: true,
});
// windowSnap.x === 652 (640 + WINDOW_MAGNETIC_MARGIN), windowSnap.guides -> MagneticGuideLine[]

// 3. Dock açıkken 4 köşe kadran ve yarı ekran snap sınırları 12px dış/iç boşluk korur
const topLeftBounds = computeSnapBounds('top-left', 1440, 900, true);`;

export function getOsglSpatialHelpersRows(isTR: boolean): DocPropRow[] {
  return [
    {
      name: 'WIDGET_MAGNETIC_MARGIN / resolveWidgetOverlaps',
      type: '16 / (items, vh, margin?) => Record<string, WidgetPosition>',
      defaultValue: '16px',
      description: isTR
        ? 'Masaüstü widget’larının üst üste binmesini veya bitişik (0–15px) kalmasını önler; her iki widget arasında en az 16px manyetik boşluk korur.'
        : 'Prevents desktop widgets from overlapping or sitting flush (0–15px), enforcing at least a 16px magnetic breathing margin.',
    },
    {
      name: 'computeWidgetMagneticSnap / computeWidgetResizeMagneticSnap',
      type: '(params) => { x, y, guides }',
      defaultValue: 'threshold: 14px',
      description: isTR
        ? 'Sürükleme ve boyutlandırma sırasında komşu widget’larla 16px manyetik boşluk ve sol/sağ/üst/alt kenar hizası ile canlı kılavuz çizgileri üretir.'
        : 'Computes 16px magnetic margin snaps, sibling edge alignments, and live MagneticGuideLine guides during widget drag and resize.',
    },
    {
      name: 'WINDOW_MAGNETIC_MARGIN / computeWindowMagneticSnap',
      type: '12 / (params) => { x, y, guides }',
      defaultValue: '12px (threshold: 14px)',
      description: isTR
        ? 'Serbest pencereler taşınırken veya 8 yönden boyutlandırılırken komşu pencerelerle 12px manyetik boşluk ve kenar hizalaması sağlar.'
        : 'Snaps floating windows to a 12px magnetic margin or clean edge alignment against sibling windows during drag and 8-way resize.',
    },
    {
      name: 'RESIZE_HANDLE_SPECS / computeResizedWindowBounds',
      type: "ReadonlyArray<ResizeHandleSpec> ('n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw')",
      defaultValue: 'min 380×220px',
      description: isTR
        ? '4 kenar ve 4 köşe dahil 8 yönlü pencere boyutlandırma tutamaçları ve karşı kenarı sabitleyen sınır çözücüsü.'
        : '8-directional edge and corner window resize handle specifications and opposite-edge anchored bounds solver.',
    },
    {
      name: 'detectEdgeSnapZone / computeSnapBounds',
      type: "'maximize' | 'left-half' | 'right-half' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
      defaultValue: 'dockVisible: false',
      description: isTR
        ? '7 ekran kenarı/köşesi yapışma bölgesini algılar; Dock görünürken alt çubuğu ezmeden 12px manyetik boşluklu yerleşim üretir.'
        : 'Detects all 7 screen-edge and quadrant snap zones, preserving Dock clearance and 12px magnetic margins when Dock is visible.',
    },
  ];
}

export function getOsglShellPropsRows(isTR: boolean): DocPropRow[] {
  return [
    {
      name: 'apps',
      type: 'OSWorkspaceApp[]',
      defaultValue: '—',
      required: true,
      description: isTR
        ? 'Masaüstünde, Dock’ta, Üst Menüde ve Spotlight (⌘K) aramasında görünecek uygulama modülleri.'
        : 'Application modules displayed on the Desktop, Dock, Top Menu Bar, and Spotlight (⌘K).',
    },
    {
      name: 'renderWindowContent',
      type: '(appId: string) => React.ReactNode',
      defaultValue: '—',
      required: true,
      description: isTR
        ? 'Açık pencere veya mobil tam ekran sayfası içinde render edilecek içerik üreticisi.'
        : 'Renderer function returning the React content for each floating window or mobile sheet.',
    },
    {
      name: 'dockAppIds',
      type: 'string[]',
      defaultValue: 'İlk 6 app',
      description: isTR
        ? 'Varsayılan olarak alt Dock çubuğuna sabitlenecek uygulama kimlikleri.'
        : 'Default app IDs pinned to the bottom Dock bar.',
    },
    {
      name: 'widgets',
      type: 'OSDesktopWidgetDefinition[]',
      defaultValue: '[]',
      description: isTR
        ? 'Masaüstü sağ tarafında 20px ızgaraya oturan, sürüklenip boyutlandırılabilen widget tanımları.'
        : 'Draggable, resizable desktop widget definitions snapping to a 20px grid.',
    },
    {
      name: 'storageScopeKey',
      type: 'string',
      defaultValue: "'default'",
      description: isTR
        ? 'localStorage kalıcılığını uygulama/oturum bazında izole eden anahtar (uxu.osgl.state.v4.<scope>).'
        : 'Isolates localStorage persistence per app or tenant (uxu.osgl.state.v4.<scope>).',
    },
    {
      name: 'initialWallpaper',
      type: 'OSWallpaperId',
      defaultValue: "'dijios-oxford'",
      description: isTR
        ? "Başlangıç WebGL duvar kağıdı ('dijios-oxford' | 'sequoia' | 'sonoma' | 'ventura' | 'monterey' | 'bigsur' | 'midnight')."
        : "Initial WebGL shader wallpaper ('dijios-oxford' | 'sequoia' | 'sonoma' | 'ventura' | 'monterey' | 'bigsur' | 'midnight').",
    },
    {
      name: 'brandLogo / brandTitle / brandSubtitle',
      type: 'ReactNode / string / string',
      defaultValue: "'uxiGL'",
      description: isTR
        ? 'Üst Menü Çubuğu sol tarafındaki marka logosu, başlığı ve alt etiketi.'
        : 'Brand logo, title, and subtitle rendered on the left side of the Top Menu Bar.',
    },
    {
      name: 'headerRightSlot / topBannerSlot',
      type: 'ReactNode',
      defaultValue: 'undefined',
      description: isTR
        ? 'Üst çubuk sağ sistem tepsisi önüne veya üst çubuk altına eklenen özel slotlar.'
        : 'Custom slots injected before the top-right tray or directly below the Top Menu Bar.',
    },
    {
      name: 'onSwitchToClassic / onOpenGlobalThemeStudio',
      type: '() => void',
      defaultValue: 'undefined',
      description: isTR
        ? 'Klasik görünüme dönüş veya global Tema Stüdyosu çekmecesini açma geri çağrıları.'
        : 'Callbacks to switch back to classic shell or open the global Theme Studio drawer.',
    },
    {
      name: 'externalOpenRequest',
      type: '{ appId: string; nonce: number } | null',
      defaultValue: 'null',
      description: isTR
        ? 'Dış bileşenlerden programatik olarak bir pencere açmak/öne getirmek için tetikleyici.'
        : 'Programmatic trigger to open or focus a window from outside OSWorkspaceShell.',
    },
  ];
}

export function getOsglAppModelRows(isTR: boolean): DocPropRow[] {
  return [
    {
      name: 'id / label / shortLabel',
      type: 'string',
      defaultValue: '—',
      required: true,
      description: isTR
        ? 'Benzersiz uygulama kimliği, tam pencere başlığı ve masaüstü/Dock kısa etiketi.'
        : 'Unique app ID, full window title, and compact label for Desktop/Dock.',
    },
    {
      name: 'googleIcon / iconNode',
      type: 'string / ReactNode',
      defaultValue: '—',
      required: true,
      description: isTR
        ? 'Material Symbols ikon adı veya özel React SVG/Lucide ikon düğümü.'
        : 'Google Material Symbols icon name or optional custom React icon node.',
    },
    {
      name: 'category / gradient',
      type: 'string',
      defaultValue: '—',
      required: true,
      description: isTR
        ? 'Üst menü ve Spotlight gruplama kategorisi ile varsayılan canlı simge gradyanı.'
        : 'Grouping category for Top Menu/Spotlight and default vivid icon gradient.',
    },
    {
      name: 'badge / description',
      type: 'string',
      defaultValue: 'undefined',
      description: isTR
        ? 'Simge rozeti (ör. "Yeni", "3") ve mobil/Spotlight alt açıklaması.'
        : 'Optional badge pill on the icon and subtitle in Spotlight/mobile launcher.',
    },
    {
      name: 'fullBleed',
      type: 'boolean',
      defaultValue: 'false',
      description: isTR
        ? 'true olduğunda pencere iç boşluğunu kaldırır (SheetGL, FileManGL gibi tam tuval uygulamalar için).'
        : 'Removes inner padding for edge-to-edge apps like SheetGL or FileManGL.',
    },
    {
      name: 'defaultSize / defaultMaximized',
      type: '{ width, height } / boolean',
      defaultValue: '780×540 / false',
      description: isTR
        ? 'Pencere ilk açıldığında kullanılacak başlangıç boyutu veya tam ekran başlangıç tercihi.'
        : 'Initial window dimensions or maximized state when opened for the first time.',
    },
  ];
}

export interface OsglFeatureCardItem {
  id: string;
  titleTr: string;
  titleEn: string;
  badge: string;
  summaryTr: string;
  summaryEn: string;
  bulletsTr: string[];
  bulletsEn: string[];
}

export const OSGL_FEATURE_PILLARS: OsglFeatureCardItem[] = [
  {
    id: 'windows',
    titleTr: 'WASM Pencere Yöneticisi & Hizalama',
    titleEn: 'WASM Window Manager & Tiling',
    badge: 'osWasmEngine',
    summaryTr:
      'WebAssembly destekli sınır hesaplayıcı ile pürüzsüz sürükleme, 8 yönlü boyutlandırma ve akıllı hizalama.',
    summaryEn:
      'WebAssembly-backed bounds solver with smooth dragging, 8-way resizing, and smart window tiling.',
    bulletsTr: [
      '8 yönlü kenar/köşe boyutlandırma (n, s, e, w, ne, nw, se, sw) ve minimum 380×220px koruma.',
      '12px Manyetik Pencere Boşluğu (WINDOW_MAGNETIC_MARGIN): Serbest pencereler birbirine bitişmez, canlı hizalama kılavuzlarıyla mıknatıslanır.',
      '7 Snap Bölgesi (Maximize, Sol/Sağ Yarı, 4 Köşe Kadran) + başlık çubuğundan sürükleyerek küçültme + Tam Ekran (Esc çıkışı).',
      '4 Düzenleme Modu: Cascade, Grid, Side-by-Side (Yan Yana) ve Quadrants (2×2) + @container osgl-win duyarlı gövde.',
      'Sağ veya Sol pencere kontrol düğmeleri (windowControlsSide) ve uygulama bazlı konum/boyut hafızası (windowBoundsByApp).',
    ],
    bulletsEn: [
      '8-direction edge/corner resizing (n, s, e, w, ne, nw, se, sw) with 380×220px min bounds.',
      '12px Window Magnetic Margin (WINDOW_MAGNETIC_MARGIN): Floating windows snap with live alignment guides instead of touching flush.',
      '7 Snap Zones (Maximize, Left/Right Half, 4 Quadrants) + unmaximize-on-drag + Fullscreen (Esc exit).',
      '4 Arrange Modes: Cascade, Grid, Side-by-Side, and Quadrants (2×2) + @container osgl-win responsive body.',
      'Switchable right or left window controls (windowControlsSide) and persisted bounds (windowBoundsByApp).',
    ],
  },
  {
    id: 'desktop-folders',
    titleTr: 'Masaüstü Izgarası, Klasörler & Sağ Tık',
    titleEn: 'Desktop Grid, Folders & Context Menus',
    badge: 'DesktopGrid',
    summaryTr:
      'Serbest slot ızgarası, çoklu seçim kutusu (marquee), sürükle-bırak klasörleme ve bağlamsal menüler.',
    summaryEn:
      'Free-slot column grid, marquee multi-selection, drag-to-folder grouping, and context menus.',
    bulletsTr: [
      'Sütun öncelikli serbest slot yerleştirme (iconSlots) ve canlı önizlemeli sürükle-bırak.',
      'Boş alana sürükleyerek çoklu simge seçimi (Marquee Selection) ve toplu açma/klasörleme.',
      'Klasör Sistemi: Seçilenlerden klasör oluşturma, simgeyi klasör üstüne bırakma, yeniden adlandırma, 6 renk etiketi ve dağıtma.',
      'Masaüstü sağ tık menüsü + öğe bazlı (app / folder / dock-app) akıllı sağ tık menüsü.',
    ],
    bulletsEn: [
      'Column-major free-slot placement (iconSlots) with live drop preview.',
      'Marquee box multi-selection on empty desktop to batch-open or group apps.',
      'Folder System: Create from selection, drag apps into folders, inline rename, 6 color presets, and dissolve.',
      'Desktop context menu + item-aware context menu for apps, folders, and Dock items.',
    ],
  },
  {
    id: 'dock',
    titleTr: 'Akıllı Alt Dock & Büyütme Efekti',
    titleEn: 'Smart Dock & Magnification',
    badge: 'useDockMagnification',
    summaryTr:
      'İmleç yakınlığına duyarlı macOS tarzı büyüme animasyonu, sürükleyerek sabitleme ve özelleştirici.',
    summaryEn:
      'Cursor-proximity macOS magnification, drag-to-pin, and interactive Dock customizer.',
    bulletsTr: [
      'İmleç mesafesine göre dinamik ölçeklenen simgeler ve açık uygulama gösterge noktası.',
      'Masaüstünden Dock’a sürükleyerek sabitleme ve Dock içi sürükle-bırak sıralama.',
      'Sabitlenmemiş ancak açık olan uygulamaların Dock sağ bölümünde otomatik gösterimi.',
      'Dock Özelleştirici (DockCustomizerPopover) ve hızlı Yan Yana / Izgara / Tümünü Kapat kısayolları.',
    ],
    bulletsEn: [
      'Proximity-based icon magnification and active running-window indicator dots.',
      'Drag desktop icons onto the Dock to pin, and drag within Dock to reorder.',
      'Automatically surfaces running unpinned apps in a separated Dock section.',
      'Built-in DockCustomizerPopover plus quick Side-by-Side / Grid / Close All buttons.',
    ],
  },
  {
    id: 'widgets',
    titleTr: 'Masaüstü Widget Motoru & Odak Sayacı',
    titleEn: 'Desktop Widgets & Focus Timer',
    badge: 'DesktopWidgetsHost',
    summaryTr:
      '20px ızgaraya oturan, özelleştirilebilir yüzeyli ve yerleşik FocusTimerWidget içeren widget altyapısı.',
    summaryEn:
      '20px snap-to-grid widget host with customizable surfaces and built-in FocusTimerWidget.',
    bulletsTr: [
      '16px Manyetik Widget Boşluğu (WIDGET_MAGNETIC_MARGIN): Widget’lar asla bitişik (0–15px) durmaz veya üst üste binmez; canlı kılavuz çizgileriyle hizalanır.',
      'Üst menü satır içi ayar düğmesi ve sağ tık ile WidgetCustomizePopover: Cam / Düz / Tonlu yüzey, 7 vurgu rengi, S/M/L önayarları.',
      'WidgetCustomField ile her widget’a özel seçenek alanları tanımlayabilme.',
      'Hazır FocusTimerWidget: 5/15/25 dk + özel süre, SVG halka, Web Audio API bitiş zili ve otomatik döngü.',
      'Tam ekran veya çakışan pencere açıldığında widget’ların otomatik gizlenmesi.',
    ],
    bulletsEn: [
      '16px Widget Magnetic Margin (WIDGET_MAGNETIC_MARGIN): Widgets never overlap or sit flush (0–15px), snapping with live alignment guides.',
      'Inline Top-Bar settings trigger & right-click WidgetCustomizePopover: Glass / Solid / Tinted surfaces, 7 accent swatches, S/M/L presets.',
      'Extensible WidgetCustomField API for widget-specific user settings.',
      'Built-in FocusTimerWidget: 5/15/25m + custom minutes, SVG ring, Web Audio API chime, and auto-loop.',
      'Auto-hides widgets when a window is maximized, fullscreen, or overlaps the widget column.',
    ],
  },
  {
    id: 'wallpapers-studio',
    titleTr: '7 WebGL Duvar Kağıdı & OS Tema Stüdyosu',
    titleEn: '7 WebGL Wallpapers & OS Theme Studio',
    badge: 'os-theme-studio',
    summaryTr:
      'GPU shader arka planları, 4 arka plan modu, 6 simge stili ve yerleşik Sistem Ayarları penceresi.',
    summaryEn:
      'GPU shader wallpapers, 4 background modes, 6 icon styles, and built-in System Settings window.',
    bulletsTr: [
      '7 WebGL Aurora sahnesi: dijios-oxford, sequoia, sonoma, ventura, monterey, bigsur, midnight.',
      '4 Arka Plan Modu: WebGL Aurora, Çift Renkli Gradyan, Düz Renk ve Özel Görsel (URL veya dosya yükleme).',
      '6 Simge Stili (IconBgStyle): vivid, gradient, soft, glass, sun, mono + 44–84px boyut ayarı.',
      'Otomatik eklenen "os-theme-studio" penceresi: 6 kategori (Görünüm, Duvar Kağıdı, Masaüstü & Dock, Simgeler, Yazı Tipi, Performans & Sıfırla).',
    ],
    bulletsEn: [
      '7 WebGL Aurora scenes: dijios-oxford, sequoia, sonoma, ventura, monterey, bigsur, midnight.',
      '4 Background Modes: WebGL Aurora, Dual-Color Gradient, Solid Color, and Custom Image (URL or file upload).',
      '6 Icon Styles (IconBgStyle): vivid, gradient, soft, glass, sun, mono + 44–84px size slider.',
      'Auto-injected "os-theme-studio" app with 6 tabs (Appearance, Wallpaper, Desktop & Dock, Icons, Typography, Performance & Reset).',
    ],
  },
  {
    id: 'menubar-mobile-storage',
    titleTr: 'Üst Menü, Spotlight (⌘K), Mobil & Kalıcılık',
    titleEn: 'Top Bar, Spotlight (⌘K), Mobile & Storage',
    badge: 'MobileLauncher',
    summaryTr:
      'Duyarlı mobil başlatıcı, klavye komut paleti, cihaz önizleme anahtarı ve kapsamlı localStorage kaydı.',
    summaryEn:
      'Responsive mobile launcher, keyboard command palette, device preview toggle, and scoped storage.',
    bulletsTr: [
      'TopMenuBar: Kategoriye göre gruplanmış Uygulamalar, Pencere, Görünüm, Widget menüleri ve canlı saat.',
      'Spotlight (Ctrl/Cmd + K): Tüm modüller ve pencere düzeni komutları için anlık arama.',
      'MobileLauncher: Mobil ekranlarda veya önizleme modunda arama çubuklu ana ekran ve tam ekran MobileActiveSheet.',
      'İzole Kalıcılık: storageScopeKey ile her uygulama için ayrı durum (v4) ve widget verisi (v2) saklama.',
    ],
    bulletsEn: [
      'TopMenuBar: Category-grouped Apps, Window, View, Widgets dropdowns, and live menu bar clock.',
      'Spotlight (Ctrl/Cmd + K): Instant search across all apps and window arrangement commands.',
      'MobileLauncher: Touch-friendly home screen with search, Dock, and full-screen MobileActiveSheet.',
      'Scoped Persistence: Isolated per-app state (v4) and widget data (v2) via storageScopeKey.',
    ],
  },
];

