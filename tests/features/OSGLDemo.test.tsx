// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ThemeProvider } from '../../src/providers/ThemeProvider';
import { ToastProvider } from '../../src/providers/ToastProvider';
import { OSGLDemo } from '../../src/features/demos/OSGLDemo';

describe('OSGLDemo Showcase (/demos/osgl) Parity, 8-Way Window Ops & Magnetic Margin', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 900 });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.body.style.overflow = '';
  });

  it('opens inline per-widget settings popover and renders all 8 window resize handles + snap menu', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <OSGLDemo />
        </ToastProvider>
      </ThemeProvider>
    );

    // Default floating window has all 8 directional resize handles
    const resizeHandles = Array.from(document.querySelectorAll('[data-osgl-resize]')).map((el) =>
      el.getAttribute('data-osgl-resize')
    );
    expect(resizeHandles.sort()).toEqual(['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w']);

    // Top bar Window menu exposes active window corner/half snapping
    fireEvent.click(screen.getByText('Pencere'));
    expect(screen.getByText('Aktif Pencereyi Köşeye Yasla')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Widget Ayarları' }));
    expect(screen.getByText('Masaüstü Widget Ayarları')).toBeInTheDocument();

    const timerSettingsBtn = document.querySelector(
      '[data-menu-widget-settings="timer"]'
    ) as HTMLButtonElement | null;
    expect(timerSettingsBtn).not.toBeNull();
    fireEvent.click(timerSettingsBtn!);

    expect(screen.getByTestId('osgl-widget-customize-popover')).toBeInTheDocument();
    expect(screen.getByText('Varsayılan Odak Süresi')).toBeInTheDocument();
  });

  it('supports desktop folder creation, Dock customizer dialog, Escape dismissal, and Turkish Ctrl+K Spotlight search', () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <OSGLDemo />
        </ToastProvider>
      </ThemeProvider>
    );

    const root = container.firstElementChild as HTMLElement;
    fireEvent.contextMenu(root, { clientX: 420, clientY: 320 });
    expect(screen.getByText('Yeni Klasör Oluştur')).toBeInTheDocument();
    expect(screen.getByText('Alt Dock Simgelerini Özelleştir...')).toBeInTheDocument();

    // Escape dismisses open desktop ContextMenu
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Yeni Klasör Oluştur')).toBeNull();

    // Create a desktop folder via right-click menu
    fireEvent.contextMenu(root, { clientX: 420, clientY: 320 });
    fireEvent.click(screen.getByText('Yeni Klasör Oluştur'));
    const renameInput = screen.getByLabelText('Klasör Adı');
    fireEvent.change(renameInput, { target: { value: 'Finans Araçları' } });
    fireEvent.keyDown(renameInput, { key: 'Enter' });
    expect(screen.getByText('Finans Araçları')).toBeInTheDocument();

    // Open Dock Customizer via Dock button
    fireEvent.click(screen.getByRole('button', { name: 'Alt Dock Simgelerini Özelleştir' }));
    const dockDialog = screen.getByRole('dialog', { name: 'Alt Dock Simgelerini Özelleştir' });
    expect(dockDialog).toBeInTheDocument();
    fireEvent.click(within(dockDialog).getByRole('button', { name: 'Kapat' }));

    // Test Ctrl+K Turkish diacritic-insensitive search ("dokumantasyon" -> "Dokümantasyon")
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const paletteDialog = screen.getByRole('dialog');
    const searchBox = within(paletteDialog).getByPlaceholderText(/Uygulama, pencere veya komut ara/i);
    fireEvent.change(searchBox, { target: { value: 'dokumantasyon' } });
    expect(within(paletteDialog).getByText('Dokümantasyon')).toBeInTheDocument();
  });
});
