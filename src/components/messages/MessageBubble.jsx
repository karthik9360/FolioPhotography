import { Link } from 'react-router-dom'

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

/** A feed post shared into the conversation: a thumbnail, who made it, and a way to open it. */
function SharedPost({ post, own }) {
  return (
    <Link to={`/post/${post.id}`} className={`shared-post${own ? ' shared-post--own' : ''}`}>
      <img src={post.thumb} alt="" width={56} height={70} loading="lazy" decoding="async" />
      <span className="min-w-0">
        <span className="block font-medium">@{post.handle}</span>
        <span className="caption line-clamp-2 block">{post.caption}</span>
        <span className="label mt-1 block">
          View post{post.count > 1 ? ` · ${post.count} photographs` : ''}
        </span>
      </span>
    </Link>
  )
}

/**
 * One message. Text sits in a plain block (ink for yours, wash for theirs); shared photographs and
 * shared posts show with it. The latest message of yours carries its delivery state in micro-type.
 */
export default function MessageBubble({ message, own, index, showStatus }) {
  return (
    <li className={`msg-in flex flex-col gap-1 ${own ? 'items-end' : 'items-start'}`} style={{ '--i': Math.min(index, 8) }}>
      {message.attachments.length > 0 && <Attachments items={message.attachments} />}
      {message.sharedPost && <SharedPost post={message.sharedPost} own={own} />}
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
