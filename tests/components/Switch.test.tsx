// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../../src/components/primitives/Switch/Switch';

describe('Switch Primitive Component', () => {
  it('should render switch toggle with label and description', () => {
    render(
      <Switch
        value={false}
        onChange={vi.fn()}
        label="E-Posta Bildirimleri"
        description="Yeni siparişlerde anlık bildirim al"
      />
    );

    expect(screen.getByText('E-Posta Bildirimleri')).toBeDefined();
    expect(screen.getByText('Yeni siparişlerde anlık bildirim al')).toBeDefined();

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');
  });

  it('should toggle boolean value on click', () => {
    const onChange = vi.fn();
    render(<Switch value={false} onChange={onChange} label="Karanlık Mod" />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should render checked track class when value is true', () => {
    render(<Switch value={true} onChange={vi.fn()} />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
    expect(switchBtn.classList.contains('uxu-switch--checked')).toBe(true);
  });

  it('should prevent toggle interaction when disabled', () => {
    const onChange = vi.fn();
    render(<Switch value={false} disabled onChange={onChange} />);

    const switchBtn = screen.getByRole('switch') as HTMLButtonElement;
    expect(switchBtn.disabled).toBe(true);

    fireEvent.click(switchBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should render errorText in place of description when provided', () => {
    render(
      <Switch
        value={false}
        onChange={vi.fn()}
        description="Normal açıklama"
        errorText="Açılması zorunlu alan"
      />
    );

    expect(screen.getByText('Açılması zorunlu alan')).toBeDefined();
    expect(screen.queryByText('Normal açıklama')).toBeNull();
  });
});
