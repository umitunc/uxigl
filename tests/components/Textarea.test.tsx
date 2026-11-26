// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../../src/components/primitives/Textarea/Textarea';

describe('Textarea Primitive Component', () => {
  it('should render textarea with label, placeholder, and character counter', () => {
    const onChange = vi.fn();
    render(
      <Textarea
        label="Açıklama"
        value="İlk satır"
        placeholder="Bir açıklama girin..."
        maxLength={200}
        showCount
        onChange={onChange}
      />
    );

    expect(screen.getByText('Açıklama')).toBeDefined();
    expect(screen.getByText('9/200')).toBeDefined();

    const textarea = screen.getByPlaceholderText('Bir açıklama girin...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('İlk satır');

    fireEvent.change(textarea, { target: { value: 'Yeni satır' } });
    expect(onChange).toHaveBeenCalledWith('Yeni satır');
  });

  it('should render quick template suggestions and append them on click', () => {
    const onChange = vi.fn();
    const templates = ['Onaylandı ve arşivlendi', 'İnceleme bekleniyor'];

    render(
      <Textarea
        value="Rapor no: 104"
        onChange={onChange}
        quickTemplates={templates}
      />
    );

    expect(screen.getByText(/Hazır Şablon:/)).toBeDefined();
    const tplBtn = screen.getByRole('button', { name: /\+ Onaylandı ve arşivlendi/i });
    expect(tplBtn).toBeDefined();

    fireEvent.click(tplBtn);
    expect(onChange).toHaveBeenCalledWith('Rapor no: 104\nOnaylandı ve arşivlendi');
  });

  it('should render clear button and clear value on click', () => {
    const onChange = vi.fn();
    render(<Textarea value="Silinecek metin" onChange={onChange} clearable />);

    const clearBtn = screen.getByRole('button', { name: /Temizle/i });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should display errorText and status messages', () => {
    render(
      <Textarea
        value=""
        onChange={vi.fn()}
        errorText="Açıklama alanı boş bırakılamaz"
      />
    );

    expect(screen.getByText('Açıklama alanı boş bırakılamaz')).toBeDefined();
  });

  it('should handle disabled state', () => {
    const onChange = vi.fn();
    render(<Textarea value="Sabit" onChange={onChange} disabled quickTemplates={['Test']} />);

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
    expect(screen.queryByText(/Hazır Şablon:/)).toBeNull();
  });
});
