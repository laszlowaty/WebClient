import React, { useState, useEffect } from 'react';

import { testCommandTree } from '../common/commands';

import Command from './Command';
import Console from './Console';

import { useStore } from '../store';
import { observer } from 'mobx-react';

import './App.css';

const App = observer(() => {
  const store = useStore();
  const { loadedFonts, theme } = store.app;
  const { family } = theme.font;
  const isCurrentFontLoaded = loadedFonts.includes(family + ':400') && loadedFonts.includes(family + ':700');

  return (
    <>
      {!isCurrentFontLoaded ? (
        <div className="loadingCover">
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        </div>
      ) : null}
      <div className="app">
        <div className="topSide">
          <div className="leftAndRightSide">
            <div className="leftSide">
              <Console />
            </div>
            <div className="rightSide">
              colorBase: {store.app.theme.color.colorBase}
              <input type="range" min="0" max="255"
                value={store.app.theme.color.colorBase}
                onChange={(el) => store.app.setThemeColor({
                  colorBase: parseInt(el.currentTarget.value),
                })}
              />
              colorTop: {store.app.theme.color.colorTop}
              <input type="range" min="1" max="255"
                value={store.app.theme.color.colorTop}
                onChange={(el) => store.app.setThemeColor({
                  colorTop: parseInt(el.currentTarget.value),
                })}
              />
              saturation: {store.app.theme.color.saturation}
              <input type="range" min="0" max="100"
                value={100 * store.app.theme.color.saturation}
                onChange={(el) => store.app.setThemeColor({
                  saturation: parseInt(el.currentTarget.value) / 100,
                })}
              />
              brightBoost: {store.app.theme.color.brightBoost}
              <input type="range" min="0" max="100"
                value={100 * store.app.theme.color.brightBoost}
                onChange={(el) => store.app.setThemeColor({
                  brightBoost: parseInt(el.currentTarget.value) / 100,
                })}
              />
              backgroundHinder: {store.app.theme.color.backgroundHinder}
              <input type="range" min="0" max="100"
                value={100 * store.app.theme.color.backgroundHinder}
                onChange={(el) => store.app.setThemeColor({
                  backgroundHinder: parseInt(el.currentTarget.value) / 100,
                })}
              />
              blackBoost: {store.app.theme.color.blackBoost}
              <input type="range" min="0" max="100"
                value={100 * store.app.theme.color.blackBoost}
                onChange={(el) => store.app.setThemeColor({
                  blackBoost: parseInt(el.currentTarget.value) / 100,
                })}
              />
              font: {store.app.theme.font.family}
              <select onChange={(e)=>{ store.app.setThemeFont({ family: e.target.value }); }}>
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
              font size: {store.app.theme.font.size}px
              <input type="range" min="10" max="30"
                value={store.app.theme.font.size}
                onChange={(el) => store.app.setThemeFont({
                  size: parseInt(el.currentTarget.value),
                })}
              />
              <br />
              letter spacing: {store.app.theme.font.letterSpacing}
              <input type="range" min="0" max="5"
                value={store.app.theme.font.letterSpacing}
                onChange={(el) => store.app.setThemeFont({
                  letterSpacing: parseInt(el.currentTarget.value),
                })}
              />
              <br />
              line height: {store.app.theme.font.lineHeight}
              <input type="range" min="80" max="150"
                value={store.app.theme.font.lineHeight}
                onChange={(el) => store.app.setThemeFont({
                  lineHeight: parseInt(el.currentTarget.value),
                })}
              />
            </div>
          </div>
        </div>
        <div className="bottomSide">
          <div className="leftAndRightSide">
            <div className="leftSide">
              <Command onCommand={(cmd) => { store.conn.sendCmd(cmd) }} commandTree={testCommandTree} />
            </div>
            <div className="rightSide">
              <div className="settingsBtn">
                <button onClick={() => {}} tabIndex={1}>
                  <span className="material-icons">settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default App;
