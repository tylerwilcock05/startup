import React, { useState, useRef, useEffect } from 'react';
import './play.css';

export function Play() {
  const fullText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  const [typed, setTyped] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const typingAreaRef = useRef(null);

  // Focus the typing area on mount
  useEffect(() => {
    if (typingAreaRef.current) {
      typingAreaRef.current.focus();
    }
  }, []);

  // Handle key presses
  const handleKeyDown = (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Only allow typing if not past the end
      if (cursorPos < fullText.length && e.key === fullText[cursorPos]) {
        setTyped((prev) => prev + e.key);
        setCursorPos((pos) => pos + 1);
      }
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (cursorPos > 0) {
        setTyped((prev) => prev.slice(0, -1));
        setCursorPos((pos) => pos - 1);
      }
      e.preventDefault();
    }
  };

  // Render the text with a cursor
  const renderTypingText = () => {
    return (
      <span>
        <span className="typed-text">{fullText.slice(0, cursorPos)}</span>
        <span className="cursor">|</span>
        <span className="remaining-text">{fullText.slice(cursorPos)}</span>
      </span>
    );
  };

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
          <input type="radio" id="15 sec" name="toggle" defaultChecked />
          <label htmlFor="15 sec">15s</label>

          <input type="radio" id="30 sec" name="toggle" />
          <label htmlFor="30 sec">30s</label>

          <input type="radio" id="60 sec" name="toggle" />
          <label htmlFor="60 sec">60s</label>
        </div>
      </div>

      <div className="container-fluid">
        <p className="countdown">30</p>
        <h1
          className="typing-text"
          tabIndex={0}
          ref={typingAreaRef}
          onKeyDown={handleKeyDown}
          style={{ outline: 'none', cursor: 'none' }}
        >
          {renderTypingText()}
        </h1>
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