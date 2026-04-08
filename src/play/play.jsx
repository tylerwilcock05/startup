import React, { useState, useRef, useEffect } from 'react';
import './play.css';
import { GameNotifier, GameEvent } from './gameNotifier';

export function Play({ onHideChrome }) {
  // All state declarations first
  const [username, setUsername] = useState('');
  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [wordsError, setWordsError] = useState('');
  const fullText = words.join(' ');
  const isWordsReady = words.length > 0;
  const [typed, setTyped] = useState([]); // array of chars
  const [cursorPos, setCursorPos] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);
  const [selectedTime, setSelectedTime] = useState(30);
  const [countdown, setCountdown] = useState(30);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const timerRef = useRef(null);
  const typingAreaRef = useRef(null);
  const statsSavedRef = useRef(false);
  const [lines, setLines] = useState([]);
  const [showResults, setShowResults] = useState(false);
  // Player messages from WebSocket and GameNotifier
  const [playerMessages, setPlayerMessages] = useState([]);
  // Prevent page scrollbars while on the Play screen
  useEffect(() => {
    document.body.classList.add('play-no-scroll');
    document.documentElement.classList.add('play-no-scroll');
    return () => {
      document.body.classList.remove('play-no-scroll');
      document.documentElement.classList.remove('play-no-scroll');
    };
  }, []);
  // Listen for GameNotifier events (WebSocket notifications)
  useEffect(() => {
    if (!username) return;
    function handler(event) {
      // Only show relevant notifications for this user
      if (
        (event.type === GameEvent.FriendAdded && event.value.to === username) ||
        (event.type === GameEvent.FriendStartedTest && event.value.to === username) ||
        (event.type === GameEvent.FriendFinishedTest && event.value.to === username) ||
        event.type === GameEvent.LeaderboardScore
      ) {
        setPlayerMessages((prev) => {
          const msgs = [...prev, event.value.msg];
          return msgs.length > 3 ? msgs.slice(-3) : msgs;
        });
      }
    }
    GameNotifier.addHandler(handler);
    return () => {
      GameNotifier.removeHandler(handler);
    };
  }, [username]);

  useEffect(() => {
    let cancelled = false;
    setWordsLoading(true);
    setWordsError('');

    const count = 300;
    const poolSize = Math.min(Math.max(count * 4, 400), 1200);
    const distinctLetters = 20;
    const letterWeights = [
      ['e', 12.7], ['t', 9.1], ['a', 8.2], ['o', 7.5], ['i', 7.0], ['n', 6.7],
      ['s', 6.3], ['h', 6.1], ['r', 6.0], ['d', 4.3], ['l', 4.0], ['c', 2.8],
      ['u', 2.8], ['m', 2.4], ['w', 2.4], ['f', 2.2], ['g', 2.0], ['y', 2.0],
      ['p', 1.9], ['b', 1.5], ['v', 1.0], ['k', 0.8], ['j', 0.2], ['x', 0.2],
      ['q', 0.1], ['z', 0.1],
    ];

    const pickWeightedLetter = () => {
      const total = letterWeights.reduce((sum, [, w]) => sum + w, 0);
      let r = Math.random() * total;
      for (const [letter, weight] of letterWeights) {
        r -= weight;
        if (r <= 0) return letter;
      }
      return 'e';
    };

    const fetchDatamuse = async (pattern) => {
      const url = new URL('https://api.datamuse.com/words');
      url.searchParams.set('sp', pattern);
      url.searchParams.set('max', String(poolSize));
      url.searchParams.set('md', 'f');
      url.searchParams.set('ts', String(Date.now()));
      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Word load failed (${response.status})`);
      }
      const body = await response.json().catch(() => []);
      return Array.isArray(body) ? body : [];
    };

    const load = async () => {
      try {
        const letters = new Set();
        while (letters.size < distinctLetters) {
          letters.add(pickWeightedLetter());
        }
        const results = await Promise.allSettled(
          Array.from(letters).map((l) => fetchDatamuse(`${l}*`))
        );
        let combined = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value || []);

        if (combined.length === 0) {
          combined = await fetchDatamuse('*');
        }
        if (combined.length === 0) {
          throw new Error('No words returned');
        }

        let candidates = combined
          .map((item) => {
            const word = String(item?.word || '').trim();
            const score = Number.isFinite(item?.score) ? item.score : 0;
            const tags = Array.isArray(item?.tags) ? item.tags : [];
            const freqTag = tags.find((tag) => typeof tag === 'string' && tag.startsWith('f:'));
            const freq = freqTag ? Number(freqTag.slice(2)) : 0;
            return { word, score, freq };
          })
          .filter((item) => item.word && /^[A-Za-z]+$/.test(item.word))
          .filter((item) => item.word.length >= 2 && item.word.length <= 8);

        const withFreq = candidates.filter((item) => item.freq > 0);
        const minFreq = 200;
        let commonPool = [];

        if (withFreq.length > 0) {
          withFreq.sort((a, b) => (b.freq - a.freq) || (b.score - a.score));
          const maxFreq = withFreq[0]?.freq || 0;
          const effectiveMinFreq = Math.min(minFreq, maxFreq);
          commonPool = withFreq.filter((item) => item.freq >= effectiveMinFreq);
          if (commonPool.length === 0) {
            commonPool = withFreq.slice(0, Math.min(withFreq.length, Math.max(count * 3, 400)));
          }
        } else {
          const ranked = [...candidates].sort((a, b) => b.score - a.score);
          commonPool = ranked.slice(0, Math.min(ranked.length, Math.max(count * 3, 400)));
        }

        const commonPoolSize = Math.min(commonPool.length, Math.max(count * 3, 400));
        let pool = commonPool.slice(0, commonPoolSize);

        for (let i = pool.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        if (pool.length < count && pool.length > 0) {
          const extended = [...pool];
          while (extended.length < count) {
            extended.push(pool[Math.floor(Math.random() * pool.length)]);
          }
          pool = extended;
        }

        const list = pool.slice(0, count).map((item) => item.word);
        if (!cancelled) {
          setWords(list);
        }
      } catch {
        if (!cancelled) {
          setWordsError('Unable to load words right now.');
        }
      } finally {
        if (!cancelled) {
          setWordsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { method: 'get', credentials: 'include' })
      .then(async (response) => {
        if (response?.status !== 200) return;
        const body = await response.json().catch(() => ({}));
        if (!cancelled && body?.email) {
          setUsername(body.email);
        }
      })
      .catch(() => {
        // Not logged in or offline
      });
    return () => {
      cancelled = true;
    };
  }, []);




  // Defensive: blur typing area only on unmount
  useEffect(() => {
    return () => {
      if (typingAreaRef.current && document.body.contains(typingAreaRef.current)) {
        typingAreaRef.current.blur();
      }
      console.log('[Play] Unmounted');
    };
  }, []);
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
      const wpmVal = Math.round(wpmCalc);
      const accuracyVal = Math.round(accuracyCalc);
      setWpm(wpmVal);
      setAccuracy(accuracyVal);

      if (!statsSavedRef.current) {
        statsSavedRef.current = true;
        // Always use the current user's email as username
        const payload = {
          wpm: wpmVal,
          accuracy: accuracyVal,
          duration: selectedTime,
          date: new Date().toISOString(),
          username: username,
        };
        // Submit to leaderboard as well
        console.log('[Leaderboard Notification] Submitting score payload:', payload);
        fetch('/api/score', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        .then(async (res) => {
          if (!res.ok) {
            console.log('[Leaderboard Notification] /api/score POST failed:', res.status);
            return;
          }
          // Retry up to 3 times to fetch leaderboard with new score
          let found = false;
          let placement = null;
          let bestIdx = null;
          let bestDate = null;
          for (let attempt = 0; attempt < 3 && !found; ++attempt) {
            if (attempt > 0) await new Promise(r => setTimeout(r, 150 * attempt));
            const scoresRes = await fetch('/api/scores', { method: 'get', credentials: 'include' });
            if (!scoresRes.ok) {
              console.log(`[Leaderboard Notification] /api/scores fetch failed (attempt ${attempt + 1}):`, scoresRes.status);
              continue;
            }
            const scores = await scoresRes.json().catch(() => []);
            console.log(`[Leaderboard Notification] /api/scores result (attempt ${attempt + 1}):`, scores);
            if (Array.isArray(scores)) {
              for (let i = 0; i < scores.length; ++i) {
                const s = scores[i];
                // Robust matching: trim and lowercase username, match numbers, duration
                if (
                  typeof s.username === 'string' &&
                  s.username.trim().toLowerCase() === String(username).trim().toLowerCase() &&
                  Number(s.duration) === Number(selectedTime) &&
                  Number(s.wpm) === Number(wpmVal) &&
                  Number(s.accuracy) === Number(accuracyVal)
                ) {
                  // Pick the score with the oldest date (for leaderboard tie-breaking)
                  const sDate = new Date(s.date).getTime();
                  if (bestDate === null || sDate < bestDate) {
                    bestDate = sDate;
                    bestIdx = i;
                  }
                }
              }
              if (bestIdx !== null) {
                placement = bestIdx + 1;
                found = true;
              }
            }
          }
          if (placement !== null && placement <= 10) {
            // Fix off-by-one: add 1 to placement for notification
            function ordinal(n) {
              if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
              switch (n % 10) {
                case 1: return n + 'st';
                case 2: return n + 'nd';
                case 3: return n + 'rd';
                default: return n + 'th';
              }
            }
            if (placement !== 1) {
              const rank = ordinal(placement - 1);
            }
            console.log('[Leaderboard Notification] Sending notification:', { username, rank, wpmVal, selectedTime, placement });
            GameNotifier.notifyLeaderboardScore(username, rank, wpmVal, selectedTime);
          } else {
            // Debug log if notification is skipped
            console.log('[Leaderboard Notification] No matching score found for notification:', {
              username, wpmVal, accuracyVal, selectedTime, placement
            });
          }
        })
        .catch((err) => {
          // Ignore leaderboard save errors
          console.log('[Leaderboard Notification] Error in leaderboard notification logic:', err);
        });
        // Still submit to stats for user history
        fetch('/api/stats', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {
          // Ignore stats save errors
        });

        // --- Notify all friends that you finished a test ---
        // Fetch friends list and send notification to each
        fetch('/api/friends', { method: 'get', credentials: 'include' })
          .then(async (res) => {
            if (!res.ok) return;
            const body = await res.json().catch(() => ({}));
            const friends = Array.isArray(body?.friends) ? body.friends : [];
            friends.forEach((friend) => {
              if (username && friend) {
                GameNotifier.notifyFriendFinishedTest(username, friend, wpmVal, selectedTime);
              }
            });
          });
      }
    }
  }, [timerActive, timerStarted, countdown, correctCount, totalIncorrect, selectedTime, username]);

  // Handle radio input change
  const handleTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedTime(value);
    setCountdown(value);
    setTimerStarted(false);
    setTimerActive(true);
    statsSavedRef.current = false;
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
      measurer.style.left = '-10000px';
      measurer.style.top = '0';
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
    statsSavedRef.current = false;
    // Refocus typing area after a short delay to ensure UI is reset
    setTimeout(() => {
      if (typingAreaRef.current) typingAreaRef.current.focus();
    }, 50);
  };

  // Unified keydown handler: handles typing, Tab reset, cursor movement, and notification triggers
  const handleKeyDownUnified = (e) => {
    if (!isWordsReady) {
      return;
    }
    // Tab resets the test
    if (e.key === 'Tab') {
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
      statsSavedRef.current = false;
      setTimeout(() => {
        if (typingAreaRef.current) typingAreaRef.current.focus();
      }, 50);
      return;
    }
    // If timer is not active, ignore typing
    if (!timerActive) {
      return;
    }
    // Start timer on first valid key
    if (!timerStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTimerStarted(true);
      // --- Notify all friends that you started a test ---
      fetch('/api/friends', { method: 'get', credentials: 'include' })
        .then(async (res) => {
          if (!res.ok) return;
          const body = await res.json().catch(() => ({}));
          const friends = Array.isArray(body?.friends) ? body.friends : [];
          friends.forEach((friend) => {
            if (username && friend) {
              GameNotifier.notifyFriendStartedTest(username, friend, selectedTime);
            }
          });
        });
    }
    // Typing a character
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
    <main className="play-page">
      {/* Show chrome only if not typing and not showing results */}
      {!hideAll && !showResults && (
        <>
          <div className="container-fluid">
            <div className="players">
              Player:
              <span className="player-name"> {username || 'Anonymous'}</span>
              <ul className="notification">
                {playerMessages.map((msg, i) => (
                  <li className="player-messages" key={i}>{msg}</li>
                ))}
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
        {!showResults && (
          <p className={`countdown${hideAll ? ' countdown-typing' : ''}`}>{countdown}</p>
        )}
        {/* Typing text only visible while timer is running and not showing results */}
        {timerActive && !showResults ? (
          <div
            className="typing-text"
            tabIndex={0}
            ref={typingAreaRef}
            onKeyDown={handleKeyDownUnified}
            style={{ outline: 'none', cursor: 'none' }}
          >
            {wordsLoading ? (
              <div className="remaining-text">Loading words...</div>
            ) : wordsError ? (
              <div className="wrong-char">{wordsError}</div>
            ) : (
              visibleLines.map(renderLine)
            )}
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
