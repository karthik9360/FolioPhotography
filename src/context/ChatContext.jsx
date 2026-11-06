import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { isOnline, seedThreadsFor } from '../data/threads'

/*
 * useChat: conversations, optimistic sending, delivery states and a simulated peer.
 *
 * There is no server, so "real time" is simulated on timers: a sent message goes
 * Sent -> Delivered -> Read, and an online peer shows a typing indicator and then replies.
 * To go live, replace the timers in `send` with a socket; the shape of the state stays the same.
 */

const ChatContext = createContext(null)

const REPLIES = [
  'That works for me. Let me check my calendar and come back to you.',
  'Thank you, this is really helpful.',
  'Love it. Send them over when you are ready.',
  'Perfect, I will confirm by tomorrow.',
  'Great frame, by the way.',
  'Let’s do it.',
]

const lastTime = (thread) => thread.messages.at(-1)?.createdAt ?? 0

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const handle = user?.handle ?? null
  const [threads, setThreads] = useState({})
  const [typing, setTyping] = useState({})
  const timers = useRef([])
  const threadsRef = useRef(threads)
  threadsRef.current = threads

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  // Whoever signs in gets their own set of conversations.
  useEffect(() => {
    setThreads(handle ? seedThreadsFor(handle) : {})
    setTyping({})
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [handle])

  const patchMessage = useCallback((threadId, messageId, patch) => {
    setThreads((t) =>
      t[threadId]
        ? { ...t, [threadId]: { ...t[threadId], messages: t[threadId].messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)) } }
        : t,
    )
  }, [])

  const send = useCallback(
    (threadId, { text = '', attachments = [] }) => {
      const body = text.trim()
      const thread = threadsRef.current[threadId]
      if (!thread || (!body && attachments.length === 0)) return

      // Optimistic: it is in the conversation, marked Sent, before anything else happens.
      const message = { id: crypto.randomUUID(), from: 'me', text: body, createdAt: Date.now(), status: 'sent', attachments }
      setThreads((t) => ({ ...t, [threadId]: { ...t[threadId], messages: [...t[threadId].messages, message] } }))

      later(() => patchMessage(threadId, message.id, { status: 'delivered' }), 700)

      // Only an online peer reads promptly, types, and answers.
      if (isOnline(thread.with)) {
        later(() => patchMessage(threadId, message.id, { status: 'read' }), 2000)
        later(() => setTyping((s) => ({ ...s, [threadId]: true })), 2400)
        later(() => {
          setTyping((s) => ({ ...s, [threadId]: false }))
          setThreads((t) => {
            const current = t[threadId]
            if (!current) return t
            const reply = {
              id: crypto.randomUUID(),
              from: current.with,
              text: REPLIES[current.messages.length % REPLIES.length],
              createdAt: Date.now(),
              status: 'read',
              attachments: [],
            }
            return { ...t, [threadId]: { ...current, unread: current.unread + 1, messages: [...current.messages, reply] } }
          })
        }, 4300)
      }
    },
    [later, patchMessage],
  )

  const markRead = useCallback((threadId) => {
    setThreads((t) => (t[threadId]?.unread ? { ...t, [threadId]: { ...t[threadId], unread: 0 } } : t))
  }, [])

  /** Finds or creates the conversation with `withHandle` and returns its id. */
  const startThread = useCallback((withHandle) => {
    const id = `t-${withHandle}`
    setThreads((t) => (t[id] ? t : { ...t, [id]: { id, with: withHandle, unread: 0, messages: [] } }))
    return id
  }, [])

  const list = useMemo(() => Object.values(threads).sort((a, b) => lastTime(b) - lastTime(a)), [threads])
  const unreadTotal = useMemo(() => list.reduce((n, t) => n + t.unread, 0), [list])

  const value = useMemo(
    () => ({ threads: list, byId: threads, typing, unreadTotal, send, markRead, startThread }),
    [list, threads, typing, unreadTotal, send, markRead, startThread],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/** Conversations, plus the active one when a thread id is given. */
export function useChat(threadId) {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  const thread = threadId ? ctx.byId[threadId] ?? null : null
  return {
    threads: ctx.threads,
    unreadTotal: ctx.unreadTotal,
    thread,
    messages: thread?.messages ?? [],
    isTyping: Boolean(threadId && ctx.typing[threadId]),
    send: (payload) => ctx.send(threadId, payload),
    markRead: () => ctx.markRead(threadId),
    startThread: ctx.startThread,
  }
}
