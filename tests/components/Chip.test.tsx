// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from '../../src/components/primitives/Chip/Chip';

describe('Chip Primitive Component', () => {
  it('should render chip text content with default classes', () => {
    const { container } = render(<Chip>Filtre</Chip>);
    const chip = container.querySelector('.uxu-chip');
    expect(chip).toBeDefined();
    expect(chip?.classList.contains('uxu-chip--tonal')).toBe(true);
    expect(chip?.classList.contains('uxu-chip--primary')).toBe(true);
    expect(screen.getByText('Filtre')).toBeDefined();
  });

  it('should render selected state with checkmark icon', () => {
    const { container, rerender } = render(<Chip selected={false}>Kategori</Chip>);
    expect(container.querySelector('.uxu-chip__check')).toBeNull();

    rerender(<Chip selected={true}>Kategori</Chip>);
    expect(container.querySelector('.uxu-chip__check')).not.toBeNull();
    const chip = container.querySelector('.uxu-chip');
    expect(chip?.classList.contains('uxu-chip--selected')).toBe(true);
  });

  it('should handle interactive mode via click and keyboard (Enter/Space)', () => {
    const handleClick = vi.fn();
    render(<Chip onClick={handleClick}>Tıklanabilir</Chip>);

    const chip = screen.getByRole('button', { name: /Tıklanabilir/i });
    expect(chip.getAttribute('tabindex')).toBe('0');

    // Click
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Enter key
    fireEvent.keyDown(chip, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Space key
    fireEvent.keyDown(chip, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('should render dismiss button and trigger onDismiss', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Chip dismissible onDismiss={onDismiss}>
        Etiket
      </Chip>
    );

    const dismissBtn = container.querySelector('.uxu-chip__dismiss') as HTMLButtonElement;
    expect(dismissBtn).toBeDefined();

    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should prevent interactions when disabled', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Chip disabled onClick={handleClick}>
        Devre Dışı
      </Chip>
    );

    const chip = container.querySelector('.uxu-chip') as HTMLElement;
    expect(chip.classList.contains('uxu-chip--disabled')).toBe(true);
    expect(chip.getAttribute('role')).toBeNull();

    fireEvent.click(chip);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
