import React from 'react';

import { useStore } from '../../store';
import { observer } from 'mobx-react';

const Settings = observer(() => {
  const store = useStore();
  const { theme, setThemeColor, setThemeFont, showSettings } = store.app;

  return (
    <div className="settings" style={{ display: showSettings ? 'block' : 'none' }}>
      colorBase: {theme.color.colorBase}
      <input type="range" min="0" max="255"
        value={theme.color.colorBase}
        onChange={(el) => setThemeColor({
          colorBase: parseInt(el.currentTarget.value),
        })}
      />
      colorTop: {theme.color.colorTop}
      <input type="range" min="1" max="255"
        value={theme.color.colorTop}
        onChange={(el) => setThemeColor({
          colorTop: parseInt(el.currentTarget.value),
        })}
      />
      saturation: {theme.color.saturation}
      <input type="range" min="0" max="100"
        value={100 * theme.color.saturation}
        onChange={(el) => setThemeColor({
          saturation: parseInt(el.currentTarget.value) / 100,
        })}
      />
      brightBoost: {theme.color.brightBoost}
      <input type="range" min="0" max="100"
        value={100 * theme.color.brightBoost}
        onChange={(el) => setThemeColor({
          brightBoost: parseInt(el.currentTarget.value) / 100,
        })}
      />
      backgroundHinder: {theme.color.backgroundHinder}
      <input type="range" min="0" max="100"
        value={100 * theme.color.backgroundHinder}
        onChange={(el) => setThemeColor({
          backgroundHinder: parseInt(el.currentTarget.value) / 100,
        })}
      />
      blackBoost: {theme.color.blackBoost}
      <input type="range" min="0" max="100"
        value={100 * theme.color.blackBoost}
        onChange={(el) => setThemeColor({
          blackBoost: parseInt(el.currentTarget.value) / 100,
        })}
      />
      font: {theme.font.family}
      <select onChange={(e)=>{ setThemeFont({ family: e.target.value }); }}>
        <option value="Roboto Mono">Roboto Mono</option>
        <option value="Inconsolata">Inconsolata</option>
        <option value="Cousine">Cousine</option>
        <option value="Source Code Pro">Source Code Pro</option>
        <option value="Anonymous Pro">Anonymous Pro</option>
        <option value="Fira Code">Fira Code</option>
        <option value="IBM Plex Mono">IBM Plex Mono</option>
        <option value="Nanum Gothic Coding">Nanum Gothic Coding</option>
        <option value="Ubuntu Mono">Ubuntu Mono</option>
      </select>
      font size: {theme.font.size}px
      <input type="range" min="10" max="30"
        value={theme.font.size}
        onChange={(el) => setThemeFont({
          size: parseInt(el.currentTarget.value),
        })}
      />
      <br />
      letter spacing: {theme.font.letterSpacing}
      <input type="range" min="0" max="5"
        value={theme.font.letterSpacing}
        onChange={(el) => setThemeFont({
          letterSpacing: parseInt(el.currentTarget.value),
        })}
      />
      <br />
      line height: {theme.font.lineHeight}
      <input type="range" min="80" max="150"
        value={theme.font.lineHeight}
        onChange={(el) => setThemeFont({
          lineHeight: parseInt(el.currentTarget.value),
        })}
      />
    </div>
  );
});

export default Settings;