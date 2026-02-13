import React from 'react';
import './my-friends.css';

export function MyFriends() {
  return (
      <main>
        <h2>Friends</h2>
        <input type="text" id="friendName" name="friendName" placeholder="Enter username of friend" />
        <button>Add friend</button>
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
          <tr>
            <td>UsernameOfPlayer</td>
            <td>15</td>
            <td>72</td>
            <td>104WPM - 98%
            </td>
            <td>93WPM - 96%
            </td>
            <td>88WPM - 96%
            </td>
            <td>-</td>
          </tr>
          <tr>
            <td>Billy Bob</td>
            <td>55</td>
            <td>135</td>
            <td>160WPM - 99%
            </td>
            <td>145WPM - 97%
            </td>
            <td>133WPM - 95%
            </td>
            <td><button>Remove</button></td>
          </tr>
          <tr>
            <td>Annie James</td>
            <td>102</td>
            <td>33</td>
            <td>50WPM - 90%
            </td>
            <td>44WPM - 91%
            </td>
            <td>32WPM - 88%
            </td>
            <td><button>Remove</button></td>
          </tr>
          <tr>
            <td>Joe Donovan</td>
            <td>126</td>
            <td>61</td>
            <td>68WPM - 95%
            </td>
            <td>64WPM - 97%
            </td>
            <td>56WPM - 90%
            </td>
            <td><button>Remove</button></td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}