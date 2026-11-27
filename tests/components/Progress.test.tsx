// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from '../../src/components/primitives/Progress/Progress';

describe('Progress Primitive Component', () => {
  describe('Linear Variant', () => {
    it('should render linear progress bar with percentage and label', () => {
      render(
        <Progress
          value={65}
          max={100}
          label="Dosya İndiriliyor"
          showValue
        />
      );

      const bar = screen.getByRole('progressbar');
      expect(bar).toBeDefined();
      expect(bar.getAttribute('aria-valuenow')).toBe('65');
      expect(screen.getByText('Dosya İndiriliyor')).toBeDefined();
      expect(screen.getByText('65%')).toBeDefined();
    });

    it('should handle indeterminate linear progress', () => {
      render(<Progress indeterminate label="Hazırlanıyor..." />);

      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBeNull();
      const fill = bar.querySelector('.uxu-progress-linear__fill--indeterminate');
      expect(fill).toBeDefined();
    });
  });

  describe('Circular Variant', () => {
    it('should render SVG circular activity ring with track and fill circles', () => {
      render(
        <Progress
          variant="circular"
          value={80}
          max={100}
          size="md"
        />
      );

      const circular = screen.getByRole('progressbar');
      expect(circular).toBeDefined();
      expect(circular.getAttribute('aria-valuenow')).toBe('80');
      expect(screen.getByText('80%')).toBeDefined();

      const track = circular.querySelector('.uxu-progress-circular__track');
      const fill = circular.querySelector('.uxu-progress-circular__fill');
      expect(track).toBeDefined();
      expect(fill).toBeDefined();
    });

    it('should support indeterminate circular spinner', () => {
      const { container } = render(<Progress variant="circular" indeterminate />);

      const svg = container.querySelector('.uxu-progress-circular__svg--spin');
      expect(svg).toBeDefined();
    });
  });
});
