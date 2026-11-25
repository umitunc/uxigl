// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  ThemeProvider,
  ToastProvider,
  OSWorkspaceShell,
  WorkspaceShellGallery,
  WIDGET_MAGNETIC_MARGIN,
  WINDOW_MAGNETIC_MARGIN,
  RESIZE_HANDLE_SPECS,
  resolveWidgetOverlaps,
  computeWidgetMagneticSnap,
  computeWidgetResizeMagneticSnap,
  computeWindowMagneticSnap,
  computeSnapBounds,
  WORKSPACE_SHELL_CATALOG,
  type OSWorkspaceApp,
  type OSDesktopWidgetDefinition,
} from '../../src';
import { OSGLWorkspaceSection } from '../../src/features/docs/sections/OSGLWorkspaceSection';

const SAMPLE_APPS: OSWorkspaceApp[] = [
  {
    id: 'analytics-hub',
    label: 'Analitik Merkezi',
    shortLabel: 'Analitik',
    googleIcon: 'monitoring',
    category: 'Yönetim',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },
  {
    id: 'billing-ops',
    label: 'Finans Operasyonları',
    shortLabel: 'Finans',
    googleIcon: 'payments',
    category: 'Operasyon',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
];

const SAMPLE_WIDGETS: OSDesktopWidgetDefinition[] = [
  {
    id: 'live-summary',
    labelTr: 'Canlı Özet',
    labelEn: 'Live Summary',
    defaultSize: { width: 280, height: 150 },
    render: (ctx) => (
      <div data-testid="sample-widget-body" style={{ color: ctx.primaryColor }}>
        Aktif Özet Kartı
      </div>
    ),
  },
];

describe('Parametric OSWorkspaceShell, Magnetic Margins & OSGL Documentation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('prevents flush/touching widgets and enforces 16px WIDGET_MAGNETIC_MARGIN + alignment guides', () => {
    expect(WIDGET_MAGNETIC_MARGIN).toBe(16);

    // Case 1: Overlapping or flush (2px gap: 460 -> 462) widgets must separate by at least 16px
    const resolved = resolveWidgetOverlaps(
      [
        { id: 'focus-timer', pos: { x: 1020, y: 280 }, size: { width: 360, height: 180 }, locked: true },
        { id: 'daily-checklist', pos: { x: 1080, y: 462 }, size: { width: 300, height: 220 } },
      ],
      900
    );

    expect(resolved['focus-timer']).toEqual({ x: 1020, y: 280 });
    expect(resolved['daily-checklist'].y).toBe(280 + 180 + WIDGET_MAGNETIC_MARGIN); // 476px (never 462px flush!)

    // Case 2: Dragging near neighbor bottom + right edge snaps to 16px margin and right-edge alignment
    const snap = computeWidgetMagneticSnap({
      rawX: 1085,
      rawY: 468,
      width: 300,
      height: 200,
      neighbors: [{ id: 'focus-timer', x: 1020, y: 280, width: 360, height: 180 }],
      viewportW: 1440,
      viewportH: 900,
    });
    expect(snap.x).toBe(1080); // right-aligned: 1020 + 360 - 300
    expect(snap.y).toBe(476);  // 16px magnetic margin: 280 + 180 + 16
    expect(snap.snappedX).toBe(true);
    expect(snap.snappedY).toBe(true);
    expect(snap.guides.length).toBeGreaterThanOrEqual(2);

    // Case 3: Resizing downward stops cleanly 16px above the widget below
    const resizeSnap = computeWidgetResizeMagneticSnap({
      posX: 1020,
      posY: 280,
      rawW: 360,
      rawH: 185,
      neighbors: [{ id: 'daily-checklist', x: 1080, y: 476, width: 300, height: 220 }],
      viewportW: 1440,
      viewportH: 900,
    });
    expect(resizeSnap.height).toBe(180); // 476 - 16 - 280 = 180
    expect(resizeSnap.snappedH).toBe(true);
  });

  it('enforces 12px WINDOW_MAGNETIC_MARGIN on floating window drag and Dock-visible snap zones', () => {
    expect(WINDOW_MAGNETIC_MARGIN).toBe(12);
    expect(RESIZE_HANDLE_SPECS.map((s) => s.dir).sort()).toEqual([
      'e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w',
    ]);

    // Floating window dragged 4px from sibling (x=40..640 -> rawX=644) snaps out to 652 (640 + 12px)
    const winSnap = computeWindowMagneticSnap({
      rawX: 644,
      rawY: 48,
      winW: 560,
      winH: 440,
      siblings: [{ x: 40, y: 44, width: 600, height: 440 }],
      vw: 1440,
      vh: 900,
      dockVisible: true,
    });
    expect(winSnap.x).toBe(640 + WINDOW_MAGNETIC_MARGIN);
    expect(winSnap.y).toBe(44);
    expect(winSnap.guides.some((g) => g.kind === 'margin')).toBe(true);

    // Dock-visible split snap bounds maintain 12px outer & inter-window magnetic margins
    const leftDockSnap = computeSnapBounds('left-half', 1440, 900, true);
    const rightDockSnap = computeSnapBounds('right-half', 1440, 900, true);
    expect(leftDockSnap.x).toBe(12);
    expect(rightDockSnap.x - (leftDockSnap.x + leftDockSnap.width)).toBe(12);

    // Dock-hidden raw geometry preserves exact half-viewport compatibility
    expect(computeSnapBounds('left-half', 1440, 900, false)).toEqual({
      x: 0, y: 0, width: 720, height: 856,
    });
  });

  it('renders WorkspaceShellGallery with all 6 shell cards and bilingual OSGLWorkspaceSection docs', () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <ThemeProvider>
        <WorkspaceShellGallery value="osgl" onChange={onChange} defaultRoleShell="osgl" />
      </ThemeProvider>
    );

    expect(WORKSPACE_SHELL_CATALOG).toHaveLength(6);
    for (const item of WORKSPACE_SHELL_CATALOG) {
      expect(screen.getByTestId(`uxigl-shell-card-${item.id}`)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId('uxigl-shell-card-flowgl'));
    expect(onChange).toHaveBeenCalledWith('flowgl');
    unmount();

    render(
      <ThemeProvider>
        <ToastProvider>
          <OSGLWorkspaceSection isTR={true} />
        </ToastProvider>
      </ThemeProvider>
    );
    expect(
      screen.getByText(/Manyetik Boşluk \(16px \/ 12px\) & Gelişmiş Pencere İşlemleri API/i)
    ).toBeInTheDocument();
  });

  it('mounts OSWorkspaceShell from barrel export, opens app windows, and triggers inline Widgets menu customization popover', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 900 });

    render(
      <ThemeProvider initialUserScopeKey="test-osgl-user">
        <ToastProvider>
          <OSWorkspaceShell
            brandTitle="AcmeOS"
            storageScopeKey="test-osgl-user"
            apps={SAMPLE_APPS}
            widgets={SAMPLE_WIDGETS}
            renderWindowContent={(appId) => (
              <div data-testid={`win-body-${appId}`}>Pencere İçeriği: {appId}</div>
            )}
          />
        </ToastProvider>
      </ThemeProvider>
    );

    expect(screen.getByTestId('osgl-workspace-shell')).toBeInTheDocument();
    expect(screen.getByText('AcmeOS')).toBeInTheDocument();
    expect(screen.getByTestId('sample-widget-body')).toBeInTheDocument();

    const widgetsBtn = screen.getByRole('button', { name: 'Widget Ayarları' });
    fireEvent.click(widgetsBtn);

    const inlineSettingsBtn = document.querySelector(
      '[data-menu-widget-settings="live-summary"]'
    ) as HTMLButtonElement | null;
    expect(inlineSettingsBtn).not.toBeNull();
    fireEvent.click(inlineSettingsBtn!);

    const customizePopover = screen.getByTestId('osgl-widget-customize-popover');
    expect(customizePopover).toBeInTheDocument();
    expect(document.body.contains(customizePopover)).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Özelleştirme panelini kapat' }));
    fireEvent.click(screen.getByTestId('osgl-menubar-apps-btn'));
    fireEvent.click(screen.getByText('Analitik Merkezi'));

    expect(screen.getByTestId('win-body-analytics-hub')).toHaveTextContent(
      'Pencere İçeriği: analytics-hub'
    );
  });
});
