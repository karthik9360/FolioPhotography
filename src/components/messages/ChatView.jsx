import { useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../feed/Avatar'
import Composer from './Composer'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useChat } from '../../context/ChatContext'
import { useUserTenant } from '../../context/TenantContext'
import { isOnline } from '../../data/threads'
import { profilePath } from '../../lib/routes'

/** The open conversation: who it is with, the messages, a reserved typing line, and the composer. */
export default function ChatView({ threadId }) {
  const { thread, messages, isTyping, send, markRead } = useChat(threadId)
  const { profileFor } = useUserTenant()
  const listRef = useRef(null)

  const partner = thread && (profileFor(thread.with) ?? { handle: thread.with, name: thread.with, initials: '?' })

  // Stay pinned to the newest message, and clear the unread count while this thread is open.
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, isTyping, threadId])
  useEffect(() => {
    if (thread?.unread) markRead()
  }, [thread?.unread, markRead])

  if (!thread) return null

  const lastOwn = messages.findLastIndex((m) => m.from === 'me')
  const online = isOnline(thread.with)

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={`Conversation with ${partner.name}`}>
      <header className="flex items-center gap-3 border-b border-hairline pb-4">
        <Link to="/messages" className="icon-btn -ml-3 lg:hidden" aria-label="Back to conversations">
          <ChevronLeft size={22} strokeWidth={1.25} aria-hidden="true" />
        </Link>
        <Avatar user={partner} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-tight">{partner.name}</p>
          <p className="caption text-ink-soft">
            @{partner.handle} · {online ? 'Online' : 'Offline'}
          </p>
        </div>
        <Link to={profilePath(partner.handle)} className="label nav-link">
          Profile
        </Link>
      </header>

      <ol ref={listRef} role="log" aria-label="Messages" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-4">
        {messages.length === 0 && <li className="text-ink-soft">Say hello to {partner.name}.</li>}
        {messages.map((message, i) => (
          <MessageBubble key={message.id} message={message} own={message.from === 'me'} index={i} showStatus={i === lastOwn} />
        ))}
      </ol>

      <div className="min-h-8" aria-live="polite">
        {isTyping && <TypingIndicator name={partner.name} />}
      </div>

      <Composer onSend={send} name={partner.name} />
    </section>
  )
}
