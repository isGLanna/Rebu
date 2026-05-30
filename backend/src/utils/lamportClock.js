let logicalClock = 0;

function tick(receivedTimestamp = 0) {
  logicalClock = Math.max(logicalClock, receivedTimestamp) + 1;
  return logicalClock;
}

function getCurrentTimestamp() {
  return logicalClock;
}

module.exports = {
  tick,
  getCurrentTimestamp
};