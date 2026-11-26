// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../../src/components/primitives/Checkbox/Checkbox';

describe('Checkbox Primitive Component', () => {
  it('should render checkbox with label and description', () => {
    render(
      <Checkbox
        value={false}
        onChange={vi.fn()}
        label="Kullanım Koşulları"
        description="Şartları okudum ve kabul ediyorum"
      />
    );

    expect(screen.getByText('Kullanım Koşulları')).toBeDefined();
    expect(screen.getByText('Şartları okudum ve kabul ediyorum')).toBeDefined();
    const btn = screen.getByRole('checkbox');
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('should trigger onChange on click with negated value', () => {
    const onChange = vi.fn();
    render(<Checkbox value={false} onChange={onChange} label="Onay" />);

    const btn = screen.getByRole('checkbox');
    fireEvent.click(btn);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should render checked state with Check icon', () => {
    const { container } = render(<Checkbox value={true} onChange={vi.fn()} />);

    const btn = screen.getByRole('checkbox');
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(btn.classList.contains('uxu-checkbox-box--checked')).toBe(true);
  });

  it('should render indeterminate state with aria-checked="mixed"', () => {
    render(<Checkbox value={false} indeterminate onChange={vi.fn()} />);

    const btn = screen.getByRole('checkbox');
    expect(btn.getAttribute('aria-checked')).toBe('mixed');
  });

  it('should prevent clicks when disabled', () => {
    const onChange = vi.fn();
    render(<Checkbox value={false} disabled onChange={onChange} />);

    const btn = screen.getByRole('checkbox') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });
});
