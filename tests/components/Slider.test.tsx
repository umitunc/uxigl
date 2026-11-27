// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from '../../src/components/primitives/Slider/Slider';

describe('Slider Primitive Component', () => {
  it('should render slider with label, value, and valueSuffix', () => {
    render(
      <Slider
        label="Ses Seviyesi"
        value={75}
        onChange={vi.fn()}
        min={0}
        max={100}
        valueSuffix="%"
      />
    );

    expect(screen.getByText('Ses Seviyesi')).toBeDefined();
    expect(screen.getByText('75%')).toBeDefined();
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.value).toBe('75');
  });

  it('should trigger onChange with numeric value on change event', () => {
    const onChange = vi.fn();
    render(
      <Slider
        value={20}
        onChange={onChange}
        min={0}
        max={100}
        step={5}
      />
    );

    const input = screen.getByRole('slider');
    fireEvent.change(input, { target: { value: '45' } });

    expect(onChange).toHaveBeenCalledWith(45);
  });

  it('should render ticks when showTicks is enabled', () => {
    const { container } = render(
      <Slider
        value={10}
        onChange={vi.fn()}
        min={0}
        max={50}
        step={10}
        showTicks
      />
    );

    const ticks = container.querySelectorAll('.uxu-slider-tick');
    expect(ticks.length).toBeGreaterThan(0);
  });

  it('should render leading and trailing icons', () => {
    render(
      <Slider
        value={50}
        onChange={vi.fn()}
        leadingIcon={<span data-testid="vol-down">🔈</span>}
        trailingIcon={<span data-testid="vol-up">🔊</span>}
      />
    );

    expect(screen.getByTestId('vol-down')).toBeDefined();
    expect(screen.getByTestId('vol-up')).toBeDefined();
  });

  it('should handle disabled state', () => {
    const { container } = render(<Slider value={30} onChange={vi.fn()} disabled />);
    const group = container.querySelector('.uxu-slider-group');
    expect(group?.classList.contains('uxu-slider-group--disabled')).toBe(true);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
