import { useSyncExternalStore } from 'react'

// One shared one-minute ticker for every relative timestamp on the page, however many posts there are.
const listeners = new Set()
let now = Date.now()
let timer = 0

function subscribe(listener) {
  if (listeners.size === 0) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 60_000)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) clearInterval(timer)
  }
}

export const useNow = () => useSyncExternalStore(subscribe, () => now)
