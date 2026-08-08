export const API = "https://maritime-communication-system.onrender.com/api";

export const SOCKET_URL = "https://maritime-communication-system.onrender.com";

export const GRID_W = 800;
export const GRID_H = 600;
export const COMM_RANGE = 150;

export function getDistance(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2
  );
}
