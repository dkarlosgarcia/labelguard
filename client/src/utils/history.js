const KEY = 'labelguard_history'
const MAX = 20

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addHistoryEntry(entry) {
  const updated = [entry, ...getHistory()].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
