import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '../store';

import './Console.css';

type Props = {
};

const scrollDown = (el: HTMLDivElement | null) => {
  console.log(el)
  if (!el) {
    return;
  }
  el.style.overflow = 'hidden';
  el.scrollTop = el.scrollHeight;
  setTimeout(() => {
    if (el) { el.style.overflow = 'scroll'; }
  }, 200);
}

const Console = observer((props: Props) => {
  const store = useStore();
  const { console, consoleCount } = store.conn;
  const consoleRef = useRef<HTMLDivElement>(null);
  
  const { current } = consoleRef;
  var isAtBottom = true;
  if (current) {
    isAtBottom = current.scrollHeight - current.scrollTop - current.offsetHeight - 20 < 1;
  }

  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      scrollDown(consoleRef.current)
    }
  }

  const handleNeedScrollEvent = (event: Event) => {
    scrollDown(consoleRef.current)
  }

  useEffect(
    () => {
      document.addEventListener('keydown', handleGlobalKeydown as EventListener, false);
      document.addEventListener('needsScroll', handleNeedScrollEvent as EventListener, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setTimeout(() => {
      const { current } = consoleRef;
      if (current && isAtBottom) {
        scrollDown(current)
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
      {!isAtBottom ? (
        <div className="scrollToBottom">
          <span className="desktop">⇩ Wciśnij <kbd>ESC</kbd> by przewinąć na dół</span>
          <span className="mobile">
            <button onClick={(e) => {
              e.preventDefault();
              scrollDown(consoleRef.current);
            }}>
              <span className="material-icons">keyboard_arrow_down</span>
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
});

export default Console;