'use client';

import { useSyncExternalStore } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ReadingThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="hpa-theme">{children}</ThemeProvider>;
}

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return <label className="theme-control">
    <span>Theme</span>
    <select aria-label="Reading theme" value={mounted ? theme : 'system'} onChange={event => setTheme(event.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </label>;
}
