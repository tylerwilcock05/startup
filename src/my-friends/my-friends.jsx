
import React, { useState, useEffect } from 'react';
import './my-friends.css';

export function MyFriends() {
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState({});
  const [username, setUsername] = useState('');

  // Load friends and stats from localStorage
  useEffect(() => {
    setFriends(JSON.parse(localStorage.getItem('ct-friends') || '[]'));
    setStats(JSON.parse(localStorage.getItem('ct-stats') || '{}'));
    setUsername(localStorage.getItem('ct-username') || '');
  }, []);

  // Add a friend
  const handleAddFriend = () => {
    const name = friendName.trim();
    if (!name || friends.includes(name) || name === username) return;
    const updated = [...friends, name];
    setFriends(updated);
    localStorage.setItem('ct-friends', JSON.stringify(updated));
    setFriendName('');
  };

  // Remove a friend
  const handleRemoveFriend = (name) => {
    const updated = friends.filter(f => f !== name);
    setFriends(updated);
    localStorage.setItem('ct-friends', JSON.stringify(updated));
  };

  // Helper to get stats summary for a user
  function getSummary(user) {
    const userStats = stats[user];
    if (!userStats || !userStats.tests || userStats.tests.length === 0) return {
      tests: 0, avgWpm: '-', best15: '-', best30: '-', best60: '-'
    };
    const tests = userStats.tests.length;
    const avgWpm = Math.round(userStats.tests.reduce((sum, t) => sum + (t.wpm || 0), 0) / tests);
    const best = { 15: null, 30: null, 60: null };
    for (const t of userStats.tests) {
      if (best[t.duration] == null || t.wpm > best[t.duration].wpm) best[t.duration] = t;
    }
    return {
      tests,
      avgWpm,
      best15: best[15] ? `${best[15].wpm}WPM - ${best[15].accuracy}%` : '-',
      best30: best[30] ? `${best[30].wpm}WPM - ${best[30].accuracy}%` : '-',
      best60: best[60] ? `${best[60].wpm}WPM - ${best[60].accuracy}%` : '-',
    };
  }

  // Render a row for a user
  function renderRow(user, isSelf = false) {
    const s = getSummary(user);
    return (
      <tr key={user}>
        <td>{user}{isSelf ? ' (You)' : ''}</td>
        <td>{s.tests}</td>
        <td>{s.avgWpm}</td>
        <td>{s.best15}</td>
        <td>{s.best30}</td>
        <td>{s.best60}</td>
        <td>{isSelf ? '-' : <button onClick={() => handleRemoveFriend(user)}>Remove</button>}</td>
      </tr>
    );
  }

  return (
    <main className="my-friends">
      <h2>Friends</h2>
      <input
        type="text"
        id="friendName"
        name="friendName"
        placeholder="Enter username of friend"
        value={friendName}
        onChange={e => setFriendName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAddFriend(); }}
      />
      <button onClick={handleAddFriend}>Add friend</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Tests</th>
            <th>Average WPM</th>
            <th>Best 15 sec</th>
            <th>Best 30 sec</th>
            <th>Best 60 sec</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {username && renderRow(username, true)}
          {friends.map(f => renderRow(f, false))}
        </tbody>
      </table>
    </main>
  );
}