import React, { memo, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export function TrafficLights({
  maximized,
  fullscreen = false,
  controlsSide = 'left',
  onClose,
  onMinimize,
  onMaximize,
  onFullscreen,
}: {
  maximized: boolean;
  fullscreen?: boolean;
  controlsSide?: 'left' | 'right';
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFullscreen?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const btnStyle = (bg: string): React.CSSProperties => ({
    width: 13,
    height: 13,
    borderRadius: 999,
    border: 'none',
    backgroundColor: bg,
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(15, 23, 42, 0.78)',
    lineHeight: 1,
    boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.16)',
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: controlsSide === 'right' ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 7,
      }}
    >
      <button
        type="button"
        aria-label="Kapat"
        title="Kapat"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={btnStyle('#ff5f57')}
      >
        {hovered ? (
          <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" />
          </svg>
        ) : null}
      </button>
      <button
        type="button"
        aria-label="Küçült"
        title="Küçült"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
        style={btnStyle('#febc2e')}
      >
        {hovered ? (
          <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1.5 4H6.5" />
          </svg>
        ) : null}
      </button>
      <button
        type="button"
        aria-label="Büyüt"
        title={maximized ? 'Önceki Boyut' : 'Ekranı Kapla'}
        onClick={(e) => {
          e.stopPropagation();
          onMaximize();
        }}
        style={btnStyle('#28c840')}
      >
        {hovered ? (
          maximized ? (
            <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor">
              <path d="M1.5 6.5H4.8L1.5 3.2V6.5ZM6.5 1.5H3.2L6.5 4.8V1.5Z" />
            </svg>
          ) : (
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 1.5V6.5M1.5 4H6.5" />
            </svg>
          )
        ) : null}
      </button>
      {onFullscreen && (
        <button
          type="button"
          aria-label={fullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          title={fullscreen ? 'Tam Ekrandan Çık (Esc)' : 'Tam Ekran'}
          onClick={(e) => {
            e.stopPropagation();
            onFullscreen();
          }}
          style={btnStyle('#38bdf8')}
        >
          {hovered ? (
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1.5 3V1.5H3M5 1.5H6.5V3M6.5 5V6.5H5M3 6.5H1.5V5" />
            </svg>
          ) : null}
        </button>
      )}
    </div>
  );
}

export function ContextMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-menu-item="true"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 10px',
        borderRadius: 7,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        fontSize: 13,
        fontWeight: 400,
        letterSpacing: '-0.008em',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.16)';
      }}
      onMouseLeave={(e) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.16)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function ContextSubMenu({
  icon,
  label,
  isDark,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' && document.activeElement === triggerRef.current) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
          requestAnimationFrame(() => {
            const first = panelRef.current?.querySelector<HTMLButtonElement>('[data-menu-item="true"]');
            first?.focus();
          });
        } else if (e.key === 'ArrowLeft' && panelRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-menu-item="true"
        data-submenu-trigger="true"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 9,
          padding: '6px 10px',
          borderRadius: 7,
          border: 'none',
          outline: 'none',
          backgroundColor: open ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
          color: 'inherit',
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: '-0.008em',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.16)';
        }}
        onBlur={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          {icon}
          <span>{label}</span>
        </span>
        <ChevronRight size={13} style={{ opacity: 0.65, flexShrink: 0 }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          data-submenu-panel="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: -4,
            left: 'calc(100% + 4px)',
            minWidth: 210,
            padding: 6,
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            color: isDark ? '#f8fafc' : '#0f172a',
            backdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(15,23,42,0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.32)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 2200,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export const MenuBarClock = memo(function MenuBarClock() {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }, 30_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
      {clock}
    </span>
  );
});

