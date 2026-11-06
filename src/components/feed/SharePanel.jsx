import { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sheet from '../ui/Sheet'
import Avatar from './Avatar'
import { site } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../ui/Toast'
import { useUserTenant } from '../../context/TenantContext'

const enc = encodeURIComponent
const isLocalAddress = () => /^(localhost|127\.|10\.|192\.168\.|\[::1\])/.test(window.location.hostname)

/**
 * Share a post: into a conversation here, or out to other apps (WhatsApp, Telegram, X, Facebook,
 * email, your device's own share sheet) with a link to the post.
 */
export default function SharePanel({ open, onClose, post, author, cover, count }) {
  const { status } = useAuth()
  const { threads, shareToThread } = useChat()
  const { profileFor } = useUserTenant()
  const toast = useToast()
  const [sent, setSent] = useState(() => new Set())
  const [copied, setCopied] = useState('')

  const url = `${window.location.origin}/post/${post.id}`
  const snippet = post.caption.length > 100 ? `${post.caption.slice(0, 97)}…` : post.caption
  const text = `${author.handle} on ${site.name}${snippet ? `: ${snippet}` : ''}`
  const canNativeShare = typeof navigator.share === 'function'

  const targets = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: 'Email', href: `mailto:?subject=${enc(text)}&body=${enc(`${text}\n\n${url}`)}`, same: true },
  ]

  function sendTo(thread) {
    if (sent.has(thread.id)) return
    shareToThread(thread.id, {
      id: post.id,
      handle: author.handle,
      caption: post.caption,
      thumb: cover.thumb,
      count,
    })
    setSent((prev) => new Set(prev).add(thread.id))
    const person = profileFor(thread.with)
    toast.show(`Sent to ${person?.name ?? thread.with}`)
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: text, text, url })
    } catch {
      /* closed without choosing: nothing to do */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied('Link copied')
    } catch {
      setCopied('Couldn’t copy the link')
    }
    setTimeout(() => setCopied(''), 2400)
  }

  return (
    <Sheet open={open} onClose={onClose} label="Share post">
      <div className="drawer-panel">
        <div className="px-6 py-4 md:px-10 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="headline">Share</h2>
            <button type="button" className="icon-btn -mr-3 -mt-2" aria-label="Close share panel" onClick={onClose}>
              <X size={22} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <img src={cover.thumb} alt="" className="h-16 w-12 flex-none object-cover" />
            <div className="min-w-0">
              <p className="font-medium">{author.handle}</p>
              <p className="caption line-clamp-2 text-ink-soft">{post.caption}</p>
            </div>
          </div>

          <section className="mt-4" aria-labelledby="share-message-title">
            <h3 id="share-message-title" className="label text-ink-soft">
              Send in a message
            </h3>
            {status !== 'authenticated' ? (
              <p className="mt-3 text-ink-soft">
                <Link to="/auth/login" className="link text-ink">Sign in</Link> to send this in a message.
              </p>
            ) : threads.length === 0 ? (
              <p className="mt-3 text-ink-soft">No conversations yet. Message someone from their profile first.</p>
            ) : (
              <ul className="mt-2 border-t border-hairline">
                {threads.map((thread) => {
                  const person = profileFor(thread.with) ?? { handle: thread.with, name: thread.with, initials: '?' }
                  const done = sent.has(thread.id)
                  return (
                    <li key={thread.id} className="flex items-center gap-3 border-b border-hairline py-3">
                      <Avatar user={person} size={40} />
                      <span className="min-w-0 flex-1 truncate">{person.name}</span>
                      <button
                        type="button"
                        className="nav-link label"
                        disabled={done}
                        aria-label={`${done ? 'Sent to' : 'Send to'} ${person.name}`}
                        onClick={() => sendTo(thread)}
                      >
                        {done ? 'Sent' : 'Send'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="mt-4" aria-labelledby="share-apps-title">
            <h3 id="share-apps-title" className="label text-ink-soft">
              Share to other apps
            </h3>
            <ul className="mt-2 border-t border-hairline">
              {canNativeShare && (
                <li className="border-b border-hairline">
                  <button type="button" className="share-link" onClick={nativeShare}>
                    <span>Share via your device…</span>
                    <ArrowUpRight size={18} strokeWidth={1.25} aria-hidden="true" />
                  </button>
                </li>
              )}
              {targets.map((target) => (
                <li key={target.name} className="border-b border-hairline">
                  <a
                    className="share-link"
                    href={target.href}
                    {...(target.same ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span>{target.name}</span>
                    <ArrowUpRight size={18} strokeWidth={1.25} aria-hidden="true" />
                  </a>
                </li>
              ))}
              <li className="border-b border-hairline">
                <button type="button" className="share-link" onClick={copy}>
                  <span>Copy link</span>
                  <span className="caption text-ink-soft" aria-live="polite">
                    {copied}
                  </span>
                </button>
              </li>
            </ul>
            <p className="caption mt-4 break-all text-ink-soft">{url}</p>
            {isLocalAddress() && (
              <p className="caption mt-2 font-medium">
                This is a local address, so people on other devices can’t open it until the site is published.
              </p>
            )}
          </section>
        </div>
      </div>
    </Sheet>
  )
}
