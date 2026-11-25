// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  ThemeProvider,
  useTheme,
} from '../../src/providers/ThemeProvider';
import { defaultThemeStorageAdapter } from '../../src/core/services/StorageService';

function ThemeScopeHarness() {
  const {
    preferences,
    userScopeKey,
    setUserScopeKey,
    setMode,
    setWorkspaceShell,
  } = useTheme();

  return (
    <div>
      <span data-testid="scope">{userScopeKey ?? 'global'}</span>
      <span data-testid="mode">{preferences.mode}</span>
      <span data-testid="shell">{preferences.workspaceShell ?? 'auto'}</span>
      <button type="button" onClick={() => setMode('light')}>
        Set Light
      </button>
      <button type="button" onClick={() => setWorkspaceShell('tesseragl')}>
        Set Tessera
      </button>
      <button type="button" onClick={() => setUserScopeKey('tenant-b:user-2')}>
        Switch Scope B
      </button>
    </div>
  );
}

describe('Scoped ThemeProvider & WorkspaceShell Preset Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('isolates theme preferences per userScopeKey without cross-contamination', () => {
    expect(defaultThemeStorageAdapter.loadPreferences('tenant-a:user-1')).toBeNull();

    render(
      <ThemeProvider initialUserScopeKey="tenant-a:user-1">
        <ThemeScopeHarness />
      </ThemeProvider>
    );

    expect(screen.getByTestId('scope')).toHaveTextContent('tenant-a:user-1');
    fireEvent.click(screen.getByText('Set Light'));
    fireEvent.click(screen.getByText('Set Tessera'));

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('shell')).toHaveTextContent('tesseragl');
    expect(defaultThemeStorageAdapter.loadPreferences('tenant-a:user-1')?.workspaceShell).toBe(
      'tesseragl'
    );
    expect(defaultThemeStorageAdapter.loadPreferences('tenant-b:user-2')).toBeNull();

    fireEvent.click(screen.getByText('Switch Scope B'));
    expect(screen.getByTestId('scope')).toHaveTextContent('tenant-b:user-2');
    expect(screen.getByTestId('shell')).toHaveTextContent('auto');
    expect(defaultThemeStorageAdapter.loadPreferences('tenant-a:user-1')?.workspaceShell).toBe(
      'tesseragl'
    );
  });
});
