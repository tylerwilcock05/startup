import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './leaderboard.css';

export function Leaderboard() {
    return (
      <main className="leaderboard">
        <h2>Global Leaderboard</h2>
        <div className="leaderboard-radio-row">
          <input type="radio" id="15 sec" name="seconds" />
          <label htmlFor="15 sec">15 seconds</label>

          <input type="radio" id="30 sec" name="seconds" defaultChecked />
          <label htmlFor="30 sec">30 seconds</label>

          <input type="radio" id="60 sec" name="seconds" />
          <label htmlFor="60 sec">60 seconds</label>
        </div>
        <div className="leaderboard-radio-row">
          <input type="radio" id="friends" name="filter" />
          <label htmlFor="friends">Just friends</label>

          <input type="radio" id="everyone" name="filter" defaultChecked />
          <label htmlFor="everyone">Everyone</label>
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
            <tr>
              <td>1</td>
              <td>160</td>
              <td>99%</td>
              <td>Billy Bob</td>
              <td>May 20, 2025</td>
            </tr>
            <tr>
              <td>2</td>
              <td>155</td>
              <td>98%</td>
              <td>Annie James</td>
              <td>June 2, 2025</td>
            </tr>
            <tr>
              <td>3</td>
              <td>144</td>
              <td>99%</td>
              <td>Gunter Spears</td>
              <td>July 3, 2025</td>
            </tr>
          </tbody>
        </table>
      </main>
  );
}