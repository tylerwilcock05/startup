import React, { useState, useRef, useEffect } from 'react';
import './play.css';

export function Play() {
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
    if (!timerActive) {
      e.preventDefault();
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
        setCursorPos((pos) => pos + 1);
      }
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (cursorPos > 0) {
        setTyped((prev) => {
          const newTyped = [...prev];
          newTyped[cursorPos - 1] = undefined;
          return newTyped;
        });
        setCursorPos((pos) => pos - 1);
      }
      e.preventDefault();
    }
  };

  // Split words into lines without breaking words, up to a max line length
  const maxLineLength = 70; // adjust for your font/width
  function getLinesFromWords(wordsArr, maxLen) {
    const lines = [];
    let currentLine = '';
    for (let i = 0; i < wordsArr.length; i++) {
      const word = wordsArr[i];
      // +1 for space if not first word in line
      const addLen = currentLine.length === 0 ? word.length : word.length + 1;
      if (currentLine.length + addLen > maxLen) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += (currentLine.length === 0 ? '' : ' ') + word;
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);
    return lines;
  }
  const lines = getLinesFromWords(words, maxLineLength);

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

  return (
    <main>
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

      <div>
        <p className="restart">Press Tab to restart</p>
      </div>

      <div className="results-row">
        <p className="results">Words per minute: ___</p>
        <p className="results">Accuracy: ___%</p>
      </div>

    </main>
  );
}