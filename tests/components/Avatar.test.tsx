// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar, AvatarGroup } from '../../src/components/primitives/Avatar/Avatar';

describe('Avatar & AvatarGroup Primitive Components', () => {
  describe('Avatar', () => {
    it('should generate initials from single or multiple word names', () => {
      const { rerender } = render(<Avatar name="Ahmet Yılmaz" />);
      expect(screen.getByText('AY')).toBeDefined();

      rerender(<Avatar name="Beste" />);
      expect(screen.getByText('BE')).toBeDefined();

      rerender(<Avatar />);
      expect(screen.getByText('UX')).toBeDefined();
    });

    it('should render image when src is valid and fallback to initials on error', () => {
      render(
        <Avatar
          src="https://example.com/avatar.png"
          name="Can Demir"
          alt="Profil Resmi"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeDefined();
      expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');

      // Trigger error fallback
      fireEvent.error(img);
      expect(screen.getByText('CD')).toBeDefined();
    });

    it('should render presence status ring', () => {
      const { container } = render(<Avatar name="Gizem" status="online" />);
      const statusRing = container.querySelector('.uxu-avatar__status--online');
      expect(statusRing).toBeDefined();
      expect(statusRing?.getAttribute('aria-label')).toBe('Durum: online');
    });

    it('should apply shapes (circle, squircle) and sizes', () => {
      const { container, rerender } = render(<Avatar name="Ece" shape="circle" size="lg" />);
      let avatar = container.querySelector('.uxu-avatar');
      expect(avatar?.classList.contains('uxu-avatar--circle')).toBe(true);
      expect(avatar?.classList.contains('uxu-avatar--lg')).toBe(true);

      rerender(<Avatar name="Ece" shape="squircle" size="xs" />);
      avatar = container.querySelector('.uxu-avatar');
      expect(avatar?.classList.contains('uxu-avatar--squircle')).toBe(true);
      expect(avatar?.classList.contains('uxu-avatar--xs')).toBe(true);
    });
  });

  describe('AvatarGroup', () => {
    it('should slice items to max and render overflow badge', () => {
      render(
        <AvatarGroup max={2}>
          <Avatar name="Ali Veli" />
          <Avatar name="Burak Kaya" />
          <Avatar name="Cemil Tan" />
          <Avatar name="Deniz Ak" />
        </AvatarGroup>
      );

      expect(screen.getByText('AV')).toBeDefined();
      expect(screen.getByText('BK')).toBeDefined();
      expect(screen.queryByText('CT')).toBeNull();
      expect(screen.getByText('+2')).toBeDefined();
    });
  });
});
