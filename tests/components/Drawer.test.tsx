// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Drawer } from '../../src/components/composites/Drawer/Drawer';

describe('Drawer', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('renders nothing when closed, and renders dialog with aria-labelledby, aria-describedby, and placement/size classes when open', () => {
    const { rerender } = render(
      <Drawer
        open={false}
        onClose={() => {}}
        title="Düğüm Telemetri Denetçisi"
        subtitle="eu-central-1 · M4 Ultra"
      >
        <p>Detaylar</p>
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Drawer
        open={true}
        onClose={() => {}}
        title="Düğüm Telemetri Denetçisi"
        subtitle="eu-central-1 · M4 Ultra"
        badge="CANLI"
        placement="left"
        size="lg"
        variant="tonal"
        footer={<button type="button">Kaydet</button>}
      >
        <p>Detaylar</p>
      </Drawer>
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Düğüm Telemetri Denetçisi',
    });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('eu-central-1 · M4 Ultra');
    expect(dialog).toHaveClass(
      'uxu-drawer-panel--left',
      'uxu-drawer-panel--lg',
      'uxu-drawer-panel--tonal'
    );
    expect(screen.getByText('CANLI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeInTheDocument();
  });

  it('locks document.body.style.overflow to hidden while open and restores it on close or unmount', () => {
    document.body.style.overflow = 'scroll';

    const { rerender, unmount } = render(
      <Drawer open={true} onClose={() => {}} title="Scroll Lock Drawer">
        <p>Body</p>
      </Drawer>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Drawer open={false} onClose={() => {}} title="Scroll Lock Drawer">
        <p>Body</p>
      </Drawer>
    );
    expect(document.body.style.overflow).toBe('scroll');

    rerender(
      <Drawer open={true} onClose={() => {}} title="Scroll Lock Drawer">
        <p>Body</p>
      </Drawer>
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('invokes onClose via close button, Escape key, and overlay click, but not when clicking inside drawer panel', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <Drawer open={true} onClose={onClose} title="Çekmece Kapatma Testi">
        <p>Çekmece içi içerik</p>
      </Drawer>
    );

    // Clicking inside drawer content does NOT close
    await user.click(screen.getByText('Çekmece içi içerik'));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking close button invokes onClose
    await user.click(screen.getByRole('button', { name: 'Çekmeceyi kapat' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Pressing Escape invokes onClose
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);

    // Clicking overlay invokes onClose
    const overlay = container.querySelector('.uxu-drawer-overlay');
    expect(overlay).not.toBeNull();
    await user.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
