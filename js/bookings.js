const KEY = "ironHouseBookings";

export function getBookings() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
export function saveBooking(booking) {
  const updated = [...getBookings(), booking];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
export function deleteBooking(id) {
  const updated = getBookings().filter(b => b.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
export function clearBookings() { localStorage.removeItem(KEY); }

export function getClassSpotsTaken(classId) {
  return getBookings().filter(b => b.type === "Class" && b.classId === Number(classId)).length;
}
export function getClassSpotsLeft(classObj) {
  return Math.max(0, classObj.maxSpots - getClassSpotsTaken(classObj.id));
}
export function isClassFull(classObj) {
  return getClassSpotsLeft(classObj) <= 0;
}
