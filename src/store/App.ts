import { makeObservable, observable, action } from "mobx";
import { DeepPartial, Theme, Themecolor, ThemeFontSettings, Settings } from "./types";
import * as WebFont from 'webfontloader';
import merge from 'deepmerge';

const defaultTheme: Theme = {
  color: {
    saturation: 0.85,
    brightBoost: 0.1,
    backgroundHinder: 0.4,
    blackBoost: 0.25,
    colorBase: 12,
    colorTop: 255,
  },
  font: {
    family: 'Inconsolata',
    size: 15, // in pixels
    letterSpacing: 0, // in pixels
    lineHeight: 100 // in percents
  }
};

class App {
  theme: Theme = defaultTheme;
  firstTime: boolean = true;
  loadedFonts: Array<string> = []; // array of strings like: 'Robot Mono:400'
  showSettings: boolean = false;

  constructor() {
    makeObservable(this, {
      theme: observable,
      firstTime: observable,
      loadedFonts: observable,
      showSettings: observable,
      setThemeColor: action,
      setThemeFont: action,
      setFontLoaded: action,
      toogleSettings: action,
    });
    // loading fonts
    WebFont.load({
      google: {
        families: [
          'Roboto Mono:400,700',
          'Inconsolata:400,700',
          'Cousine:400,700',
          'Source Code Pro:400,700',
          'Anonymous Pro:400,700',
          'Fira Code:400,700',
          'IBM Plex Mono:400,700',
          'Nanum Gothic Coding:400,700',
          'Ubuntu Mono:400,700',
        ]
      },
      classes: false,
      fontactive: this.setFontLoaded,
    });

    // loading settings from local storage
    this.loadSettings();
    this.updateSettings();

    // applying theme
    this.setThemeColor(this.theme.color);
    this.setThemeFont(this.theme.font);
  }

  setThemeColor = (color: Partial<Themecolor>) => {
    this.theme = merge<Theme, DeepPartial<Theme>>(this.theme, { color });
    this.updateSettings();
    this.updateTheme(this.theme);
  }

  setThemeFont = (font: Partial<ThemeFontSettings>) => {
    this.theme = merge<Theme, DeepPartial<Theme>>(this.theme, { font });
    this.updateSettings();
    this.updateTheme(this.theme);
  }

  setFontLoaded = (fontName: string, fontVariant: string) => {
    this.loadedFonts.push(fontName + ':' + fontVariant.replace('n','') + '00');
  }

  toogleSettings = () => {
    this.showSettings = !this.showSettings;
  }

  /** Sets colour and theme related variables and styles on document.body */
  updateTheme = (theme: Theme) => {
    const root = document.documentElement;
    const cs = theme.color;

    // CSS variables are written to body as string representing an integer number
    // to avoid any issues with value types not matching what CSs properties expect
    const toIntStr = (val: number) => Math.round(val).toFixed(0).toString();

    const maxNormal = cs.colorTop * (1 - cs.brightBoost);
    const maxBright = cs.colorTop;
    const maxDim = cs.colorTop * (1 - cs.brightBoost) * (1 - cs.backgroundHinder);
    const blackBase = cs.colorBase + (maxNormal - cs.colorBase) * cs.blackBoost;

    root.style.setProperty('--colorBase', toIntStr(cs.colorBase));
    root.style.setProperty('--maxNormal', toIntStr(maxNormal));
    root.style.setProperty('--maxBright', toIntStr(maxBright));
    root.style.setProperty('--maxDim', toIntStr(maxDim));
    root.style.setProperty('--minNormal', toIntStr(cs.colorBase + ((maxNormal - cs.colorBase) * (1 - cs.saturation))));
    root.style.setProperty('--minBright', toIntStr(cs.colorBase + ((maxBright - cs.colorBase) * (1 - cs.saturation))));
    root.style.setProperty('--minDim', toIntStr(cs.colorBase + ((maxDim - cs.colorBase) * (1 - cs.saturation))));
    root.style.setProperty('--blackBase', toIntStr(blackBase))
    root.style.setProperty('--blackBright', toIntStr(blackBase * ( 1 + cs.brightBoost)));

    root.style.setProperty('--fontFamily', theme.font.family);
    root.style.setProperty('--fontSize', `${theme.font.size}px`);
    root.style.setProperty('--letterSpacing', `${theme.font.letterSpacing}px`);
    root.style.setProperty('--lineHeight', `${theme.font.lineHeight}%`);
  }

  loadSettings = () => {
    const defaultSettings = {
      theme: defaultTheme,
    }
    try {
      const settings = localStorage.getItem('killermud');
      if (!settings) {
        return defaultSettings;
      }
      const jsonSettings = JSON.parse(settings);
      this.theme = jsonSettings.theme;
    } catch (e) {
      return defaultSettings;
    }
  }

  updateSettings = (settings?: DeepPartial<Settings>) => {
    let current = { theme: this.theme };
    if (settings) {
      this.loadSettings();
      current = merge<Settings, DeepPartial<Settings>>(current, settings);
    } else {
      current = { theme: this.theme };
    }
    localStorage.setItem('killermud', JSON.stringify(current));
  }
}

export default App;
