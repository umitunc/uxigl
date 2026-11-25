# OSGL Desktop Workspace Engine Guide (TR / EN)

> **Live Interactive Portal:** `/docs/osgl-workspace`  
> **Primary Export:** `OSWorkspaceShell` from `truncgil-uxigl` (`src/features/osgl/OSWorkspaceShell.tsx`)

---

## 1. Genel Bakış / Overview

**[TR]**  
Yeni bir uygulamaya OSGL’nin tüm masaüstü yeteneklerini (WASM pencere yöneticisi, 12px/16px manyetik boşluk motoru, masaüstü klasörleri, akıllı Dock, özelleştirilebilir widget’lar, WebGL duvar kağıtları, Tema Stüdyosu, Spotlight ve mobil başlatıcı) eksiksiz taşımak için vitrin kabuğu olan `OSGLTemplate` yerine parametrik **`OSWorkspaceShell`** motorunu kullanın.

**[EN]**  
To carry all OSGL desktop capabilities (WASM window manager, 12px/16px magnetic margin engine, desktop folders, smart Dock, customizable widgets, WebGL wallpapers, OS Theme Studio, Spotlight, and mobile launcher) into a new application, import the parametric **`OSWorkspaceShell`** engine rather than the showcase demo wrapper `OSGLTemplate`.

---

## 2. Hızlı Kurulum / Quick Start

```tsx
import React, { useState } from 'react';
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

const APPS: OSWorkspaceApp[] = [
  {
    id: 'analytics',
    label: 'Canlı Telemetri',
    shortLabel: 'Telemetri',
    googleIcon: 'monitoring',
    category: 'Operasyon',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    defaultSize: { width: 920, height: 600 },
  },
  {
    id: 'files',
    label: 'FileManGL',
    shortLabel: 'Dosyalar',
    googleIcon: 'folder_open',
    category: 'Depolama',
    gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)',
    fullBleed: true,
  },
];

const WIDGETS: OSDesktopWidgetDefinition[] = [
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
];

export function App() {
  const [openReq, setOpenReq] = useState<{ appId: string; nonce: number } | null>(null);

  return (
    <ThemeProvider initialUserScopeKey="user-42">
      <ToastProvider>
        <OSWorkspaceShell
          apps={APPS}
          dockAppIds={['analytics', 'files']}
          widgets={WIDGETS}
          storageScopeKey="my-app-os:user-42"
          initialWallpaper="oxford-navy"
          brandTitle="MyWorkspace"
          brandSubtitle="OSGL"
          externalOpenRequest={openReq}
          onOpenGlobalThemeStudio={() =>
            setOpenReq({ appId: 'os-theme-studio', nonce: Date.now() })
          }
          renderWindowContent={(appId) => <div>Active Module: {appId}</div>}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
```

---

## 3. `OSWorkspaceShellProps` API

| Prop | Type | Default | Description (TR / EN) |
| :--- | :--- | :--- | :--- |
| `apps` *(required)* | `OSWorkspaceApp[]` | — | **TR:** Masaüstü, Dock, Üst Menü ve Spotlight (⌘K) modül listesi.<br>**EN:** Application modules shown on Desktop, Dock, Top Bar, and Spotlight. |
| `renderWindowContent` *(required)* | `(appId: string) => React.ReactNode` | — | **TR:** Her pencere ve mobil tam ekran sayfası için içerik üreticisi.<br>**EN:** Content renderer for floating windows and mobile active sheets. |
| `dockAppIds` | `string[]` | First 6 apps | **TR:** Varsayılan sabitlenmiş Dock simgeleri.<br>**EN:** Default pinned Dock app IDs. |
| `widgets` | `OSDesktopWidgetDefinition[]` | `[]` | **TR:** 16px manyetik boşluklu ve 20px ızgaraya oturan masaüstü widget tanımları.<br>**EN:** Desktop widget definitions with 16px magnetic margins and 20px grid fallback. |
| `storageScopeKey` | `string` | `'default'` | **TR:** `localStorage` kalıcılık kapsam anahtarı (`uxu.osgl.state.v4.<scope>`).<br>**EN:** Scoped persistence key (`uxu.osgl.state.v4.<scope>`). |
| `initialWallpaper` | `OSWallpaperId` | `'oxford-navy'` | **TR:** Başlangıç WebGL duvar kağıdı (`'oxford-navy'` \| `'sequoia'` \| `'sonoma'` \| `'ventura'` \| `'monterey'` \| `'bigsur'` \| `'midnight'`; geriye dönük `'dijios-oxford'` desteklenir).<br>**EN:** Initial WebGL Aurora shader wallpaper. |
| `brandLogo` / `brandTitle` / `brandSubtitle` | `ReactNode / string / string` | `'uxiGL'` | **TR:** Üst Menü Çubuğu sol marka alanı.<br>**EN:** Top Menu Bar left brand slot. |
| `headerRightSlot` / `topBannerSlot` | `ReactNode` | `undefined` | **TR:** Üst sağ tepsi önü ve üst çubuk altı özel alanlar.<br>**EN:** Custom slots before the top-right tray or below the Top Menu Bar. |
| `onSwitchToClassic` | `() => void` | `undefined` | **TR:** Klasik arayüz düzenine dönüş geri çağrısı.<br>**EN:** Callback to switch back to classic shell layout. |
| `onOpenGlobalThemeStudio` | `() => void` | `undefined` | **TR:** Global Tema Stüdyosu çekmecesini açma geri çağrısı.<br>**EN:** Callback to open the global Theme Studio drawer. |
| `externalOpenRequest` | `{ appId: string; nonce: number } \| null` | `null` | **TR:** Dışarıdan programatik pencere açma/odaklama tetikleyicisi.<br>**EN:** Programmatic trigger to open/focus a window externally. |

---

## 4. `OSWorkspaceApp` Sözleşmesi / Contract

- `id`, `label`, `shortLabel`: Benzersiz kimlik, tam pencere başlığı ve kısa simge etiketi.
- `googleIcon` / `iconNode`: Material Symbols ikon adı veya özel React ikonu.
- `category` / `gradient`: Üst menü/Spotlight kategori grubu ve canlı ikon gradyanı.
- `badge` / `description`: İkon rozeti ve mobil/Spotlight açıklaması.
- `fullBleed`: `true` olduğunda pencere iç boşluğu kaldırılır (`SheetGL`, `FileManGL`).
- `defaultSize` / `defaultMaximized`: İlk açılış boyutu veya ekranı kaplamış başlangıç tercihi.

---

## 5. Manyetik Boşluk (Magnetic Margin) & Uzamsal Pencere/Widget Motoru

**[TR]**  
OSGL, hem masaüstü widget’larının hem de serbest pencerelerin birbirine **sıfır/bitişik (`0–15px`)** yapışmasını veya üst üste binmesini deterministik bir uzamsal çözücüyle engeller; sürükleme ve boyutlandırma sırasında canlı manyetik kılavuz çizgileri (`data-osgl-magnetic-guide` / `data-osgl-window-guide`) gösterir.

**[EN]**  
OSGL prevents desktop widgets and floating windows from touching flush (`0–15px`) or overlapping via a deterministic spatial solver, rendering live magnetic alignment & margin guide lines (`data-osgl-magnetic-guide` / `data-osgl-window-guide`) during drag and resize interactions.

### 5.1 Widget Manyetik Boşluk & Çakışma Çözücüsü (`16px`)
- **`WIDGET_MAGNETIC_MARGIN = 16` & `WIDGET_MAGNETIC_SNAP_THRESHOLD = 14`:**
  - Sürüklenen bir widget komşu bir widget’a yaklaştığında (`±14px` eşiği içinde), tam **`16px`** nefes payına (`margin`) veya komşunun `sol / sağ / üst / alt` kenar hizasına (`align`) mıknatıslanır.
  - Komşu widget ile arasındaki `0..15px` bitişik bölge yasaklı bölgedir; bırakıldığında (`pointerUp`) hem manyetik hizalama hem de `resolveWidgetOverlaps` çalıştırılarak kayıtlı konumların en az `16px` aralıklı kalması garanti edilir.
  - Sağ alt tutamaçtan boyutlandırma (`computeWidgetResizeMagneticSnap`) sırasında da widget alttaki veya sağdaki komşuya çarpmadan `16px` kala manyetik olarak durur ya da sütun genişliğine hizalanır.

### 5.2 Pencere İşlemleri & Pencere Manyetik Boşluğu (`12px`)
- **`WINDOW_MAGNETIC_MARGIN = 12` & `WINDOW_MAGNETIC_SNAP_THRESHOLD = 14`:**
  - **Serbest Pencere Mıknatıslanması (`computeWindowMagneticSnap` & `computeWindowResizeMagneticSnap`):** Açık pencereler taşınırken veya **8 yönden** (`n, s, e, w, ne, nw, se, sw` — `RESIZE_HANDLE_SPECS`) boyutlandırılırken diğer pencerelerle aralarında tam **`12px`** manyetik boşluk bırakır veya kenar hizasına oturur.
  - **7 Kenar / Köşe Snap Bölgesi (`detectEdgeSnapZone` & `computeSnapBounds`):** Başlık çubuğu ekran kenarına/köşesine sürüklendiğinde canlı önizleme (`data-osgl-snap-preview`) belirir; `maximize`, `left-half`, `right-half`, `top-left`, `top-right`, `bottom-left` ve `bottom-right` bölgelerine Dock açıkken `12px` dış ve ara boşlukla yerleşir.
  - **Sürükleyerek Küçültme (`computeUnmaximizeDragOrigin`):** Ekranı kaplamış (`maximized`) bir pencerenin başlık çubuğu aşağı sürüklendiğinde imleç oranını koruyarak akıcı biçimde önceki boyutuna (`restoreBounds`) döner.
  - **`maximized` vs `fullscreen` (`Esc` Çıkışı):** Yeşil düğme pencereyi üst çubuk ve Dock’u koruyarak büyütür (`maximized`); mavi tam ekran düğmesi (`fullscreen`) `100vw × 100dvh` kaplar ve `Escape` tuşuyla tek adımda tam ekrandan çıkar.
  - **Pencere İçi `@container osgl-win` Duyarlılığı:** Her pencere gövdesi `container-type: inline-size; container-name: osgl-win` tanımlar; çeyrek ekrana (`1/4` kadran) bölünen modüller medya sorgusu yerine kendi pencere genişliğine göre daralır.
  - **İzole Cam Katmanı (Portal Koruması):** `backdrop-filter` pencere kabuğu yerine izole arka plan katmanında çalıştığı için pencere içindeki `Select`, `Modal` ve `DateTimePicker` portalları kırpılmaz veya kaymaz.

```tsx
import {
  WIDGET_MAGNETIC_MARGIN,
  WINDOW_MAGNETIC_MARGIN,
  resolveWidgetOverlaps,
  computeWidgetMagneticSnap,
  computeWindowMagneticSnap,
  computeSnapBounds,
} from 'truncgil-uxigl';

// 1. Widget'lar arasında minimum 16px manyetik boşluğu zorunlu kıl
const safePositions = resolveWidgetOverlaps(
  [
    { id: 'timer', pos: { x: 1020, y: 280 }, size: { width: 360, height: 180 }, locked: true },
    { id: 'tasks', pos: { x: 1080, y: 460 }, size: { width: 300, height: 220 } }, // -> y: 476 (460 + 16px)
  ],
  900
);

// 2. Sürüklenen pencere için komşu pencerelere 12px manyetik boşluk + kenar hizası hesapla
const winSnap = computeWindowMagneticSnap({
  rawX: 658,
  rawY: 44,
  winW: 600,
  winH: 480,
  siblings: [{ x: 40, y: 44, width: 600, height: 480 }],
  vw: 1440,
  vh: 900,
  dockVisible: true,
});
// winSnap.x === 652 (640 + WINDOW_MAGNETIC_MARGIN), winSnap.y === 44 (top-aligned)
```

---

## 6. Masaüstü Klasörleri, Akıllı Dock & Widget Kişiselleştirme

### 6.1 Masaüstü Izgarası & Klasörler (`DesktopGrid` & `DesktopFolderPopoverModal`)
- **Serbest Slot Izgarası (`iconSlots`):** Sütun öncelikli yerleşim, canlı bırakma önizlemesi ve Marquee çoklu seçim kutusu.
- **Klasör Sistemi:** Sağ tık `Yeni Klasör Oluştur` veya simgeyi klasör üstüne sürükle-bırak ile gruplama, satır içi yeniden adlandırma, 6 renk etiketi (`FOLDER_COLOR_PRESETS`), klasör içinden masaüstüne geri çıkarma ve klasörü dağıtma.

### 6.2 Akıllı Dock (`Dock` & `DockCustomizerPopover`)
- İmleç yakınlığına duyarlı macOS büyütme animasyonu (`useDockMagnification`) ve açık pencere noktaları.
- Sabitlenmemiş açık uygulamaların Dock sağ bölümünde otomatik belirmesi ve sağ tık ile kalıcı sabitlenmesi.
- `DockCustomizerPopover` ile tek merkezden sabitleme, sıralama ve varsayılana sıfırlama.

### 6.3 Widget Özelleştirme Şeması (`WidgetCustomizePopover` & `WidgetCustomField`)
Üst çubuktaki **Widget Ayarları** menüsünde her satırın sağındaki ayar düğmesi veya widget üzerindeki sağ tık, portal tabanlı `WidgetCustomizePopover` penceresini açar (`glass | solid | tinted` yüzey, 7 vurgu rengi, `S/M/L` boyut önayarları, özel başlık ve `customFields`):

```tsx
const kpiWidget: OSDesktopWidgetDefinition = {
  id: 'revenue-kpi',
  labelTr: 'Canlı Kasa Nabzı',
  labelEn: 'Live Cash Pulse',
  defaultSize: { width: 300, height: 200 },
  sizePresets: [
    { id: 'small', label: 'Kompakt', width: 280, height: 160 },
    { id: 'medium', label: 'Standart', width: 300, height: 200 },
    { id: 'large', label: 'Geniş', width: 380, height: 240 },
  ],
  customFields: [
    {
      key: 'period',
      label: 'Dönem Filtresi',
      type: 'segmented',
      defaultValue: 'monthly',
      options: [
        { value: 'daily', label: 'Günlük' },
        { value: 'monthly', label: 'Aylık' },
      ],
    },
  ],
  render: (ctx) => {
    const period = ctx.getOption?.('period', 'monthly');
    return <div>Aktif Dönem: {period}</div>;
  },
};
```

---

## 7. İzole Kalıcılık & Çoklu Kullanıcı Tema Kapsamı (`storageScopeKey` & `userScopeKey`)

- **OSGL Durumu:** `loadOSGLState(scopeKey)` / `saveOSGLState(scopeKey, state)` (`uxu.osgl.state.v4.<scope>`).
- **Widget Verisi:** `loadOSGLWidgetData(widgetKey, fallback, scopeKey)` / `saveOSGLWidgetData(widgetKey, value, scopeKey)` (`uxu.osgl.widget.v2.<scope>.<widget>`).
- **Tema İzolasyonu (`ThemeProvider`):** `initialUserScopeKey` ve `useTheme().setUserScopeKey(nextUser)` ile aynı tarayıcıda oturum değiştiren kullanıcıların palet, `workspaceShell` (`WORKSPACE_SHELL_CATALOG` — 6 kabuk) ve karanlık/aydınlık tercihleri birbirine sızmadan izole edilir.
