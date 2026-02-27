import React, { useState, useRef, useEffect } from 'react';
import './play.css';

export function Play({ onHideChrome }) {
  // Defensive: blur typing area only on unmount
  useEffect(() => {
    return () => {
      if (typingAreaRef.current && document.body.contains(typingAreaRef.current)) {
        typingAreaRef.current.blur();
      }
      console.log('[Play] Unmounted');
    };
  }, []);
  // In the future, replace this array with random words
  const words = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit,',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua.',
    'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat.',
    'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur.',
    'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.'
  ];
  // Join words with spaces for the full text
  const fullText = words.join(' ');

  // Store all user input, including wrong letters
  const [typed, setTyped] = useState([]); // array of chars
  const [cursorPos, setCursorPos] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedTime, setSelectedTime] = useState(30);
  const [countdown, setCountdown] = useState(30);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const timerRef = useRef(null);
  const typingAreaRef = useRef(null);

  // Focus the typing area on mount
  useEffect(() => {
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
    return () => {
      // Remove focus from typing area on unmount to avoid trapping navigation
      if (typingAreaRef.current) {
        typingAreaRef.current.blur();
      }
    };
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (timerStarted && timerActive && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, countdown, timerActive]);

  // Handle radio input change
  const handleTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedTime(value);
    setCountdown(value);
    setTimerStarted(false);
    setTimerActive(true);
    setTyped([]);
    setCursorPos(0);
    // Refocus typing area so user can type immediately
    setTimeout(() => {
      if (typingAreaRef.current) typingAreaRef.current.focus();
    }, 0);
  };

  // Handle key presses
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Reset all state to restart the typing test without reloading
      setTyped([]);
      setCursorPos(0);
      setCorrectCount(0);
      setIncorrectCount(0);
      setCountdown(selectedTime);
      setTimerStarted(false);
      setTimerActive(true);
      // Refocus typing area
      setTimeout(() => {
        if (typingAreaRef.current) typingAreaRef.current.focus();
      }, 0);
      return;
    }
    if (!timerActive) {
      return;
    }
    if (!timerStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTimerStarted(true);
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Only allow typing if not past the end
      if (cursorPos < fullText.length) {
        setTyped((prev) => {
          const newTyped = [...prev];
          newTyped[cursorPos] = e.key;
          return newTyped;
        });
        // Update correct/incorrect counts
        if (e.key === fullText[cursorPos]) {
          setCorrectCount((c) => c + 1);
        } else {
          setIncorrectCount((c) => c + 1);
        }
        setCursorPos((pos) => pos + 1);
      }
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (cursorPos > 0) {
        setTyped((prev) => {
          const newTyped = [...prev];
          // Update correct/incorrect counts
          const prevChar = newTyped[cursorPos - 1];
          if (prevChar !== undefined) {
            if (prevChar === fullText[cursorPos - 1]) {
              setCorrectCount((c) => Math.max(0, c - 1));
            } else {
              setIncorrectCount((c) => Math.max(0, c - 1));
            }
          }
          newTyped[cursorPos - 1] = undefined;
          return newTyped;
        });
        setCursorPos((pos) => pos - 1);
      }
      e.preventDefault();
    }
  };

  // --- Pixel-perfect word wrapping ---
  const [lines, setLines] = useState([]);
  // Recalculate lines after mount, resize, or words change
  // --- DOM-based pixel-perfect word wrapping ---
  // Use a ref to persist the measurer element per Play instance
  const measurerRef = useRef(null);
  useEffect(() => {
    // Create a hidden span for accurate measurement, only once per Play instance
    if (!measurerRef.current) {
      const measurer = document.createElement('span');
      measurer.style.visibility = 'hidden';
      measurer.style.position = 'absolute';
      measurer.style.whiteSpace = 'pre';
      measurer.style.pointerEvents = 'none';
      measurer.style.zIndex = -1;
      document.body.appendChild(measurer);
      measurerRef.current = measurer;
    }
    const measurer = measurerRef.current;
    function getLinesFromWordsDOM(wordsArr, container) {
      let pxWidth = window.innerWidth;
      if (container) {
        pxWidth = container.offsetWidth - 8;
        const style = getComputedStyle(container);
        measurer.style.font = style.font;
        measurer.style.fontSize = style.fontSize;
        measurer.style.fontFamily = style.fontFamily;
        measurer.style.letterSpacing = style.letterSpacing;
        measurer.style.wordSpacing = style.wordSpacing;
        measurer.style.fontWeight = style.fontWeight;
        measurer.style.lineHeight = style.lineHeight;
        measurer.style.padding = style.padding;
      }
      const lines = [];
      let currentLine = '';
      for (let i = 0; i < wordsArr.length; i++) {
        const word = wordsArr[i];
        // If the word itself is too long, put it on its own line
        measurer.textContent = word;
        const wordWidth = measurer.offsetWidth;
        if (wordWidth > pxWidth) {
          if (currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = '';
          }
          lines.push(word);
          continue;
        }
        if (currentLine.length === 0) {
          currentLine = word;
        } else {
          measurer.textContent = currentLine + ' ' + word;
          const testWidth = measurer.offsetWidth;
          if (testWidth > pxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine += ' ' + word;
          }
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);
      return lines;
    }
    function recalcLines() {
      const newLines = getLinesFromWordsDOM(words, typingAreaRef.current);
      setLines(prevLines => {
        if (
          prevLines.length === newLines.length &&
          prevLines.every((line, i) => line === newLines[i])
        ) {
          return prevLines;
        }
        return newLines;
      });
    }
    recalcLines();
    window.addEventListener('resize', recalcLines);
    // Use ResizeObserver for container changes
    let resizeObs = null;
    if (typingAreaRef.current && window.ResizeObserver) {
      resizeObs = new window.ResizeObserver(recalcLines);
      resizeObs.observe(typingAreaRef.current);
    }
    // Use MutationObserver for font/style changes
    let mutationObs = null;
    if (typingAreaRef.current && window.MutationObserver) {
      mutationObs = new window.MutationObserver(recalcLines);
      mutationObs.observe(typingAreaRef.current, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    return () => {
      window.removeEventListener('resize', recalcLines);
      if (resizeObs) resizeObs.disconnect();
      if (mutationObs) mutationObs.disconnect();
      if (measurerRef.current && document.body.contains(measurerRef.current)) {
        measurerRef.current.remove();
        measurerRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [words]);

  // Map each character in lines to its index in fullText and precompute line start indices
  let runningIdx = 0;
  const lineStartIndices = [];
  const lineCharIndices = lines.map((line, idx) => {
    lineStartIndices.push(runningIdx);
    const arr = Array.from({ length: line.length }, (_, j) => runningIdx + j);
    runningIdx += line.length + 1; // +1 for space/newline
    return arr;
  });

  // Find which line the cursor is on using lineStartIndices
  let currentLine = 0;
  for (let i = 0; i < lineStartIndices.length; i++) {
    const start = lineStartIndices[i];
    const end = (i + 1 < lineStartIndices.length) ? lineStartIndices[i + 1] : fullText.length + 1;
    if (cursorPos >= start && cursorPos < end) {
      currentLine = i;
      break;
    }
  }

  // Show up to three lines: previous, current, next, but no duplicates
  let visibleLines = [];
  if (currentLine === 0) {
    visibleLines = [0, 1, 2].filter(idx => idx < lines.length);
  } else if (currentLine === lines.length - 1) {
    visibleLines = [lines.length - 3, lines.length - 2, lines.length - 1].filter(idx => idx >= 0);
  } else {
    visibleLines = [currentLine - 1, currentLine, currentLine + 1];
  }

  // Render a line with coloring and cursor
  function renderLine(lineIdx) {
    const line = lines[lineIdx];
    const indices = lineCharIndices[lineIdx];
    const chars = [];
    // Only apply first-remaining margin on the line with the cursor
    let firstRemaining = (currentLine === lineIdx);
    for (let j = 0; j < line.length; j++) {
      const i = indices[j];
      const expected = fullText[i];
      const userChar = typed[i];
      if (i === cursorPos) {
        chars.push(
          <span
            key={"cursor"}
            className={cursorPos === 0 ? 'cursor blink' : 'cursor'}
          >
            |
          </span>
        );
      }
      if (userChar === undefined) {
        if (firstRemaining) {
          chars.push(
            <span key={i} className="remaining-text first-remaining">{expected}</span>
          );
          firstRemaining = false;
        } else {
          chars.push(
            <span key={i} className="remaining-text">{expected}</span>
          );
        }
      } else if (userChar === expected) {
        chars.push(
          <span key={i} className="typed-text">{expected}</span>
        );
      } else {
        chars.push(
          <span key={i} className="wrong-char">{expected}</span>
        );
      }
    }
    // If cursor is at the end of this line
    if (indices[indices.length - 1] + 1 === cursorPos) {
      chars.push(
        <span
          key={"cursor-end"}
          className={cursorPos === 0 ? 'cursor blink' : 'cursor'}
        >
          |
        </span>
      );
    }
    return <div className="typing-line" key={lineIdx}>{chars}</div>;
  }

  // Hide everything except typing area when timer is running
  const hideAll = timerStarted && timerActive;
  // Notify parent (App) to hide chrome
  useEffect(() => {
    const hide = timerStarted && timerActive;
    window.dispatchEvent(new CustomEvent('play-hide-chrome', { detail: { hideChrome: hide } }));
    if (onHideChrome) onHideChrome(hide);
    // Only run when hideAll changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideAll]);
  return (
    <main>
      {!hideAll && (
        <>
          <div className="container-fluid">
            <div className="players">
              Player:
              <span className="player-name"> UsernameOfPlayer</span>
              <ul className="notification">
                <li className="player-messages">Tim got a new personal best: 100WPM - 97%</li>
                <li className="player-messages">Ada scored in the global leaderboard: 120WPM - 98%</li>
                <li className="player-messages">James added you as a friend</li>
              </ul>
            </div>
            <div className="time-buttons">
              <input type="radio" id="15 sec" name="toggle" value="15" checked={selectedTime === 15} onChange={handleTimeChange} />
              <label htmlFor="15 sec">15s</label>

              <input type="radio" id="30 sec" name="toggle" value="30" checked={selectedTime === 30} onChange={handleTimeChange} />
              <label htmlFor="30 sec">30s</label>

              <input type="radio" id="60 sec" name="toggle" value="60" checked={selectedTime === 60} onChange={handleTimeChange} />
              <label htmlFor="60 sec">60s</label>
            </div>
          </div>
        </>
      )}

      <div className="container-fluid">
        <p className="countdown">{countdown}</p>
        <div
          className="typing-text"
          tabIndex={0}
          ref={typingAreaRef}
          onKeyDown={handleKeyDown}
          style={{ outline: 'none', cursor: 'none' }}
        >
          {visibleLines.map(renderLine)}
        </div>
      </div>

      {!hideAll && (
        <>
          <div>
            <p className="restart">Press Tab to restart</p>
          </div>

          <div className="results-row">
            <p className="results">Words per minute: ___</p>
            <p className="results">Accuracy: ___%</p>
          </div>
        </>
      )}
    </main>
  );
}