// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, ButtonVariant } from '../../src/components/primitives/Button/Button';

describe('Button Primitive Component', () => {
  it('should render button with text content and default classes', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: /Click Me/i });
    expect(btn).toBeDefined();
    expect(btn.classList.contains('uxu-btn')).toBe(true);
    expect(btn.classList.contains('uxu-btn--filled')).toBe(true);
    expect(btn.classList.contains('uxu-btn--md')).toBe(true);
  });

  it('should apply all visual variants correctly', () => {
    const variants: ButtonVariant[] = [
      'filled',
      'tonal',
      'glass',
      'outlined',
      'ghost',
      'danger',
      'success',
      'warning',
    ];

    variants.forEach((v) => {
      const { unmount } = render(<Button variant={v}>{v}</Button>);
      const btn = screen.getByRole('button', { name: v });
      expect(btn.classList.contains(`uxu-btn--${v}`)).toBe(true);
      unmount();
    });
  });

  it('should apply sizes, pill, and fullWidth modifiers', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let btn = screen.getByRole('button', { name: /Small/i });
    expect(btn.classList.contains('uxu-btn--sm')).toBe(true);

    rerender(<Button size="lg" pill fullWidth>Large Pill</Button>);
    btn = screen.getByRole('button', { name: /Large Pill/i });
    expect(btn.classList.contains('uxu-btn--lg')).toBe(true);
    expect(btn.classList.contains('uxu-btn--pill')).toBe(true);
    expect(btn.classList.contains('uxu-btn--full')).toBe(true);
  });

  it('should handle disabled state and prevent click triggers', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Btn</Button>);
    const btn = screen.getByRole('button', { name: /Disabled Btn/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render loading spinner, set aria-busy and display loadingText', () => {
    render(
      <Button loading loadingText="Yükleniyor...">
        Kaydet
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Yükleniyor...')).toBeDefined();
  });

  it('should render leadingIcon, trailingIcon, and badgeCount', () => {
    render(
      <Button
        leadingIcon={<span data-testid="lead-icon">🔍</span>}
        trailingIcon={<span data-testid="trail-icon">➔</span>}
        badgeCount={5}
      >
        Search
      </Button>
    );

    expect(screen.getByTestId('lead-icon')).toBeDefined();
    expect(screen.getByTestId('trail-icon')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  describe('Toggleable Switch Mode', () => {
    it('should toggle internal state and invoke onPressedChange and onToggle', () => {
      const onPressedChange = vi.fn();
      const onToggle = vi.fn();

      render(
        <Button
          toggleable
          defaultPressed={false}
          onPressedChange={onPressedChange}
          onToggle={onToggle}
        >
          Karanlık Mod
        </Button>
      );

      const btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByText('KAPALI')).toBeDefined();

      fireEvent.click(btn);

      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByText('AÇIK')).toBeDefined();
      expect(onPressedChange).toHaveBeenCalledWith(true);
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('should respect controlled pressed prop', () => {
      const { rerender } = render(
        <Button toggleable pressed={true}>
          Durum
        </Button>
      );
      let btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByText('AÇIK')).toBeDefined();

      rerender(
        <Button toggleable pressed={false}>
          Durum
        </Button>
      );
      btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByText('KAPALI')).toBeDefined();
    });
  });

  describe('Collapsible Mode', () => {
    it('should toggle expanded state and invoke onExpandedChange', () => {
      const onExpandedChange = vi.fn();
      render(
        <Button collapsible onExpandedChange={onExpandedChange}>
          Detayları Göster
        </Button>
      );

      const btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(btn);
      expect(btn.getAttribute('aria-expanded')).toBe('true');
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Split Action Button Mode', () => {
    const customItems = [
      { id: 'opt-1', label: 'Birinci Seçenek' },
      { id: 'opt-2', label: 'İkinci Seçenek', shortcut: '⌘S' },
    ];

    it('should render split main and trigger buttons and open dropdown menu', () => {
      const onSplitSelect = vi.fn();
      render(
        <Button splitAction splitItems={customItems} onSplitSelect={onSplitSelect}>
          Ana Aksiyon
        </Button>
      );

      const triggerBtn = screen.getByRole('button', { name: /Ek aksiyon seçenekleri/i });
      expect(triggerBtn).toBeDefined();

      // Open menu
      fireEvent.click(triggerBtn);
      const menu = screen.getByRole('menu');
      expect(menu).toBeDefined();
      expect(screen.getByText('Birinci Seçenek')).toBeDefined();
      expect(screen.getByText('İkinci Seçenek')).toBeDefined();

      // Select item
      const itemBtn = screen.getByRole('menuitem', { name: /Birinci Seçenek/i });
      fireEvent.click(itemBtn);

      expect(onSplitSelect).toHaveBeenCalledWith('opt-1');
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('should dismiss split menu when clicking outside', () => {
      render(
        <div>
          <div data-testid="outside">Dış Alan</div>
          <Button splitAction splitItems={customItems}>
            Ana Aksiyon
          </Button>
        </div>
      );

      const triggerBtn = screen.getByRole('button', { name: /Ek aksiyon seçenekleri/i });
      fireEvent.click(triggerBtn);
      expect(screen.getByRole('menu')).toBeDefined();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });
});
