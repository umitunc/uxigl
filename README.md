# uxiGL — Modular Liquid Glass × Google Material You Design System

> **Uniting User Experience (UX), User Interface (UI), and Hardware-Accelerated WebGL (`SheetGL` + `FileManGL`) into a Single Enterprise Architecture.**

[![Version](https://img.shields.io/badge/version-2.6.0-0284c7.svg)](https://github.com/umitunc/uxigl)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](https://opensource.org/licenses/MIT)

---

## 🎨 Brand Identity & Single-Glyph Monogram (`U` + `X` + `I`)

**`uxiGL`** is part of the `GL` ecosystem alongside **`SheetGL`** and **`FileManGL`**.

The [`UXILogo`](src/components/brand/UXILogo.tsx) emblem reduces the three letters **U**, **X**, and **I** into a **single unified 3D Liquid-Glass glyph**:
1. **`U` — Outer Liquid-Glass Cradle:** The outer continuous ribbon forms a 3D `U` bowl that holds the entire symbol.
2. **`X` — Intersecting Diagonal Blades:** Two crossed diagonal light ribbons (`\ /`) bridge the arms of the `U`.
3. **`I` — Central Crystalline Pillar:** A vertical luminescent spine passes directly through the center of the `X` and `U`, crowned with a floating diamond node (`•`).

---

## ✨ Key Architectural Highlights

1. **Liquid Glass & Standard Materials:**
   - **Liquid Glass (`Regular` & `Clear`):** Reserved strictly for the floating navigation and transient control layer (`Sidebar`, `TopHeader`, `CommandPalette`, `SegmentedControl`, `Slider` & `Switch` thumbs).
   - **Standard Materials (`UltraThin`, `Thin`, `Regular`, `Thick`):** Applied to the content layer (`Card`, `DataTable`, KPI panels) with 4-tier **Vibrancy** (`label-primary`, `label-secondary`, `label-tertiary`, `fill-vibrant`).
2. **Google Material You (M3) & Live `0px–32px` Border Radius Engine:**
   - **6 Seed Color Palettes:** *Cupertino Blue, Material Iris, Emerald Mint, Sunset Coral, Amber Gold, Graphite Mono* with automatic dark/light tonal adaptation.
   - **Live Corner Geometry (`0px–32px`):** Switch between `Sharp (4px)`, `Squircle (12px)`, `Pill (22px)`, or fine-tune any pixel radius (`0px–32px`) from the TopHeader (`R- | R:12px | R+`), Component Playground, or Theme Studio Drawer.
   - **Global Font Scale (`80%–125%`):** Real-time root `rem` scaling persisted in `localStorage`.
3. **Dual Data Table Architecture (`SheetGL` + Native `<DataTable />`):**
   - **`SheetGLGridAdapter` (WebGL/Canvas DataGrid):** Includes **4 enterprise scenarios** (*SaaS & Enterprise Finance*, *AI & Cloud Node Telemetry*, *Workforce & Payroll Matrix*, *Global Logistics & SKU Inventory*) with live formula evaluation, sorting, filtering, and CSV export.
   - **Native `<DataTable />`:** Zero-GPU semantic HTML table with **4 visual variants** (`default`, `striped`, `bordered`, `compact`), column sorting, search filtering, and row selection.
4. **FileManGL WebGL2 Virtual File System (`FileManGLExplorerAdapter`):**
   - Windows 11 tabbed explorer UX, 3D Spatial View (`webgl_spatial`), Disk Treemap (`webgl_diskmap`), and a 5-layer **NTFS ACL + POSIX (`0755`)** permission engine.
5. **Clean HTML5 History API Routing (`RouteService`):**
   - Every navigation item, tab, breadcrumb, and component renders as a semantic `<a href="...">` with clean URLs (`/`, `/dashboard/*`, `/components/*`, `/docs/*`) and full browser Back/Forward (`popstate`) support.
6. **Zero Idle CPU/GPU Resource Footprint & SOLID Principles:**
   - Single-Active-Engine policy ensures only one heavy canvas (`SheetGL` or `FileManGL`) is mounted per view.
   - Strict Dependency Inversion (`ThemeEngineService`, `StorageService`, `RouteService`) and Open/Closed component contracts.

---

## 🔗 Application Route Map

| URL Route | View / Module | Description |
| :--- | :--- | :--- |
| `/` | `UXILandingPage` | Full-screen `uxiGL` product landing page with live interactive preview & phonetic guide |
| `/dashboard/overview` | `AppleGoogleAppShowcase` | Command Center Overview (KPIs, neural telemetry, native table & SheetGL summary) |
| `/dashboard/analytics` | `AppleGoogleAppShowcase` | Live Analytics & Regional Performance Matrix |
| `/dashboard/crm-orders` | `SheetGLGridAdapter` | Full-page SheetGL (4 enterprise presets) + Native `<DataTable />` comparison |
| `/dashboard/file-manager` | `FileManGLExplorerAdapter` | Full-page FileManGL WebGL2 Virtual File System Explorer |
| `/dashboard/smart-cluster` | `AppleGoogleAppShowcase` | AI Neural Engine Compilation & Hardware Cluster Controls |
| `/components/inputs/:id` | `InteractivePlayground` | Form Controls (`button`, `input`, `switch`, `checkbox`, `slider`) |
| `/components/surfaces/:id` | `InteractivePlayground` | Surfaces & Navigation (`card`, `segmented-control`, `tabs-accordion`, `modal-command`) |
| `/components/feedback/:id` | `InteractivePlayground` | Data & Feedback (`chips-badges`, `progress-avatar`, `datatable-statcard`, `filemangl-explorer`) |
| `/docs/:topic` | `ArchitectureDocsView` | Interactive Documentation (`getting-started`, `theming-tokens`, `layout-shell`, `cli-shortcuts`) |

---

## 🚀 Quick Start (Single-Command Setup)

### 1. Install `uxiGL` (All-in-One Design System)

```bash
# SheetGL (WebGL DataGrid), FileManGL (WebGL2 VFS) and Lucide Icons are bundled directly!
npm install uxigl
# or: pnpm add uxigl | yarn add uxigl | bun add uxigl
```

### 2. Scaffold Ready-to-Use Workspace via NPX

```bash
# Generates a pre-configured <UXIWorkspace /> component & theme setup
npx uxigl init
```

### 3. Usage Example

```tsx
import React from 'react';
import {
  ThemeProvider,
  ToastProvider,
  Button,
  Card,
  SheetGLGridAdapter,
  FileManGLExplorerAdapter,
} from 'uxigl';
import 'uxigl/styles';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultRadius={12}>
      <ToastProvider>
        <Card variant="glass" title="uxiGL Enterprise Dashboard">
          <SheetGLGridAdapter scenario="saas_finance" />
        </Card>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### 4. Local Development & NPM Library Build

```bash
# Start Vite development server
npm run dev

# Build both demo SPA (dist/index.html) and npm library bundle (dist/lib)
npm run build

# Or compile the npm library & TypeScript declarations only
npm run build:lib

# Run package diagnostics
npm run doctor
```

---

## 📄 License

MIT License • Crafted with ❤️ by [Trunçgil Teknoloji](https://www.truncgil.com)
