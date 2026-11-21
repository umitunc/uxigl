// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {
  Accordion,
  type AccordionItemData,
} from '../../src/components/composites/Accordion/Accordion';

const SAMPLE_ITEMS: AccordionItemData[] = [
  {
    id: 'faq-theme',
    title: 'Tema Motoru Nasıl Çalışır?',
    subtitle: 'ThemeProvider ve CSS değişkenleri',
    content: 'useTheme() kancası ile 6 tohum palet yönetilir.',
  },
  {
    id: 'faq-webgl',
    title: 'SheetGL 120 FPS Modu',
    content: 'Donanım hızlandırmalı WebGL tablo motoru.',
  },
  {
    id: 'faq-disabled',
    title: 'Kurumsal Lisans (Yakında)',
    content: 'Bu bölüm kilitlidir.',
    disabled: true,
  },
  {
    id: 'faq-a11y',
    title: 'WAI-ARIA Erişilebilirlik',
    content: 'Tam klavye ve ekran okuyucu uyumluluğu.',
  },
];

describe('Accordion', () => {
  afterEach(() => {
    cleanup();
  });

  it('supports single-expand mode by default and wires aria-expanded, aria-controls, and role="region" with aria-labelledby', async () => {
    const user = userEvent.setup();
    render(
      <Accordion items={SAMPLE_ITEMS} defaultExpandedIds={['faq-theme']} />
    );

    const themeBtn = screen.getByRole('button', {
      name: /Tema Motoru Nasıl Çalışır\?/i,
    });
    const webglBtn = screen.getByRole('button', {
      name: /SheetGL 120 FPS Modu/i,
    });

    expect(themeBtn).toHaveAttribute('aria-expanded', 'true');
    expect(webglBtn).toHaveAttribute('aria-expanded', 'false');

    const region = screen.getByRole('region', {
      name: /Tema Motoru Nasıl Çalışır\?/i,
    });
    expect(region).toHaveTextContent(
      'useTheme() kancası ile 6 tohum palet yönetilir.'
    );
    expect(themeBtn.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(themeBtn.id);

    // Clicking second item expands it and collapses the first item
    await user.click(webglBtn);
    expect(webglBtn).toHaveAttribute('aria-expanded', 'true');
    expect(themeBtn).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('region', { name: /SheetGL 120 FPS Modu/i })
    ).toHaveTextContent('Donanım hızlandırmalı WebGL tablo motoru.');
  });

  it('supports multi-expand mode (allowMultiple) and ignores clicks on disabled items', async () => {
    const user = userEvent.setup();
    render(
      <Accordion
        items={SAMPLE_ITEMS}
        allowMultiple
        defaultExpandedIds={['faq-theme']}
        variant="tonal"
      />
    );

    const themeBtn = screen.getByRole('button', {
      name: /Tema Motoru Nasıl Çalışır\?/i,
    });
    const webglBtn = screen.getByRole('button', {
      name: /SheetGL 120 FPS Modu/i,
    });
    const disabledBtn = screen.getByRole('button', {
      name: /Kurumsal Lisans \(Yakında\)/i,
    });

    expect(disabledBtn).toBeDisabled();
    expect(disabledBtn).toHaveAttribute('aria-disabled', 'true');

    // Clicking disabled item does not expand it
    await user.click(disabledBtn);
    expect(disabledBtn).toHaveAttribute('aria-expanded', 'false');

    // Clicking second item keeps both first and second open
    await user.click(webglBtn);
    expect(themeBtn).toHaveAttribute('aria-expanded', 'true');
    expect(webglBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('region')).toHaveLength(2);
  });

  it('navigates focus across enabled triggers via ArrowDown, ArrowUp, Home, and End while skipping disabled items', async () => {
    const user = userEvent.setup();
    render(<Accordion items={SAMPLE_ITEMS} />);

    const themeBtn = screen.getByRole('button', {
      name: /Tema Motoru Nasıl Çalışır\?/i,
    });
    const webglBtn = screen.getByRole('button', {
      name: /SheetGL 120 FPS Modu/i,
    });
    const a11yBtn = screen.getByRole('button', {
      name: /WAI-ARIA Erişilebilirlik/i,
    });

    themeBtn.focus();
    expect(themeBtn).toHaveFocus();

    // ArrowDown -> webglBtn
    await user.keyboard('{ArrowDown}');
    expect(webglBtn).toHaveFocus();

    // ArrowDown from webglBtn skips disabled 'faq-disabled' -> a11yBtn
    await user.keyboard('{ArrowDown}');
    expect(a11yBtn).toHaveFocus();

    // ArrowDown from a11yBtn wraps around -> themeBtn
    await user.keyboard('{ArrowDown}');
    expect(themeBtn).toHaveFocus();

    // ArrowUp from themeBtn wraps around -> a11yBtn
    await user.keyboard('{ArrowUp}');
    expect(a11yBtn).toHaveFocus();

    // Home -> themeBtn, End -> a11yBtn
    await user.keyboard('{Home}');
    expect(themeBtn).toHaveFocus();

    await user.keyboard('{End}');
    expect(a11yBtn).toHaveFocus();
  });
});
