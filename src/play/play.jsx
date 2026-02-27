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
  // Track all errors ever made (not decremented on backspace)
  const [totalIncorrect, setTotalIncorrect] = useState(0);
  const [selectedTime, setSelectedTime] = useState(30);
  const [countdown, setCountdown] = useState(30);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  // Results
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
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
    } else if (timerStarted && countdown === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, countdown]);

  // Calculate WPM and accuracy only once when timer ends
  useEffect(() => {
    if (!timerActive && timerStarted && countdown === 0) {
      const totalCorrect = correctCount;
      let minutes = 1;
      if (selectedTime === 15) minutes = 0.25;
      else if (selectedTime === 30) minutes = 0.5;
      else if (selectedTime === 60) minutes = 1;
      const wpmCalc = totalCorrect > 0 ? ((totalCorrect / 5) / minutes) : 0;
      // Use totalIncorrect for all-time errors
      const denominator = totalCorrect + totalIncorrect;
      const accuracyCalc = denominator > 0 ? (totalCorrect / denominator) * 100 : 0;
      setWpm(Math.round(wpmCalc));
      setAccuracy(Math.round(accuracyCalc));
    }
  }, [timerActive, timerStarted, countdown, correctCount, totalIncorrect, selectedTime]);

  // Handle radio input change
  const handleTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedTime(value);
    setCountdown(value);
    setTimerStarted(false);
    setTimerActive(true);
    setTyped([]);
    setCursorPos(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTotalIncorrect(0);
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
      setTotalIncorrect(0);
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
          setTotalIncorrect((c) => c + 1);
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
              // Do NOT decrement totalIncorrect
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
  // Show results if timer is done, results are available, and not yet reset
  const [showResults, setShowResults] = React.useState(false);
  useEffect(() => {
    if (!timerActive && timerStarted && wpm !== null && accuracy !== null) {
      setShowResults(true);
    }
  }, [timerActive, timerStarted, wpm, accuracy]);

  // When Tab is pressed to restart, reset all state and hide results
  const handleRestart = () => {
    setShowResults(false);
    setTyped([]);
    setCursorPos(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTotalIncorrect(0);
    setCountdown(selectedTime);
    setTimerStarted(false);
    setTimerActive(true);
    setWpm(null);
    setAccuracy(null);
    // Refocus typing area after a short delay to ensure UI is reset
    setTimeout(() => {
      if (typingAreaRef.current) typingAreaRef.current.focus();
    }, 50);
  };

  // Use a single handleKeyDown for all logic, always resetting showResults and all state on Tab
  const handleKeyDownUnified = (e) => {
    if (e.key === 'Tab') {
      console.log('[DEBUG] Tab pressed. showResults:', showResults, 'timerActive:', timerActive, 'timerStarted:', timerStarted, 'countdown:', countdown);
      e.preventDefault();
      setShowResults(false);
      setTyped([]);
      setCursorPos(0);
      setCorrectCount(0);
      setIncorrectCount(0);
      setTotalIncorrect(0);
      setCountdown(selectedTime);
      setTimerStarted(false);
      setTimerActive(true);
      setWpm(null);
      setAccuracy(null);
      setTimeout(() => {
        if (typingAreaRef.current) typingAreaRef.current.focus();
        console.log('[DEBUG] State after reset:', {
          showResults,
          typed: [],
          cursorPos: 0,
          correctCount: 0,
          incorrectCount: 0,
          totalIncorrect: 0,
          countdown: selectedTime,
          timerStarted: false,
          timerActive: true,
          wpm: null,
          accuracy: null
        });
      }, 50);
      return;
    }
    if (!timerActive) {
      console.log('[DEBUG] Key ignored because timer is not active.');
      return;
    }
    if (!timerStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTimerStarted(true);
      console.log('[DEBUG] Timer started.');
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (cursorPos < fullText.length) {
        setTyped((prev) => {
          const newTyped = [...prev];
          newTyped[cursorPos] = e.key;
          return newTyped;
        });
        if (e.key === fullText[cursorPos]) {
          setCorrectCount((c) => c + 1);
        } else {
          setIncorrectCount((c) => c + 1);
          setTotalIncorrect((c) => c + 1);
        }
        setCursorPos((pos) => pos + 1);
        console.log('[DEBUG] Typed:', e.key, 'cursorPos:', cursorPos + 1);
      }
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (cursorPos > 0) {
        setTyped((prev) => {
          const newTyped = [...prev];
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
        console.log('[DEBUG] Backspace. cursorPos:', cursorPos - 1);
      }
      e.preventDefault();
    }
  };

  // Attach document-level keydown for Tab when results are showing
  useEffect(() => {
    if (!showResults) return;
    const docTabHandler = (e) => {
      if (e.key === 'Tab') {
        console.log('[DEBUG] (doc) Tab pressed while results showing.');
        handleKeyDownUnified(e);
      }
    };
    const forceResetHandler = () => {
      if (showResults) {
        console.log('[DEBUG] play-force-reset event received.');
        handleKeyDownUnified({ key: 'Tab', preventDefault: () => {} });
      }
    };
    document.addEventListener('keydown', docTabHandler);
    window.addEventListener('play-force-reset', forceResetHandler);
    return () => {
      document.removeEventListener('keydown', docTabHandler);
      window.removeEventListener('play-force-reset', forceResetHandler);
    };
  }, [showResults]);

  return (
    <main>
      {/* Show chrome only if not typing and not showing results */}
      {!hideAll && !showResults && (
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
        {/* Hide countdown when results are displayed */}
        {!showResults && <p className="countdown">{countdown}</p>}
        {/* Typing text only visible while timer is running and not showing results */}
        {timerActive && !showResults ? (
          <div
            className="typing-text"
            tabIndex={0}
            ref={typingAreaRef}
            onKeyDown={handleKeyDownUnified}
            style={{ outline: 'none', cursor: 'none' }}
          >
            {visibleLines.map(renderLine)}
          </div>
        ) : null}
      </div>

      {/* Show results centered only after timer ends and before Tab is pressed */}
      {showResults && (
        <div className="results-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
          <p className="results" style={{ fontSize: '2em', margin: '0em 0 0 0', color: '#888' }}>
            Words per minute: <span style={{ color: 'rgb(118, 190, 210)' }}>{wpm}</span>
          </p>
          <p className="results" style={{ fontSize: '2em', margin: '-1em 0 0 0', color: '#888' }}>
            Accuracy: <span style={{ color: 'rgb(118, 190, 210)' }}>{accuracy}%</span>
          </p>
          <p className="restart" style={{ textAlign: 'center', fontSize: '1.2em', marginTop: '2em' }}>Press Tab to restart</p>
        </div>
      )}

      {/* Show restart text always when not typing or when results are shown */}
      {!hideAll && !showResults && (
        <div>
          <p className="restart">Press Tab to restart</p>
        </div>
      )}
    </main>
  );
}