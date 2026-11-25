import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, RotateCcw, StickyNote, Trash2 } from 'lucide-react';
import type { WidgetThemeStyle } from './widgetCards';

const NOTES_STORAGE_KEY = 'uxigl_osgl_widget_notes';

export function FocusTimerWidgetCard({
  theme,
  defaultMinutes = 25,
}: {
  theme: WidgetThemeStyle;
  defaultMinutes?: number;
}) {
  const normalizedDefault = Math.max(1, Math.min(180, Math.round(defaultMinutes || 25)));
  const [totalSec, setTotalSec] = useState(normalizedDefault * 60);
  const [timerSec, setTimerSec] = useState(normalizedDefault * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setTimerRunning(false);
    setTotalSec(normalizedDefault * 60);
    setTimerSec(normalizedDefault * 60);
  }, [normalizedDefault]);

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const mins = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const secs = String(timerSec % 60).padStart(2, '0');
  const progress = totalSec > 0 ? Math.max(0, Math.min(1, timerSec / totalSec)) : 0;
  const { isTR, isDark, primaryColor, subtleBg, subtleBorder, cardStyle, scale } = theme;
  const s = Math.max(0.88, Math.min(1.65, scale));

  const ringSize = Math.round(36 * Math.min(1.45, s));
  const ringR = 14;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - progress);

  return (
    <div style={cardStyle}>
      {/* Top Bar: Title & Segmented Presets */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: Math.round(12 * s), fontWeight: 700 }}>
          <Clock size={Math.round(14 * s)} color={primaryColor} />
          <span>{isTR ? 'Odak Sayacı' : 'Focus Timer'}</span>
        </span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: 2,
            borderRadius: 999,
            backgroundColor: subtleBg,
            border: `1px solid ${subtleBorder}`,
          }}
        >
          {Array.from(new Set([5, 15, 25, normalizedDefault]))
            .sort((a, b) => a - b)
            .slice(0, 4)
            .map((m) => {
            const isActive = totalSec === m * 60;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTotalSec(m * 60);
                  setTimerSec(m * 60);
                }}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: isActive
                    ? isDark
                      ? 'rgba(59, 130, 246, 0.24)'
                      : '#ffffff'
                    : 'transparent',
                  color: isActive ? (isDark ? '#93c5fd' : primaryColor) : 'inherit',
                  opacity: isActive ? 1 : 0.72,
                  boxShadow: isActive ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                  fontSize: Math.round(10 * Math.min(1.25, s)),
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}
              >
                {m}m
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Countdown + Ring + Controls */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(9 * Math.min(1.3, s)) }}>
          <svg
            width={ringSize}
            height={ringSize}
            viewBox="0 0 36 36"
            aria-hidden="true"
            style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="18"
              cy="18"
              r={ringR}
              fill="none"
              stroke={subtleBorder}
              strokeWidth="3.2"
            />
            <circle
              cx="18"
              cy="18"
              r={ringR}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={ringCirc}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: Math.round(23 * s),
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {mins}:{secs}
            </span>
            <span style={{ fontSize: Math.round(10 * Math.min(1.25, s)), opacity: 0.62, fontWeight: 600, marginTop: 2 }}>
              {timerSec === 0
                ? isTR
                  ? 'Süre doldu'
                  : 'Completed'
                : timerRunning
                ? isTR
                  ? 'Odaklanılıyor...'
                  : 'Focusing...'
                : isTR
                ? 'Hazır'
                : 'Ready'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setTimerRunning((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: `${Math.round(6 * Math.min(1.25, s))}px ${Math.round(12 * Math.min(1.25, s))}px`,
              borderRadius: 999,
              border: 'none',
              outline: 'none',
              backgroundColor: primaryColor,
              color: '#ffffff',
              fontSize: Math.round(11.5 * Math.min(1.25, s)),
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.24)',
            }}
          >
            {timerRunning ? <Pause size={Math.round(13 * Math.min(1.25, s))} /> : <Play size={Math.round(13 * Math.min(1.25, s))} />}
            <span>{timerRunning ? (isTR ? 'Durdur' : 'Pause') : isTR ? 'Başlat' : 'Start'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setTimerSec(totalSec);
            }}
            title={isTR ? 'Sıfırla' : 'Reset'}
            style={{
              width: Math.round(28 * Math.min(1.25, s)),
              height: Math.round(28 * Math.min(1.25, s)),
              borderRadius: 999,
              border: `1px solid ${subtleBorder}`,
              outline: 'none',
              backgroundColor: subtleBg,
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={Math.round(13 * Math.min(1.25, s))} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuickNotesWidgetCard({ theme }: { theme: WidgetThemeStyle }) {
  const [noteText, setNoteText] = useState<string>(() => {
    try {
      return window.localStorage.getItem(NOTES_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, noteText);
    } catch {
      // ignore storage errors
    }
  }, [noteText]);

  const { isTR, primaryColor, subtleBg, subtleBorder, cardStyle, scale } = theme;
  const s = Math.max(0.88, Math.min(1.5, scale));

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: Math.round(12 * s), fontWeight: 700 }}>
          <StickyNote size={Math.round(14 * s)} color={primaryColor} />
          <span>{isTR ? 'Hızlı Notlar' : 'Quick Notes'}</span>
        </span>
        {noteText && (
          <button
            type="button"
            onClick={() => setNoteText('')}
            title={isTR ? 'Notu Temizle' : 'Clear Note'}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              opacity: 0.6,
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder={isTR ? 'Buraya hızlı not alabilirsiniz...' : 'Jot down a quick note...'}
        style={{
          width: '100%',
          flex: 1,
          resize: 'none',
          minHeight: 54,
          padding: '7px 9px',
          borderRadius: 9,
          border: `1px solid ${subtleBorder}`,
          backgroundColor: subtleBg,
          color: 'inherit',
          fontSize: Math.round(11.5 * Math.min(1.35, s)),
          lineHeight: 1.4,
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}