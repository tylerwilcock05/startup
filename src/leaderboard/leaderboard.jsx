import React, { useState, useEffect } from 'react';
import './leaderboard.css';

export function Leaderboard() {
  const [duration, setDuration] = useState(30);
  const [scores, setScores] = useState([]);
  const [scope, setScope] = useState('everyone'); // 'everyone' or 'friends'

  useEffect(() => {
    // Gather all users' stats from localStorage
    const statsKey = 'ct-stats';
    const allStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
    let allScores = [];
    let friends = [];
    let currentUser = localStorage.getItem('ct-username') || '';
    if (scope === 'friends') {
      friends = JSON.parse(localStorage.getItem('ct-friends') || '[]');
      // Always include the current user in the friends filter
      if (currentUser && !friends.includes(currentUser)) {
        friends = [...friends, currentUser];
      }
    }
    for (const [username, data] of Object.entries(allStats)) {
      if (scope === 'friends' && !friends.includes(username)) continue;
      if (data && Array.isArray(data.tests)) {
        for (const test of data.tests) {
          if (test.duration === duration) {
            allScores.push({
              username,
              wpm: test.wpm,
              accuracy: test.accuracy,
              date: test.date
            });
          }
        }
      }
    }
    // Sort by WPM descending, then accuracy descending
    allScores.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);
    setScores(allScores.slice(0, 10)); // Top 10
  }, [duration, scope]);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
      <main className="leaderboard">
        <h2>Global Leaderboard</h2>
        <div className="leaderboard-radio-row">
          <input type="radio" id="15 sec" name="seconds" checked={duration === 15} onChange={() => setDuration(15)} />
          <label htmlFor="15 sec">15 seconds</label>

          <input type="radio" id="30 sec" name="seconds" checked={duration === 30} onChange={() => setDuration(30)} />
          <label htmlFor="30 sec">30 seconds</label>

          <input type="radio" id="60 sec" name="seconds" checked={duration === 60} onChange={() => setDuration(60)} />
          <label htmlFor="60 sec">60 seconds</label>
        </div>
        <div className="leaderboard-radio-row" style={{marginBottom:'1em'}}>
          <input type="radio" id="everyone" name="scope" checked={scope === 'everyone'} onChange={() => setScope('everyone')} /><label htmlFor="everyone">Everyone</label><input type="radio" id="friends" name="scope" checked={scope === 'friends'} onChange={() => setScope('friends')} /><label htmlFor="friends">Just Friends</label>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Name</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.length === 0 ? (
              <tr><td colSpan={5} style={{color:'#888'}}>No scores yet for this duration.</td></tr>
            ) : (
              scores.map((score, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{score.wpm}</td>
                  <td>{score.accuracy}%</td>
                  <td>{score.username}</td>
                  <td>{formatDate(score.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    );
}