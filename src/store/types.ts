import { ReactNode } from 'react';

export type DeepPartial<T> = T extends Function ? T : (T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T);

export type ConsoleLine = {
  raw: string,
  text: string,
  formatted: ReactNode,
}

export type InventoryItem = {
  name: ReactNode,
  condition: number,
  qty: number,
}

export type Themecolor = {
  saturation: number, // [0 - 1] colors saturation
  brightBoost: number, // [0 - 1] by how much bright colours are lighter than normal
  backgroundHinder: number, // [0 - 1] by how much background color is darker than the same foreground color
  colorBase: number, // [0 - 255] minimal value of any rgb component - basically minimum luminosity
  colorTop: number, // [0 - 255] maximum value of any rgb component - basically maximum luminosity
  /*
   * [0 - 1] the black text color is special because it has to be boosted up to be visible
   * this value is percentage of the normal color text luminosity
   */
  blackBoost: number,
}

export type ThemeFontSettings = {
  family: string,
  size: number,
  letterSpacing: number,
  lineHeight: number,
}

export type Theme = {
  color: Themecolor,
  font: ThemeFontSettings,
}

export type Settings = {
  theme: Theme,
}

export type ConnSettings = {
  echo: boolean,
  keepAlive: boolean,
  proxyHost: string,
  proxyPort: string,
}