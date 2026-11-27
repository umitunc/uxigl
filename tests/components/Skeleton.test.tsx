// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from '../../src/components/primitives/Skeleton/Skeleton';

describe('Skeleton Primitive Component', () => {
  it('should render skeleton placeholder with default squircle and dimensions', () => {
    const { container } = render(<Skeleton width={200} height={30} />);

    const el = container.querySelector('.uxu-skeleton') as HTMLElement;
    expect(el).toBeDefined();
    expect(el.classList.contains('uxu-skeleton--squircle')).toBe(true);
    expect(el.classList.contains('uxu-skeleton--animated')).toBe(true);
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('30px');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('should support circular, rectangular, and text variants', () => {
    const variants: ('circular' | 'rectangular' | 'text')[] = ['circular', 'rectangular', 'text'];

    variants.forEach((v) => {
      const { container, unmount } = render(<Skeleton variant={v} />);
      const el = container.querySelector('.uxu-skeleton');
      expect(el?.classList.contains(`uxu-skeleton--${v}`)).toBe(true);
      unmount();
    });
  });

  it('should respect animated=false and speed configuration', () => {
    const { container, rerender } = render(<Skeleton animated={false} />);
    expect(container.querySelector('.uxu-skeleton__shimmer')).toBeNull();

    rerender(<Skeleton animated speed="fast" />);
    const el = container.querySelector('.uxu-skeleton') as HTMLElement;
    expect(el.style.getPropertyValue('--uxu-shimmer-duration')).toBe('1.4s');
  });
});
