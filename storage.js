const KEY = "campusPlan.records.v1";
export function loadRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(data)) return data;
  } catch (error) {
    console.warn("Saved planner data could not be read.", error);
  }
  return [];
}
export function saveRecords(records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error("Planner data could not be saved.", error);
    return false;
  }
}
