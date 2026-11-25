// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoogleIcon } from '../../src/components/primitives/GoogleIcon/GoogleIcon';

describe('GoogleIcon Primitive Component', () => {
  it('should render icon ligature text with default classes', () => {
    const { container } = render(<GoogleIcon name="auto_awesome" />);
    const icon = container.querySelector('.uxu-google-icon');
    expect(icon).toBeDefined();
    expect(icon?.textContent).toBe('auto_awesome');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render accessible role="img" and aria-label when title is provided', () => {
    render(<GoogleIcon name="settings" title="Sistem Ayarları" />);
    const icon = screen.getByRole('img', { name: /Sistem Ayarları/i });
    expect(icon).toBeDefined();
    expect(icon.getAttribute('title')).toBe('Sistem Ayarları');
  });

  it('should map semantic sizes and custom number sizes to pixel metrics', () => {
    const { container, rerender } = render(<GoogleIcon name="home" size="xs" />);
    let icon = container.querySelector('.uxu-google-icon') as HTMLElement;
    expect(icon.style.fontSize).toBe('16px');
    expect(icon.style.width).toBe('16px');

    rerender(<GoogleIcon name="home" size="lg" />);
    icon = container.querySelector('.uxu-google-icon') as HTMLElement;
    expect(icon.style.fontSize).toBe('24px');

    rerender(<GoogleIcon name="home" size={32} />);
    icon = container.querySelector('.uxu-google-icon') as HTMLElement;
    expect(icon.style.fontSize).toBe('32px');
    expect(icon.style.getPropertyValue('--uxu-icon-opsz')).toBe('32');
  });

  it('should pass variable font axes (FILL, wght, GRAD) into CSS custom properties', () => {
    const { container } = render(
      <GoogleIcon
        name="palette"
        filled={true}
        weight={600}
        grade={100}
        iconStyle="outlined"
      />
    );

    const icon = container.querySelector('.uxu-google-icon') as HTMLElement;
    expect(icon.style.getPropertyValue('--uxu-icon-fill')).toBe('1');
    expect(icon.style.getPropertyValue('--uxu-icon-weight')).toBe('600');
    expect(icon.style.getPropertyValue('--uxu-icon-grade')).toBe('100');
    expect(icon.style.getPropertyValue('--uxu-icon-font-family')).toBe(
      "'Material Symbols Outlined'"
    );
  });

  it('should apply semantic tone class modifier', () => {
    const { container } = render(<GoogleIcon name="check_circle" tone="success" />);
    const icon = container.querySelector('.uxu-google-icon');
    expect(icon?.classList.contains('uxu-google-icon--success')).toBe(true);
  });
});
