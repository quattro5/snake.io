const wsURL = "ws://localhost:2346";
const ws = new WebSocket(wsURL);

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

export function saveSettings(data) {
  localStorage.setItem("settings", JSON.stringify(data));
}

export function getSettings() {
  if (!JSON.parse(localStorage.getItem("settings"))) {
    localStorage.setItem(
      "settings",
      JSON.stringify({ nick: "", color: "#ff0000", scale: 16 })
    );
  }
  return JSON.parse(localStorage.getItem("settings"));
}
