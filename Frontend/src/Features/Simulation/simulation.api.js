import { API } from "./simulation.constants";

export async function fetchAllShips() {
  const res = await fetch(`${API}/ship`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
}

export async function sendMessage(payload) {
  const res = await fetch(`${API}/message/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function addNewShip(shipData) {
  const res = await fetch(`${API}/ship/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(shipData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Server error: ${res.status}`);
  }

  return data;
}

export async function removeShip(id) {
  await fetch(`${API}/ship/${id}`, { method: "DELETE" });
}

export async function startSimulation() {
  await fetch(`${API}/simulation/start`, { method: "POST" });
}

export async function stopSimulation() {
  await fetch(`${API}/simulation/stop`, { method: "POST" });
}
