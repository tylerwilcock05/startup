const GameEvent = {
  System: 'system',
  End: 'gameEnd',
  Start: 'gameStart',
  FriendAdded: 'friendAdded',
  LeaderboardScore: 'leaderboardScore',
  FriendStartedTest: 'friendStartedTest',
  FriendFinishedTest: 'friendFinishedTest',
};
  
  class EventMessage {
    constructor(from, type, value) {
      this.from = from;
      this.type = type;
      this.value = value;
    }
  }
  
class GameEventNotifier {
  events = [];
  handlers = [];

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onopen = (event) => {
      this.receiveEvent(new EventMessage('System', GameEvent.System, { msg: 'connected' }));
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(new EventMessage('System', GameEvent.System, { msg: 'disconnected' }));
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  }

  // --- Notification helpers ---

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

const GameNotifier = new GameEventNotifier();
export { GameEvent, GameNotifier };

// --- Usage Example ---
// GameNotifier.notifyFriendAdded('Jack', 'Sam');
// GameNotifier.notifyLeaderboardScore('Sam', '2nd', 110, 30);
// GameNotifier.notifyFriendStartedTest('Jack', 'Sam', 30);
// GameNotifier.notifyFriendFinishedTest('Jack', 'Sam', 89, 60);
//
// To listen for notifications:
// GameNotifier.addHandler((event) => {
//   if (event.type === GameEvent.FriendAdded && event.value.to === myUsername) {
//     alert(event.value.msg);
//   }
//   // ...handle other event types
// });
  