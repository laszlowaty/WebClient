import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '../store';

import './Console.css';

type Props = {
};

const Console = observer((props: Props) => {
  const store = useStore();
  const { console, consoleCount } = store.conn;
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const { current } = consoleRef;
  var isAtBottom = true;
  if (current) {
    isAtBottom = current.scrollHeight - current.scrollTop - current.offsetHeight < 1;
  }

  useEffect(() => {
    setTimeout(() => {
      const { current } = consoleRef;
      if (current && isAtBottom) {
        current.style.overflow = 'hidden';
        current.scrollTop = current.scrollHeight;
        setTimeout(() => {
          if (current) { current.style.overflow = 'scroll'; }
        }, 200);
      }
    }, 10);
  });
  return (
    <div
      className={`console hash${consoleCount}`}
      ref={consoleRef}
    >
      { console.map(
        (line) => line.formatted
      ) }
      {/*!isAtBottom ? (
        <div className="scrollToBottom">
          <span className="desktop"><kbd>ESC</kbd> by przewinąć na dół</span>
          <span className="mobile">
            <button onClick={() => window.console.log('test!!!')}>
              <span className="material-icons">keyboard_arrow_down</span>
            </button>
          </span>
        </div>
      ) : null*/}
    </div>
  );
});

export default Console;