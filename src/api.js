const ws = new WebSocket("ws://localhost:2346");

export function sendRequest(data) {
  const stringifiesMessage = JSON.stringify(data);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(stringifiesMessage);
    return;
  }

  ws.addEventListener(
    "open",
    () => {
      ws.send(stringifiesMessage);
    },
    { once: true }
  );
}

export function subscribeToState(callback) {
  ws.onmessage = (response) => {
    const data = JSON.parse(response.data);
    callback(data);
  };
}
