// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge, BadgeVariant } from '../../src/components/primitives/Badge/Badge';
import { SemanticTone } from '../../src/core/contracts/ComponentContracts';

describe('Badge Primitive Component', () => {
  it('should render badge label with default tonal and pill classes', () => {
    const { container } = render(<Badge>Aktif</Badge>);
    const badge = container.querySelector('.uxu-badge');
    expect(badge).toBeDefined();
    expect(badge?.classList.contains('uxu-badge--tonal')).toBe(true);
    expect(badge?.classList.contains('uxu-badge--primary')).toBe(true);
    expect(badge?.classList.contains('uxu-badge--pill')).toBe(true);
    expect(screen.getByText('Aktif')).toBeDefined();
  });

  it('should apply all visual variants', () => {
    const variants: BadgeVariant[] = ['tonal', 'filled', 'glass', 'outlined'];
    variants.forEach((v) => {
      const { container, unmount } = render(<Badge variant={v}>{v}</Badge>);
      const badge = container.querySelector('.uxu-badge');
      expect(badge?.classList.contains(`uxu-badge--${v}`)).toBe(true);
      unmount();
    });
  });

  it('should apply semantic tones', () => {
    const tones: SemanticTone[] = ['primary', 'neutral', 'success', 'danger', 'warning', 'info'];
    tones.forEach((tone) => {
      const { container, unmount } = render(<Badge tone={tone}>{tone}</Badge>);
      const badge = container.querySelector('.uxu-badge');
      expect(badge?.classList.contains(`uxu-badge--${tone}`)).toBe(true);
      unmount();
    });
  });

  it('should render pulse dot indicator when pulse is true', () => {
    const { container, rerender } = render(<Badge pulse={false}>Normal</Badge>);
    expect(container.querySelector('.uxu-badge__pulse-dot')).toBeNull();

    rerender(<Badge pulse={true}>Canlı Yayın</Badge>);
    expect(container.querySelector('.uxu-badge__pulse-dot')).not.toBeNull();
  });

  it('should render leading and trailing icons', () => {
    render(
      <Badge
        leadingIcon={<span data-testid="lead">●</span>}
        trailingIcon={<span data-testid="trail">✓</span>}
      >
        Onaylandı
      </Badge>
    );

    expect(screen.getByTestId('lead')).toBeDefined();
    expect(screen.getByTestId('trail')).toBeDefined();
    expect(screen.getByText('Onaylandı')).toBeDefined();
  });
});
