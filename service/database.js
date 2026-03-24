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
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function updateUserRemoveAuth(user) {
  await userCollection.updateOne({ email: user.email }, { $unset: { token: 1 } });
}

async function addScore(score) {
  return scoreCollection.insertOne(score);
}

async function getHighScores() {
  // Fetch top 10 scores, sorted by wpm descending
  const query = { wpm: { $gt: 0 } };
  const options = {
    sort: { wpm: -1 },
    limit: 10,
    projection: { _id: 0, wpm: 1, accuracy: 1, name: 1, date: 1 },
  };
  const cursor = scoreCollection.find(query, options);
  const scores = await cursor.toArray();
  // Add placement (1-based index)
  return scores.map((score, idx) => ({
    placement: idx + 1,
    ...score
  }));
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  updateUserRemoveAuth,
  addScore,
  getHighScores,
};
