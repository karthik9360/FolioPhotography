import { NavLink } from 'react-router-dom'
import Avatar from '../feed/Avatar'
import { useUserTenant } from '../../context/TenantContext'
import { isOnline } from '../../data/threads'
import { useNow } from '../../hooks/useNow'
import { shortAgo } from '../../lib/time'

/** The conversation list. Borderless rows; the open one sits on a quiet wash. Online status is a dot (and text for screen readers). */
export default function ThreadList({ threads }) {
  const { profileFor } = useUserTenant()
  const now = useNow()

  if (threads.length === 0) {
    return <p className="py-6 text-ink-soft">No conversations yet. Message a photographer from their profile.</p>
  }

  return (
    <nav aria-label="Conversations">
      <ul>
        {threads.map((thread) => {
          const person = profileFor(thread.with) ?? { handle: thread.with, name: thread.with, initials: '?' }
          const last = thread.messages.at(-1)
          const online = isOnline(thread.with)
          const preview = last
            ? `${last.from === 'me' ? 'You: ' : ''}${last.text || 'Photographs'}`
            : 'Say hello'
          return (
            <li key={thread.id}>
              <NavLink to={`/messages/${thread.id}`} className="thread">
                <span className="relative flex-none">
                  <Avatar user={person} size={48} />
                  <span className="presence" data-online={online} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate ${thread.unread ? 'font-semibold' : 'font-medium'}`}>{person.name}</span>
                    {last && <span className="caption shrink-0 text-ink-soft">{shortAgo(last.createdAt, now)}</span>}
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="caption truncate text-ink-soft">{preview}</span>
                    {thread.unread > 0 && (
                      <span className="unread data" aria-label={`${thread.unread} unread`}>
                        {thread.unread}
                      </span>
                    )}
                  </span>
                  <span className="sr-only">{online ? 'Online' : 'Offline'}</span>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
