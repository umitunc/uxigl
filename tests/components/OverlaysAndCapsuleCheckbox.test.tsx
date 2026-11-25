// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  Select,
  Checkbox,
  matchesTrSearch,
} from '../../src/components/primitives';
import {
  Modal,
  CommandPalette,
} from '../../src/components/composites';

describe('Portal Overlays, Turkish Multi-Token Search & Capsule Checkbox', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('matchesTrSearch folds Turkish diacritics and supports multi-token queries', () => {
    expect(matchesTrSearch('İş Bankası Sanal POS', 'is bankasi')).toBe(true);
    expect(matchesTrSearch('İstanbul Merkez Şube', 'ISTANBUL SUBE')).toBe(true);
    expect(matchesTrSearch('Öğrenci Ücretleri', 'ogrenci ucret')).toBe(true);
    expect(matchesTrSearch('Kasa Hesabı', 'banka')).toBe(false);
  });

  it('renders Select popover into document.body portal and filters Turkish options', () => {
    const onChange = vi.fn();
    const { container } = render(
      <div style={{ overflow: 'hidden', height: 40 }} data-testid="clipped-wrapper">
        <Select
          label="Hesap Seçimi"
          searchable
          value=""
          onChange={onChange}
          options={[
            { value: 'isbank', label: 'İş Bankası Kurumsal POS' },
            { value: 'ziraat', label: 'Ziraat Bankası Gişe' },
          ]}
        />
      </div>
    );

    const trigger = screen.getByRole('button', { name: /Hesap Seçimi/i });
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.contains(listbox)).toBe(true);

    const searchInput = screen.getByPlaceholderText(/ara/i);
    fireEvent.change(searchInput, { target: { value: 'is bankasi kurumsal' } });

    const matchingOption = screen.getByRole('option', { name: /İş Bankası Kurumsal POS/i });
    expect(matchingOption).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ziraat/i })).toBeNull();

    fireEvent.click(matchingOption);
    expect(onChange).toHaveBeenCalledWith('isbank');
  });

  it('protects Modal from accidental close when text drag starts inside dialog and releases on backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <div data-testid="local-host">
        <Modal open onClose={onClose} title="Sözleşme Detayı">
          <div data-testid="modal-inner-content">İçerik alanı</div>
        </Modal>
      </div>
    );

    const dialog = screen.getByRole('dialog');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.contains(dialog)).toBe(true);

    const backdrop = dialog.parentElement!;
    fireEvent.mouseDown(screen.getByTestId('modal-inner-content'));
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders CommandPalette in a portal and filters Turkish multi-token commands', () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        open
        onClose={() => {}}
        actions={[
          {
            id: 'cmd-1',
            title: 'Öğrenci İndirim Tanımla',
            category: 'İşlemler',
            onSelect,
          },
        ]}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ogrenci tanimla' } });
    const item = screen.getByText('Öğrenci İndirim Tanımla');
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('supports both default box and Apple HIG capsule Checkbox variants', () => {
    const { container, rerender } = render(
      <Checkbox value={false} onChange={() => {}} label="Standart Kutu" />
    );
    expect(container.querySelector('.uxu-checkbox-box')).not.toBeNull();
    expect(container.querySelector('.uxu-checkbox-capsule')).toBeNull();

    rerender(
      <Checkbox value={true} variant="capsule" onChange={() => {}} label="Kapsül Seçim" />
    );
    expect(container.querySelector('.uxu-checkbox-capsule')).toHaveClass('uxu-checkbox-capsule--checked');
  });
});
