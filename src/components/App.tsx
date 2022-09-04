import React from 'react';

import { testCommandTree } from '../common/commands';

import Command from './Command';
import Console from './Console';

import { useStore } from '../store';
import { observer } from 'mobx-react';

import './App.css';
import Settings from './common/Settings';

const App = observer(() => {
  const store = useStore();
  //const { loadedFonts, theme } = store.app;
  //const { family } = theme.font;

  // TODO sprawdzic czemu to nie dziala
  const isCurrentFontLoaded = true
  //const isCurrentFontLoaded = loadedFonts.includes(family + ':400') && loadedFonts.includes(family + ':700');

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
              { /* <MudMap /> */ }
              <Settings />
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
                <button onClick={store.app.toogleSettings} tabIndex={1}>
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
