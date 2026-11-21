// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Modal } from '../../src/components/composites/Modal/Modal';

describe('Modal', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('renders nothing when closed, and renders dialog / alertdialog with aria-labelledby and aria-describedby when open', () => {
    const { rerender } = render(
      <Modal
        open={false}
        onClose={() => {}}
        title="Üretim Kümesi Dağıtımı"
        subtitle="Bu işlem 5 bölgeye yansıtılacak."
      >
        <p>Modal gövdesi</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Modal
        open={true}
        onClose={() => {}}
        title="Üretim Kümesi Dağıtımı"
        subtitle="Bu işlem 5 bölgeye yansıtılacak."
        footer={<button type="button">Onayla</button>}
      >
        <p>Modal gövdesi</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Üretim Kümesi Dağıtımı',
    });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(
      'Bu işlem 5 bölgeye yansıtılacak.'
    );
    expect(screen.getByText('Modal gövdesi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Onayla' })).toBeInTheDocument();

    // danger / alert variants use role="alertdialog"
    rerender(
      <Modal
        open={true}
        onClose={() => {}}
        variant="danger"
        title="Küme Silinsin mi?"
      >
        <p>Geri alınamaz</p>
      </Modal>
    );

    expect(
      screen.getByRole('alertdialog', { name: 'Küme Silinsin mi?' })
    ).toHaveClass('uxu-modal--variant-danger', 'uxu-modal--tone-danger');
  });

  it('locks document.body.style.overflow to hidden while open and restores it on close or unmount', () => {
    document.body.style.overflow = 'auto';

    const { rerender, unmount } = render(
      <Modal open={true} onClose={() => {}} title="Scroll Lock Test">
        <p>Content</p>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={() => {}} title="Scroll Lock Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('auto');

    rerender(
      <Modal open={true} onClose={() => {}} title="Scroll Lock Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('invokes onClose via close button, Escape key, and backdrop click, but not when clicking inside modal content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <Modal open={true} onClose={onClose} title="Kapatma Testi">
        <p>İçerik metni</p>
      </Modal>
    );

    // Clicking inside modal content does NOT close
    await user.click(screen.getByText('İçerik metni'));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking close button invokes onClose
    await user.click(screen.getByRole('button', { name: 'Pencereyi kapat' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Pressing Escape invokes onClose
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);

    // Clicking backdrop invokes onClose
    const backdrop = container.querySelector('.uxu-modal-backdrop');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
