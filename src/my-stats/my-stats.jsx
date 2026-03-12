import React, { useState, useEffect } from 'react';
import './my-stats.css';

export function MyStats() {
    const [username, setUsername] = useState('Anonymous');
    const [stats, setStats] = useState({ tests: [] });

    useEffect(() => {
        let cancelled = false;

        const refresh = async () => {
            try {
                const meRes = await fetch('/api/auth/me', { method: 'get', credentials: 'include' });
                if (!meRes.ok) {
                    if (!cancelled) {
                        setUsername('Anonymous');
                        setStats({ tests: [] });
                    }
                    return;
                }
                const me = await meRes.json().catch(() => ({}));
                if (!cancelled) {
                    setUsername(me?.email || 'Anonymous');
                }

                const statsRes = await fetch('/api/stats', { method: 'get', credentials: 'include' });
                if (!statsRes.ok) {
                    if (!cancelled) setStats({ tests: [] });
                    return;
                }
                const body = await statsRes.json().catch(() => ({ tests: [] }));
                if (!cancelled) setStats(body || { tests: [] });
            } catch {
                if (!cancelled) {
                    setUsername('Anonymous');
                    setStats({ tests: [] });
                }
            }
        };

        refresh();
        window.addEventListener('auth-changed', refresh);
        return () => {
            cancelled = true;
            window.removeEventListener('auth-changed', refresh);
        };
    }, []);

    // Calculate summary
    const totalTests = stats.tests.length;
    const averageWpm = totalTests ? Math.round(stats.tests.reduce((sum, t) => sum + t.wpm, 0) / totalTests) : 0;
    const bestWpm = totalTests ? Math.max(...stats.tests.map(t => t.wpm)) : 0;
    const averageAccuracy = totalTests ? Math.round(stats.tests.reduce((sum, t) => sum + t.accuracy, 0) / totalTests) : 0;

    // Group by duration
    const bestByDuration = (duration) => {
        return stats.tests
            .filter(t => t.duration === duration)
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, 3);
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <main className="my-stats container-fluid bg-dark text-center">
            <div className="username">
                <strong className="player-text">Player:</strong>
                <span className="player-username"><strong>{username}</strong></span>
            </div>
            <div className="stats-summary-row">
                <div className="stats-summary-col">Total Tests Completed: {totalTests}</div>
                <div className="stats-summary-col">Average WPM: {averageWpm}</div>
                <div className="stats-summary-col">Best WPM: {bestWpm}</div>
                <div className="stats-summary-col">Average Accuracy: {averageAccuracy}%</div>
            </div>
            <div className="stats-tables-row">
                <div className="stats-table-col">
                    <h3 className="table-header">Best 15 seconds</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>WPM</th>
                                <th>Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bestByDuration(15).map((t, i) => (
                                <tr key={i}>
                                    <td>{formatDate(t.date)}</td>
                                    <td>{t.wpm}</td>
                                    <td>{t.accuracy}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="stats-table-col">
                    <h3 className="table-header">Best 30 seconds</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>WPM</th>
                                <th>Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bestByDuration(30).map((t, i) => (
                                <tr key={i}>
                                    <td>{formatDate(t.date)}</td>
                                    <td>{t.wpm}</td>
                                    <td>{t.accuracy}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="stats-table-col">
                    <h3 className="table-header">Best 60 seconds</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>WPM</th>
                                <th>Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bestByDuration(60).map((t, i) => (
                                <tr key={i}>
                                    <td>{formatDate(t.date)}</td>
                                    <td>{t.wpm}</td>
                                    <td>{t.accuracy}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
