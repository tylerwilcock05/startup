# Your startup name here

[My Notes](notes.md)

Cracked Typer is a typing test where you can improve your skills, compare them to others, and connect to friends

## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Have you ever wondered how you could improve your typing skills in a fun, simplistic way? That's exactly what Typing Test does for you! You can choose between a 15, 30 and 60 second test, see your best and average scores, add friends and see their scores, and see the global leaderboard. Aim to be the fastest typer in the world! Within no time at all, you'll see a huge improvement in your typing speed and accuracy.

### Design

![Login](Login.png)
![Main Page](MainPage.png)
![Friend Page](FriendPage.png)
![Stat Page](StatPage.png)
![Leaderboard](Leaderboard.png)

Here's my design
https://ninjamock.com/s/2GX9QZx

### Key features

- Secure login over HTTPS
- Ability to decide between a 15, 30, or 60 second timed typing test
- Ability to add friends and see their stats (best WPM & accuracy)
- Notification when a friend beats his/her high score and notification when a global high score is beaten
- Ability to see your own stats (total tests taken, best WPM & accuracy in 15, 30, and 60 sec categories as well as average WPM and accuracy)
- Global leaderboard (best WPM / accuracy for 15, 30, and 60 sec categories)
- Ability to change the color scheme

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Provides the structure of the website (text, links, images, several pages, etc...)
- **CSS** - Provides the styling of the page as well as the cursor that will move as you type
- **React** - Provides login and the interactivity (typing keys, pushing buttons, etc...)
- **Service** - Endpoints for authentication, storing/retrieving scores. Third party call to get random english words
- **DB/Login** - Register and login users. Credentials securely stored in database. Also used to store scores and high scores
- **WebSocket** - Users are notified of friend requests and are notified if their friend broke their high score or if a global high score was broken

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://crackedtyper.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - 5 different pages: index.html (login), play.html, my-stats.html, my-friends.html, leaderboard.html
- [x] **Proper HTML element usage** - I used many html tags including html, header, main, footer, head, title, link, body, p, a, input, img, table, textarea, li, button, and many more
- [x] **Links** - There are links between pages
- [x] **Text** - There's text on the my stats page
- [x] **3rd party API placeholder** - I put text on the play page to say that I was going to do a 3rd party service call to get random common english words
- [x] **Images** - I put an image of a keyboard on each page in the header
- [x] **Login placeholder** - Placeholder for auth on the login page.
- [x] **DB data placeholder** - High scores displayed on leaderboard page.
- [x] **WebSocket placeholder** - The play page has a text area that will show what other user notifications.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Visually appealing colors and layout. No overflowing elements.** - Yep
- [x] **Use of a CSS framework** - I used Bootstrap
- [x] **All visual elements styled using CSS** - Yep
- [x] **Responsive to window resizing using flexbox and/or grid display** - I did this
- [x] **Use of a imported font** - I used the "Comic Sans MS", "Roboto Mono", Vazirmatn, monospace font
- [x] **Use of different types of selectors including element, class, ID, and pseudo selectors** - Yep

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite** - I did this
- [x] **Components** - did this
- [x] **Router** - did this

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
