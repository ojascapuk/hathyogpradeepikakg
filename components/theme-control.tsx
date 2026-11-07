'use client';

import { useSyncExternalStore } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { Sun, Monitor, Moon } from 'lucide-react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ReadingThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="hpa-theme">{children}</ThemeProvider>;
}

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const modes = ['light', 'system', 'dark'];
  const current = mounted && modes.includes(theme ?? '') ? theme! : 'system';
  return <div className="theme-control" role="group" aria-label="Colour theme" data-ready={mounted}>
    <div className="theme-stops">{[[Sun,'Light'],[Monitor,'System'],[Moon,'Dark']].map(([Icon,label],index)=>{
      const ModeIcon=Icon as typeof Sun;
      return <button key={String(label)} type="button" disabled={!mounted} aria-label={`Use ${label} theme`} aria-pressed={current===modes[index]} onClick={()=>setTheme(modes[index])}><ModeIcon size={12}/><span>{String(label)}</span></button>;
    })}</div>
    <input type="range" min="0" max="2" step="1" disabled={!mounted} aria-label="Reading theme" aria-valuetext={current} value={modes.indexOf(current)} onChange={event=>setTheme(modes[Number(event.target.value)])}/>
  </div>;
}
