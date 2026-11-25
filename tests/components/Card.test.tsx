// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../../src/components/composites/Card/Card';

describe('Card Composite Component', () => {
  it('should render card children inside container with default glass styling', () => {
    const { container } = render(
      <Card>
        <p>Kart İçeriği</p>
      </Card>
    );

    const card = container.querySelector('.uxu-card');
    expect(card).toBeDefined();
    expect(card?.classList.contains('uxu-card--glass')).toBe(true);
    expect(screen.getByText('Kart İçeriği')).toBeDefined();
  });

  it('should render full header composition (eyebrow, title, subtitle, icon, action)', () => {
    render(
      <Card
        eyebrow="GENEL BAKIŞ"
        title="Gelir Raporu"
        subtitle="Son 30 günlük satış trendi"
        headerIcon={<span data-testid="hdr-icon">📊</span>}
        headerAction={<button type="button">Filtrele</button>}
      >
        <div>Grafik Alanı</div>
      </Card>
    );

    expect(screen.getByText('GENEL BAKIŞ')).toBeDefined();
    expect(screen.getByText('Gelir Raporu')).toBeDefined();
    expect(screen.getByText('Son 30 günlük satış trendi')).toBeDefined();
    expect(screen.getByTestId('hdr-icon')).toBeDefined();
    expect(screen.getByRole('button', { name: /Filtrele/i })).toBeDefined();
  });

  it('should render footer slot', () => {
    render(
      <Card footer={<div data-testid="card-footer">Son güncelleme: Bugün</div>}>
        Ana Metin
      </Card>
    );

    expect(screen.getByTestId('card-footer')).toBeDefined();
    expect(screen.getByText('Son güncelleme: Bugün')).toBeDefined();
  });

  it('should support interactive mode with click and keyboard (Enter/Space)', () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick} glowOnHover>
        Tıklanabilir Kart
      </Card>
    );

    const card = screen.getByRole('button');
    expect(card.classList.contains('uxu-card--interactive')).toBe(true);
    expect(card.classList.contains('uxu-card--glow')).toBe(true);

    // Click
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Enter
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Space
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});
