// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, applyInputMask } from '../../src/components/primitives/Input/Input';

describe('Input Primitive Component', () => {
  describe('applyInputMask helper', () => {
    it('should format phone number correctly', () => {
      expect(applyInputMask('5551234567', 'phone')).toBe('(555) 123 45 67');
      expect(applyInputMask('905551234567', 'phone')).toBe('(555) 123 45 67');
    });

    it('should format IBAN correctly', () => {
      const iban = applyInputMask('TR123456789012345678901234', 'iban');
      expect(iban.startsWith('TR12 3456 7890')).toBe(true);
    });

    it('should format tax ID, credit card, and date masks', () => {
      expect(applyInputMask('1234567890', 'tax-id')).toBe('123 456 7890');
      expect(applyInputMask('1234567812345678', 'credit-card')).toBe('1234 5678 1234 5678');
      expect(applyInputMask('16021988', 'date-mask')).toBe('16.02.1988');
    });
  });

  describe('Component Rendering & Behavior', () => {
    it('should render label, native input, placeholder and trigger onChange', () => {
      const onChange = vi.fn();
      render(
        <Input
          label="Kullanıcı Adı"
          value="john_doe"
          placeholder="Adınızı girin"
          onChange={onChange}
        />
      );

      expect(screen.getByText('Kullanıcı Adı')).toBeDefined();
      const input = screen.getByPlaceholderText('Adınızı girin') as HTMLInputElement;
      expect(input.value).toBe('john_doe');

      fireEvent.change(input, { target: { value: 'john_new' } });
      expect(onChange).toHaveBeenCalledWith('john_new');
    });

    it('should apply validation states (error, warning, success) and display messages', () => {
      const { rerender } = render(
        <Input
          value="test"
          onChange={vi.fn()}
          errorText="Geçersiz e-posta adresi"
        />
      );

      expect(screen.getByText('Geçersiz e-posta adresi')).toBeDefined();
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('true');

      rerender(
        <Input
          value="test"
          onChange={vi.fn()}
          validationState="success"
          successText="Kullanıcı adı müsait"
        />
      );
      expect(screen.getByText('Kullanıcı adı müsait')).toBeDefined();
    });

    it('should render clear button and reset value on click', () => {
      const onChange = vi.fn();
      render(<Input value="Mevcut Metin" onChange={onChange} clearable />);

      const clearBtn = screen.getByRole('button', { name: /Metni temizle/i });
      expect(clearBtn).toBeDefined();

      fireEvent.click(clearBtn);
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should toggle password visibility in revealable mode', () => {
      render(
        <Input
          type="password"
          value="Secret123"
          onChange={vi.fn()}
          revealablePassword
        />
      );

      const input = document.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');

      const revealBtn = screen.getByRole('button', { name: /Şifreyi göster/i });
      fireEvent.click(revealBtn);

      expect(input.type).toBe('text');
      expect(screen.getByRole('button', { name: /Şifreyi gizle/i })).toBeDefined();
    });

    it('should render prefixText, suffixText, and character counter', () => {
      render(
        <Input
          value="150"
          onChange={vi.fn()}
          prefixText="₺"
          suffixText="TL"
          showCount
          maxLength={10}
        />
      );

      expect(screen.getByText('₺')).toBeDefined();
      expect(screen.getByText('TL')).toBeDefined();
      expect(screen.getByText('3/10')).toBeDefined();
    });

    it('should apply input mask on change events', () => {
      const onChange = vi.fn();
      render(<Input value="" onChange={onChange} mask="phone" placeholder="Telefon" />);

      const input = screen.getByPlaceholderText('Telefon');
      fireEvent.change(input, { target: { value: '5551234567' } });

      expect(onChange).toHaveBeenCalledWith('(555) 123 45 67');
    });
  });
});
