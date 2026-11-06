import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ChatView from '../components/messages/ChatView'
import ThreadList from '../components/messages/ThreadList'
import { useChat } from '../context/ChatContext'

const WIDE = '(min-width: 1024px)'

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches)
  useEffect(() => {
    const query = window.matchMedia(WIDE)
    const onChange = (e) => setWide(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return wide
}

/**
 * Messages: a split pane. The conversation list is on the left, the open conversation on the right.
 * Below 1024px one pane shows at a time, with a back link from the conversation.
 */
export default function MessagesPage() {
  const { threadId } = useParams()
  const { threads, thread } = useChat(threadId)
  const wide = useWide()

  // On a wide screen, open the most recent conversation straight away.
  if (!threadId && wide && threads.length > 0) return <Navigate to={`/messages/${threads[0].id}`} replace />

  const missing = threadId && !thread

  return (
    <main id="main" className="wrap messages-shell">
      <h1 className="sr-only">Messages</h1>

      <div className="grid h-full min-h-0 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-x-14">
        <div className={`min-h-0 overflow-y-auto ${threadId ? 'hidden lg:block' : ''}`}>
          <p className="label py-4 font-sans text-ink-soft">Messages</p>
          <ThreadList threads={threads} />
        </div>

        <div className={`min-h-0 ${threadId ? '' : 'hidden lg:block'}`}>
          {thread && <ChatView key={thread.id} threadId={thread.id} />}
          {missing && (
            <div className="py-16">
              <h2 className="headline">Conversation not found.</h2>
              <p className="measure mt-4 text-ink-soft">
                It may have been removed. <Link to="/messages" className="link text-ink">Back to messages</Link>
              </p>
            </div>
          )}
          {!threadId && (
            <div className="py-16">
              <h2 className="headline">Select a conversation.</h2>
              <p className="measure mt-4 text-ink-soft">Choose one from the list to read it and reply.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
