import React, { useEffect, useState, useRef } from 'react';
import select from 'selection-range';

import './Command.css';

import { TCommandTree } from '../common/commands';
import { useStore } from '../store';
import { observer } from 'mobx-react';

type Props = {
  commandTree: TCommandTree,
  onCommand: (cmd: string) => void,
};

const Command = observer((props: Props) => {

  // command line input variables
  const cmdRef = useRef<HTMLDivElement|null>(null);
  const cmdRefNormal = useRef<HTMLDivElement|null>(null);
  const cmdRefMasked = useRef<HTMLInputElement|null>(null);
  const cursorPos = useRef<number>(0);
  const currentlyEntering = useRef(''); // only used to pass previously entered text to password input when switching to maskedEcho mode

  // commands history variables
  const cmdHistory = useRef<Array<string>>([]);
  const cmdHistoryPointer = useRef<number|null>(null);
  const cmdValueBeforeArrowsWerePressed = useRef<string|null>(null);
  
  // store variables
  const store = useStore();
  const { maskEcho } = store.conn;

  const resetCmdLine = () => {
    if (cmdRef.current) {
      cmdRef.current.innerHTML = '\u2063';
      cursorPos.current = 0;
    }
  }

  const focusToCmdLine = () => {
    if (cmdRef.current) {
      if (cmdRef.current.innerText === '') {
        resetCmdLine()
      }
      cmdRef.current.focus();
      select(cmdRef.current, {start: cursorPos.current});
    }
  }

  const selectAllCmdLine = () => {
    const selection = document.getSelection();
    if (selection && cmdRef.current) {
      selection.selectAllChildren(cmdRef.current);
      currentlyEntering.current = '';
    }    
  }

  const moveCursorToEnd = () => {
    if (cmdRef.current) {
      select(cmdRef.current, {start: cmdRef.current.innerHTML.length});
      cursorPos.current = cmdRef.current.innerHTML.length;
    }
  }

  const updateCursorPos = () => {
    setTimeout(() => {
      if (cmdRef.current) {
        const pos = select(cmdRef.current);
        if (pos) {
          cursorPos.current = pos.end || pos.start;
        }
      }
    },0);
  }

  const checkCmdLineForEmptyIssue = () => {
    // cleaning any remains of HTML tag if the cmd line text is empty
    if (cmdRef.current && cmdRef.current.innerText === '') {
      resetCmdLine();
    }
  }

  const cleanUpCmd = (cmd: string): string => {
    return cmd.replace('\u2063', '').replace(/\n\r/g, ' ');
  }

  // key pressed anywhere in the app should be redirected to command line
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    const isCtrlPressed = (event: KeyboardEvent) => {
      return ['Control', 'Meta'].includes(event.key) || event.ctrlKey || event.metaKey;
    }
    if(!isCtrlPressed(event) && cmdRef.current && event.currentTarget) {
      const srcElement = event.srcElement as HTMLElement;
      if (srcElement.id !== cmdRef.current.id) {
        const newEvent = new KeyboardEvent('keydown', { key: event.key });
        focusToCmdLine();
        cmdRef.current.dispatchEvent(newEvent);
      }
    }
  }

  // only run once on component mount
  useEffect(
    () => { 
      cmdRef.current = cmdRefNormal.current;
      document.addEventListener('keydown', handleGlobalKeydown as EventListener, false);
      window.onfocus = focusToCmdLine;
      resetCmdLine();
      focusToCmdLine();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
 
  // when maskEcho changes, focus the newly created input field
  useEffect(
    () => {
      setTimeout(() => {
        cmdRef.current = maskEcho ? cmdRefMasked.current : cmdRefNormal.current;
        if (maskEcho && cmdRefMasked.current) {
          cmdRefMasked.current.value = currentlyEntering.current;
          cmdRefMasked.current.focus();
        }
        if (!maskEcho && cmdRefNormal.current) {
          resetCmdLine();
          focusToCmdLine();
        }
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maskEcho]
  )

  const handleMaskedInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // handling Enter key
    if (event.key === 'Enter') {
      // send out command
      props.onCommand(cleanUpCmd(event.currentTarget.value).trim());
      // cancel the event
      event.preventDefault();
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!cmdRef.current) { return; }

    // handling Enter key
    if (event.key === 'Enter') {
      const cleanCmd = cleanUpCmd(event.currentTarget.innerText).trim();
      // send out command
      props.onCommand(cleanCmd);
      // cancel the event
      event.preventDefault();
      // select everything in the field
      selectAllCmdLine();
      // add to history, only if unique to last entered
      if (!cmdHistory.current.length || cmdHistory.current[cmdHistory.current.length - 1] !== cleanCmd) {
        cmdHistory.current.push(cleanCmd);
        cmdHistoryPointer.current = null;
      }
    }

    // handling history
    if (event.key === 'ArrowUp') {
      if (cmdHistory.current.length) {
        let historyIndex = cmdHistoryPointer.current !== null ? --cmdHistoryPointer.current : cmdHistory.current.length - 1;
        historyIndex = historyIndex < 0 ? 0 : historyIndex;
        if (cmdHistoryPointer.current === null && cmdHistory.current[historyIndex] === cmdRef.current.innerText) {
          historyIndex = historyIndex - 1 < 0 ? 0 : --historyIndex;
        }
        cmdRef.current.innerText = cmdHistory.current[historyIndex];
        cmdHistoryPointer.current = historyIndex;
        setTimeout(() => moveCursorToEnd(), 0);
        cmdValueBeforeArrowsWerePressed.current = cmdRef.current.innerText;
      }
    }
    if (event.key === 'ArrowDown') {
      if (cmdHistory.current.length && cmdHistoryPointer.current !== null) {
        let historyIndex = cmdHistoryPointer.current;
        historyIndex =  historyIndex < cmdHistory.current.length - 1 ? ++historyIndex : cmdHistory.current.length - 1;
        cmdHistoryPointer.current = historyIndex;
        cmdRef.current.innerText = cmdHistory.current[historyIndex];
        setTimeout(() => moveCursorToEnd(), 0);
        cmdValueBeforeArrowsWerePressed.current = cmdRef.current.innerText;
      }
    }

    event.stopPropagation();
    updateCursorPos();
    setTimeout(checkCmdLineForEmptyIssue, 100);
  };

  const handleInput = (event: React.SyntheticEvent<HTMLDivElement>) => {
    setTimeout(() => {
      if (!cmdRef.current) { return; }
      checkCmdLineForEmptyIssue();

      // parsing entered text into HTML tags
      let inputLine = cleanUpCmd(cmdRef.current.innerText);
      let outputLine = '<span>' + inputLine + '<span>';

      // updating the input field
      const pos = select(cmdRef.current);
      cmdRef.current.innerHTML = outputLine;
      select(cmdRef.current, pos);
      updateCursorPos();

      // updating some flow variables
      currentlyEntering.current = cmdRef.current.innerText;
      if (cmdRef.current.innerText !== cmdValueBeforeArrowsWerePressed.current) {
        cmdHistoryPointer.current = null;
      }
    }, 0);
  };

  return (
    <>
      { maskEcho
        ? (
          <input
            className="command"
            id="commandLine"
            ref={cmdRefMasked}
            tabIndex={0}
            onKeyDown={handleMaskedInputKeyDown}
            type="password"
          />
        )
        : (
          <div
            className="command"
            id="commandLine"
            ref={cmdRefNormal}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={updateCursorPos}
            onInput={handleInput}
            contentEditable
          />
          )
      }
    </>
  )
});

export default Command;