[My startup - Simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

My IP address is: 13.217.130.52

This is the command to remote shell into my server
ssh -i ~/Downloads/Gibberish.pem ubuntu@13.217.130.52



## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

This was easy. I was careful to use the correct structural elements such as header, footer, main, nav, and form. The links between the three views work great using the `a` element.

The part I didn't like was the duplication of the header and footer code. This is messy, but it will get cleaned up when I get to React.

## CSS

## What I Learned

- Use flexbox on body and main to keep the footer at the bottom of the page, even with little content
- Use `min-height: 100vh` on body for full viewport height layouts
- Use `flex: 1` on main to fill available space between header and footer
- Use `align-items: center` and `justify-content: center` to center content vertically and horizontally
- Use more specific selectors and `!important` to override Bootstrap
- Use radio inputs and style their labels as toggle buttons
- Use `margin-bottom` and `gap` to control spacing between rows and elements
- Use `border-radius` for rounded buttons
- Remove Bootstrap table classes if you want only your custom table style to apply
- Use `padding-left` and remove `flex: 1`/`width: 100%` to control alignment and whitespace in flex containers
- Use a single CSS file for shared styles, and page-specific CSS for overrides
- Always check for inline styles or Bootstrap utility classes that may override your custom CSS

How to hook up css to html:

```html
      <head>
        <link rel="stylesheet" href="style.css"></link>
      </head>
```

```css
.class {

}

#id {

}

input[type="radio"] {
  
}

```


This took a couple hours to get it how I wanted. It was important to make it responsive and Bootstrap helped with that. It looks great on all kinds of screen sizes.

Bootstrap seems a bit like magic. It styles things nicely, but is very opinionated. You either do, or you do not. There doesn't seem to be much in between.

I did like the navbar it made it super easy to build a responsive header.

```html
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand">
            <img src="logo.svg" width="30" height="30" class="d-inline-block align-top" alt="" />
            Calmer
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" href="play.html">Play</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="about.html">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
```

I also used SVG to make the icon and logo for the app. This turned out to be a piece of cake.

```html
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#0066aa" rx="10" ry="10" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="72" font-family="Arial" fill="white">C</text>
</svg>
```

## React Part 1: Routing

Setting up Vite and React was pretty simple. I had a bit of trouble because of conflicting CSS. This isn't as straight forward as you would find with Svelte or Vue, but I made it work in the end. If there was a ton of CSS it would be a real problem. It sure was nice to have the code structured in a more usable way.

Here's some stuff I learned in class

```html
  <meta 
        name="viewport"
        content="width=device-width, initial-scale=1"      
  />
  .aside {
        float: right;
        padding: 3em;
        margin: 0.5em;
        border: black solid thin;
  }
  .name {
        none
        block
        display: inline
        flex
        display: grid
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        grid-auto-rows: 300px
        grid-gap: 1em
  }

  .nth-child(even), nth-child(odd)

  .container {
        display: flex;
  }

  .item {
        flex: 0 0 50px; /--> grow, shrink, basis
  }

  @media (orientation: portrait) {
        div {
              transform: rotate(270deg);
        }
  }

  Bootstrap
  <head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  </head>

  <body>
  <button type="button">Plain</button>
  <button type="button" class="btn btn-outline-primary">Bootstrap</button>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
```

I also learned how to change several html files to one file using react



## React Part 2: Reactivity

This was a lot of fun to see it all come together. I had to keep remembering to use React state instead of just manipulating the DOM directly.

Handling the toggling of the checkboxes was particularly interesting.

```jsx
<div className="input-group sound-button-container">
  {calmSoundTypes.map((sound, index) => (
    <div key={index} className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        value={sound}
        id={sound}
        onChange={() => togglePlay(sound)}
        checked={selectedSounds.includes(sound)}
      ></input>
      <label className="form-check-label" htmlFor={sound}>
        {sound}
      </label>
    </div>
  ))}
</div>
```

I learned a ton about how to use React, for example, how to check if a key is pressed

```
const handleKeyDownUnified = (e) => {
  if (e.key === 'Backspace') {
    //do something
  }
}
```

## Javascript

```
const msg = "Hello world";

console.log('Hello' + ' ' + 'world')

document.body.innerTextd

function join(a, b) {
  return a + ' ' + b;
}

const words = ['hello', 'world'];

words.forEach((word) => console.log(word))

let i = 0;

document.body.innerHTML = "h1 id='count' />"
setInterval(() => {
  const el = document.querySelector('#count');
  el.innerHTML = 'Count: ${i++}'
}, 1000)
```

## Service

How to handle users using service

```
// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// GetScores
apiRouter.get('/scores', verifyAuth, (_req, res) => {
  res.send(scores);
});

// SubmitScore
apiRouter.post('/score', verifyAuth, (req, res) => {
  scores = updateScores(req.body);
  res.send(scores);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

```
How to update the scores using service
```
// updateScores considers a new score for inclusion in the high scores.
function updateScores(newScore) {
  let found = false;
  for (const [i, prevScore] of scores.entries()) {
    if (newScore.score > prevScore.score) {
      scores.splice(i, 0, newScore);
      found = true;
      break;
    }
  }

  if (!found) {
    scores.push(newScore);
  }

  if (scores.length > 10) {
    scores.length = 10;
  }

  return scores;
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}
```


## Database
Here's what I learned by doing the database deliverable

This is what to put into the dbConfig.json file
```
{
  "hostname": "cs260.abcdefg.mongodb.net",
  "userName": "myMongoUserName",
  "password": "toomanysecrets"
}
```

This is how to make a connection with mongo DB
```
const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('simon');

(async function testConnection() {
  try {
    await db.command({ ping: 1 });
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();
```

This is how to do database requests
```
function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addScore(score) {
  return scoreCollection.insertOne(score);
}

function getHighScores() {
  const query = { score: { $gt: 0, $lt: 900 } };
  const options = {
    sort: { score: -1 },
    limit: 10,
  };
  const cursor = scoreCollection.find(query, options);
  return cursor.toArray();
}
```


## websocket
use this to implement websocket
```
notifyFriendAdded(from, to) {
    // Notify 'to' that 'from' added them as a friend
    this.broadcastEvent(from, GameEvent.FriendAdded, { msg: `${from} added you as a friend`, to });
  }

  notifyLeaderboardScore(from, rank, wpm, seconds) {
    // Notify all users of a new leaderboard score
    this.broadcastEvent(from, GameEvent.LeaderboardScore, { msg: `${from} just got ${rank} on the global leaderboard (${wpm}WPM - ${seconds} seconds)`, rank, wpm, seconds });
  }

  notifyFriendStartedTest(from, to, seconds) {
    // Notify 'to' that 'from' started a test
    this.broadcastEvent(from, GameEvent.FriendStartedTest, { msg: `${from} just started a ${seconds} second test`, to, seconds });
  }

  notifyFriendFinishedTest(from, to, wpm, seconds) {
    // Notify 'to' that 'from' finished a test
    this.broadcastEvent(from, GameEvent.FriendFinishedTest, { msg: `${from} just got ${wpm} WPM on a ${seconds} second test`, to, wpm, seconds });
  }

  broadcastEvent(from, type, value) {
    const event = new EventMessage(from, type, value);
    this.socket.send(JSON.stringify(event));
  }
  
  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  receiveEvent(event) {
    this.events.push(event);
    // Only notify handlers for the latest event
    this.handlers.forEach((handler) => {
      handler(event);
    });
  }
}
```