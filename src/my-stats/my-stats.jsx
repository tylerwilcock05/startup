import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export function MyStats() {
  return (
    <BrowserRouter>
      <main className="container-fluid bg-dark text-center">
            <div className="players">
                <strong className="players">Player:</strong>
                <span className="player-name"><strong>UsernameOfPlayer</strong></span>
            </div>
            <div className="stats-summary-row">
                <div className="stats-summary-col">Total Tests Completed: 15</div>
                <div className="stats-summary-col">Average WPM: 72</div>
                <div className="stats-summary-col">Best WPM: 104</div>
                <div className="stats-summary-col">Average Accuracy: 94%</div>
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
                                        <tr>
                                            <td>Jan 20, 2026</td>
                                            <td>104</td>
                                            <td>98%</td>
                                        </tr>
                                        <tr>
                                            <td>Jan 11, 2026</td>
                                            <td>100</td>
                                            <td>97%</td>
                                        </tr>
                                        <tr>
                                            <td>Jan 23, 2026</td>
                                            <td>95</td>
                                            <td>98%</td>
                                        </tr>
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
                                        <tr>
                                            <td>Jan 21, 2026</td>
                                            <td>93</td>
                                            <td>96%</td>
                                        </tr>
                                        <tr>
                                            <td>Jan 18, 2026</td>
                                            <td>89</td>
                                            <td>98%</td>
                                        </tr>
                                        <tr>
                                            <td>Jan 20, 2026</td>
                                            <td>88</td>
                                            <td>97%</td>
                                        </tr>
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
                            <tr>
                                <td>Jan 26, 2026</td>
                                <td>88</td>
                                <td>96%</td>
                            </tr>
                            <tr>
                                <td>Jan 19, 2026</td>
                                <td>84</td>
                                <td>93%</td>
                            </tr>
                            <tr>
                                <td>Jan 24, 2026</td>
                                <td>80</td>
                                <td>95%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

    </main>
    </BrowserRouter>
  );
}