import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '../store';

import './Console.css';

type Props = {
};

const Console = observer((props: Props) => {
  const store = useStore();
  const { console: consoleObj, consoleCount } = store.conn;
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  
  const scrollDown = useCallback((el: HTMLDivElement | null) => {
    if (!el || !el.parentElement) {
      return;
    }
    el.parentElement.scrollTo(0, el.scrollHeight);
    setIsAtBottom(true);
  }, []);
  
  const checkIsAtBottom = (current: HTMLDivElement): boolean => {
    if (current.parentElement) {
      return current.scrollHeight <= current.clientHeight
          || current.scrollHeight - current.clientHeight - current.parentElement.scrollTop < 1
    }
    return true;
  }

  const handleGlobalKeydown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      scrollDown(consoleRef.current);
    }
  }, [scrollDown]);

  const handleNeedScrollEvent = useCallback((event: Event) => {
    scrollDown(consoleRef.current)
  }, [scrollDown]);

  useEffect(
    () => {
      document.addEventListener('keydown', handleGlobalKeydown as EventListener, false);
      document.addEventListener('needsScroll', handleNeedScrollEvent as EventListener, false);
    },
    [handleGlobalKeydown, handleNeedScrollEvent]
  );

  const { current } = consoleRef;
  if (current) {
    const isAtBottomNow = checkIsAtBottom(current);
    if (isAtBottom !== isAtBottomNow) {
      setIsAtBottom(isAtBottomNow);
    }
  }

  // scroll down after receiving lines
  useEffect(() => {
    const { current } = consoleRef;
    if (current && isAtBottom) {
      scrollDown(current);
    }
  }, [scrollDown, isAtBottom, consoleCount]);

  return (
    <div
      className={`console hash${consoleCount}`}
      ref={consoleRef}
    >
      { consoleObj.map(
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