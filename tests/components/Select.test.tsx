// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectOptionItem } from '../../src/components/primitives/Select/Select';

describe('Select Primitive Component', () => {
  const sampleOptions: SelectOptionItem[] = [
    { value: 'tr', label: 'Türkiye', badge: 'TR', badgeTone: 'primary' },
    { value: 'de', label: 'Almanya', description: 'Avrupa Birliği' },
    { value: 'us', label: 'Amerika Birleşik Devletleri' },
    { value: 'dis', label: 'Devre Dışı Ülke', disabled: true },
  ];

  it('should render select trigger with placeholder or selected option label', () => {
    const { rerender } = render(
      <Select
        value=""
        onChange={vi.fn()}
        options={sampleOptions}
        placeholder="Ülke seçin"
      />
    );

    expect(screen.getByText('Ülke seçin')).toBeDefined();

    rerender(
      <Select
        value="tr"
        onChange={vi.fn()}
        options={sampleOptions}
      />
    );

    expect(screen.getByText('Türkiye')).toBeDefined();
    expect(screen.getByText('TR')).toBeDefined();
  });

  it('should open dropdown menu on click, filter options, and select item', () => {
    const onChange = vi.fn();
    render(
      <Select
        value=""
        onChange={onChange}
        options={sampleOptions}
        searchable
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Listbox should be visible
    expect(screen.getByRole('listbox')).toBeDefined();
    expect(screen.getByText('Almanya')).toBeDefined();

    // Search query
    const searchInput = screen.getByPlaceholderText(/Seçeneklerde ara/i);
    fireEvent.change(searchInput, { target: { value: 'Alm' } });

    expect(screen.getByText('Almanya')).toBeDefined();
    expect(screen.queryByText('Amerika Birleşik Devletleri')).toBeNull();

    // Click option
    const optionBtn = screen.getByRole('option', { name: /Almanya/i });
    fireEvent.click(optionBtn);

    expect(onChange).toHaveBeenCalledWith('de');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should clear selection via clear button', () => {
    const onChange = vi.fn();
    render(
      <Select
        value="tr"
        onChange={onChange}
        options={sampleOptions}
        clearable
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Seçimi temizle/i });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should support keyboard navigation (Enter, ArrowDown, Escape)', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Select
        value=""
        onChange={onChange}
        options={sampleOptions}
      />
    );

    const field = container.firstChild as HTMLElement;

    // Open via Enter
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeDefined();

    // Close via Escape
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should not allow selecting disabled options', () => {
    const onChange = vi.fn();
    render(
      <Select
        value=""
        onChange={onChange}
        options={sampleOptions}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const disabledOption = screen.getByRole('option', { name: /Devre Dışı Ülke/i });
    fireEvent.click(disabledOption);

    expect(onChange).not.toHaveBeenCalled();
  });
});
