export const API = "http://localhost:3000/api";
export const SOCKET_URL = "http://localhost:3000";
export const GRID_W = 800;
export const GRID_H = 600;
export const COMM_RANGE = 150;

export function getDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
