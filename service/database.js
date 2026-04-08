const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const scoreCollection = db.collection('score');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

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
  const { _id, ...safeUser } = user || {};
  await userCollection.updateOne({ email: safeUser.email }, { $set: safeUser });
}

async function addScore(score) {
  // Ensure required fields for leaderboard
  const doc = {
    wpm: Number(score.wpm),
    accuracy: Number(score.accuracy),
    duration: Number(score.duration),
    date: score.date || new Date().toISOString(),
    username: score.username || score.name || 'Anonymous',
  };
  return scoreCollection.insertOne(doc);
}

async function getHighScores(limit = 10) {
  // Fetch top 10 scores, sorted by wpm descending
  const query = { wpm: { $gt: 0 } };
  const options = {
    sort: { wpm: -1, accuracy: -1, date: 1 },
    limit: Math.max(1, Math.min(Number(limit) || 10, 500)),
    projection: { _id: 0, wpm: 1, accuracy: 1, duration: 1, username: 1, name: 1, date: 1 },
  };
  const cursor = scoreCollection.find(query, options);
  const scores = await cursor.toArray();
  // Add placement (1-based index)
  return scores.map((score, idx) => ({
    placement: idx + 1,
    wpm: score.wpm,
    accuracy: score.accuracy,
    duration: score.duration,
    date: score.date,
    username: score.username || score.name || 'Anonymous',
  }));
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addScore,
  getHighScores,
};
