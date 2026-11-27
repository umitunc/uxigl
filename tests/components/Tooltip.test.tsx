// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../../src/components/primitives/Tooltip/Tooltip';

describe('Tooltip Primitive Component', () => {
  it('should render children and toggle tooltip visibility on hover and focus', () => {
    render(
      <Tooltip content="Kopyala" shortcut="⌘C">
        <button type="button">Metin</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: /Metin/i })).toBeDefined();
    expect(screen.queryByRole('tooltip')).toBeNull();

    // Mouse enter -> visible
    const wrapper = screen.getByRole('button').parentElement as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeDefined();
    expect(screen.getByText('Kopyala')).toBeDefined();
    expect(screen.getByText('⌘C')).toBeDefined();

    // Mouse leave -> hidden
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();

    // Focus -> visible
    fireEvent.focus(wrapper);
    expect(screen.getByRole('tooltip')).toBeDefined();

    // Blur -> hidden
    fireEvent.blur(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('should apply placement class (top, bottom, left, right)', () => {
    const { rerender } = render(
      <Tooltip content="Üst" placement="bottom">
        <span>Hedef</span>
      </Tooltip>
    );

    const wrapper = screen.getByText('Hedef').parentElement as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.classList.contains('uxu-tooltip--bottom')).toBe(true);

    rerender(
      <Tooltip content="Sol" placement="left">
        <span>Hedef</span>
      </Tooltip>
    );
    tooltip = screen.getByRole('tooltip');
    expect(tooltip.classList.contains('uxu-tooltip--left')).toBe(true);
  });
});
