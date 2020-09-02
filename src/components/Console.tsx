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
  useEffect(() => {
    setTimeout(() => {
      const { current } = consoleRef;
      if (current) {
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
    </div>
  );
});

export default Console;