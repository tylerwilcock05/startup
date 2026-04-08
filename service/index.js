const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const https = require('https');
const uuid = require('uuid');
const app = express();
const DB = require('./database');
const { peerProxy } = require('./peerProxy.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

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
      await DB.updateUser(user);
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
    DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    ensureUserData(user);
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// GetAuth current user
apiRouter.get('/auth/me', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    ensureUserData(user);
    res.send({ email: user.email });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// Get friends for current user
apiRouter.get('/friends', verifyAuth, (req, res) => {
  res.send({ friends: req.user.friends });
});

// Add a friend for current user
apiRouter.post('/friends', verifyAuth, async (req, res) => {
  const name = String(req.body?.name || req.body?.email || '').trim();
  if (!name) {
    res.status(400).send({ msg: 'Friend name required' });
    return;
  }
  const friendUser = await DB.getUser(name);
  if (!friendUser) {
    res.status(404).send({ msg: 'User not found' });
    return;
  }
  if (name === req.user.email) {
    res.status(400).send({ msg: 'Cannot add yourself' });
    return;
  }
  if (!req.user.friends.includes(name)) {
    req.user.friends.push(name);
  }
  await DB.updateUser(req.user);
  res.send({ friends: req.user.friends });
});

// Remove a friend for current user
apiRouter.delete('/friends/:name', verifyAuth, async (req, res) => {
  const name = String(req.params?.name || '').trim();
  req.user.friends = req.user.friends.filter((f) => f !== name);
  await DB.updateUser(req.user);
  res.send({ friends: req.user.friends });
});

// Get stats for current user
apiRouter.get('/stats', verifyAuth, (req, res) => {
  res.send(req.user.stats);
});

// Get stats for a list of users
apiRouter.get('/stats/batch', verifyAuth, async (req, res) => {
  const raw = String(req.query.users || '');
  const usersList = raw
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const result = {};
  const fetched = await Promise.all(usersList.map((email) => DB.getUser(email)));
  usersList.forEach((email, idx) => {
    const user = fetched[idx];
    result[email] = user?.stats || { tests: [] };
  });
  res.send(result);
});

// Add a test result for current user
apiRouter.post('/stats', verifyAuth, async (req, res) => {
  const wpm = Number(req.body?.wpm);
  const accuracy = Number(req.body?.accuracy);
  const duration = Number(req.body?.duration);
  const date = req.body?.date || new Date().toISOString();
  if (!Number.isFinite(wpm) || !Number.isFinite(accuracy) || !Number.isFinite(duration)) {
    res.status(400).send({ msg: 'Invalid stats payload' });
    return;
  }
  req.user.stats.tests.push({ wpm, accuracy, duration, date });
  await DB.updateUser(req.user);
  res.send(req.user.stats);
});

// Get random words from Datamuse (no API key required)
apiRouter.get('/words', async (req, res) => {
  const requestedCount = parseInt(req.query.count, 10);
  const count = Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 1), 500) : 300;
  const poolSize = Math.min(Math.max(count * 4, 400), 1200);

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

  res.set('Cache-Control', 'no-store');

  const fetchDatamuse = (pattern) =>
    new Promise((resolve, reject) => {
      const url = new URL('https://api.datamuse.com/words');
      url.searchParams.set('sp', pattern);
      url.searchParams.set('max', String(poolSize));
      url.searchParams.set('md', 'f');
      https
        .get(url, { family: 4 }, (apiRes) => {
          let raw = '';
          apiRes.on('data', (chunk) => (raw += chunk));
          apiRes.on('end', () => {
            if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
              console.error('[words] Datamuse non-2xx:', apiRes.statusCode, raw.slice(0, 200));
              reject(new Error('Datamuse non-2xx'));
              return;
            }
            try {
              const parsed = JSON.parse(raw);
              resolve(Array.isArray(parsed) ? parsed : []);
            } catch {
              reject(new Error('Invalid Datamuse response'));
            }
          });
        })
        .on('error', (err) => {
          console.error('[words] Datamuse error:', err && (err.code || err.message) ? (err.code || err.message) : err);
          reject(err);
        });
    });

  const distinctLetters = 20;
  const letters = new Set();
  while (letters.size < distinctLetters) {
    letters.add(pickWeightedLetter());
  }
  const results = await Promise.allSettled(
    Array.from(letters).map((l) => fetchDatamuse(`${l}*`))
  );
  let combined = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  if (combined.length === 0) {
    combined = await fetchDatamuse('*').catch(() => []);
  }
  if (combined.length === 0) {
    res.status(502).send({ msg: 'Datamuse request failed' });
    return;
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
    // Prefer common words by frequency; fall back to score if needed.
    withFreq.sort((a, b) => (b.freq - a.freq) || (b.score - a.score));
    const maxFreq = withFreq[0]?.freq || 0;
    const effectiveMinFreq = Math.min(minFreq, maxFreq);
    commonPool = withFreq.filter((item) => item.freq >= effectiveMinFreq);
    if (commonPool.length === 0) {
      commonPool = withFreq.slice(0, Math.min(withFreq.length, Math.max(count * 3, 400)));
    }
  } else {
    // No frequency data available; fall back to score.
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

  res.send({ words: pool.slice(0, count).map((item) => item.word) });
});

// GetScores (aggregate from user stats)
apiRouter.get('/scores', verifyAuth, async (req, res) => {
  try {
    const scores = await DB.getHighScores(200);
    const currentEmail = String(req.user?.email || '').toLowerCase();
    const friendsSet = new Set((req.user?.friends || []).map((f) => String(f).toLowerCase()));
    const decorated = scores.map((score) => {
      const username = String(score.username || '').toLowerCase();
      return {
        ...score,
        isCurrentUser: currentEmail && username === currentEmail,
        isFriend: username && friendsSet.has(username),
      };
    });
    res.send(decorated);
  } catch (err) {
    res.status(500).send({ msg: 'Failed to fetch scores' });
  }
});

// SubmitScore
apiRouter.post('/score', verifyAuth, async (req, res) => {
  try {
    const score = await updateScores(req.body);
    res.send(score);
  } catch (err) {
    res.status(500).send({ msg: 'Failed to submit score' });
  }
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// updateScores considers a new score for inclusion in the high scores.
async function updateScores(newScore) {
  await DB.addScore(newScore);
  return DB.getHighScores();
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    friends: [],
    stats: { tests: [] },
  };
  await DB.addUser(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  if (field === 'token') {
    return DB.getUserByToken(value);
  }

  return DB.getUser(value);
}

function ensureUserData(user) {
  if (!user.friends) user.friends = [];
  if (!user.stats) user.stats = { tests: [] };
  if (!Array.isArray(user.stats.tests)) user.stats.tests = [];
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);
