// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../../src/components/primitives/Alert/Alert';
import { ToastTone } from '../../src/core/contracts/NotificationContract';

describe('Alert Primitive Component', () => {
  it('should render alert title and description with role="alert"', () => {
    render(
      <Alert
        title="Sistem Güncellemesi"
        description="Saat 03:00'te bakım çalışması yapılacaktır."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(screen.getByText('Sistem Güncellemesi')).toBeDefined();
    expect(screen.getByText("Saat 03:00'te bakım çalışması yapılacaktır.")).toBeDefined();
  });

  it('should apply all semantic tones and visual variants', () => {
    const tones: ToastTone[] = ['primary', 'success', 'warning', 'danger', 'info', 'neutral', 'glass'];
    tones.forEach((tone) => {
      const { container, unmount } = render(
        <Alert tone={tone} variant="glass" title={`Başlık ${tone}`} />
      );
      const alert = container.querySelector('.uxu-alert');
      expect(alert?.classList.contains(`uxu-alert--${tone}`)).toBe(true);
      expect(alert?.classList.contains('uxu-alert--glass')).toBe(true);
      unmount();
    });
  });

  it('should render custom action and icon slots', () => {
    render(
      <Alert
        title="Depolama Doldu"
        icon={<span data-testid="custom-icon">💾</span>}
        action={<button type="button">Yükselt</button>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeDefined();
    expect(screen.getByRole('button', { name: /Yükselt/i })).toBeDefined();
  });

  it('should handle dismissible mode and trigger onDismiss callback', () => {
    const onDismiss = vi.fn();
    render(
      <Alert
        title="Kapatılabilir Bildirim"
        dismissible
        onDismiss={onDismiss}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Uyarıyı kapat/i });
    expect(closeBtn).toBeDefined();

    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
