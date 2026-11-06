const STATUS = { sent: 'Sent', delivered: 'Delivered', read: 'Read' }

const clock = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

/** Photographs shared in a message, laid out by count. No borders: the images set their own edges. */
function Attachments({ items }) {
  return (
    <div className={`attach attach--${Math.min(items.length, 4)}`}>
      {items.map((item) => (
        <img key={item.id} src={item.url} alt={item.alt ?? 'Shared photograph'} width={item.w} height={item.h} loading="lazy" decoding="async" />
      ))}
    </div>
  )
}

/**
 * One message. Text sits in a plain block (ink for yours, wash for theirs); shared photographs
 * show above it. The latest message of yours carries its delivery state in micro-typography.
 */
export default function MessageBubble({ message, own, index, showStatus }) {
  return (
    <li className={`msg-in flex flex-col gap-1 ${own ? 'items-end' : 'items-start'}`} style={{ '--i': Math.min(index, 8) }}>
      {message.attachments.length > 0 && <Attachments items={message.attachments} />}
      {message.text && <p className={`msg${own ? ' msg--own' : ''}`}>{message.text}</p>}
      <p className="caption text-ink-soft">
        {clock(message.createdAt)}
        {own && showStatus && (
          <>
            {' · '}
            <span className="label">{STATUS[message.status]}</span>
          </>
        )}
      </p>
    </li>
  )
}
