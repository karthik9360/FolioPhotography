import { useId, useState } from 'react'
import PostActions from './PostActions'
import PostBody from './PostBody'
import PostHeader from './PostHeader'
import PostMedia from './PostMedia'
import SharePanel from './SharePanel'
import { useAuth } from '../../context/AuthContext'
import { useSocial } from '../../context/SocialContext'
import { useUserTenant } from '../../context/TenantContext'
import { useNow } from '../../hooks/useNow'

/**
 * One post: header, media stage, action bar, then caption and comments.
 * No card chrome: posts are separated by space and a hairline, never boxed.
 * `actions` comes from useReactions (optimistic like and save).
 */
export default function PostCard({ post, actions, index = 0 }) {
  const { isLiked, isSaved, likeCount, commentsFor, addComment } = useSocial()
  const { user: me } = useAuth()
  const now = useNow()
  const regionId = useId()
  const [open, setOpen] = useState(false)
  // The share panel mounts the first time it is opened, so a long feed does not carry a dialog per post.
  const [shareOpen, setShareOpen] = useState(false)
  const [shareMounted, setShareMounted] = useState(false)

  const { profileFor, photoById } = useUserTenant()
  const author = profileFor(post.userHandle) ?? { handle: post.userHandle, name: post.userHandle, initials: '?' }
  const photos = post.photoIds.map(photoById)
  const comments = commentsFor(post.id)

  function openShare() {
    setShareMounted(true)
    setShareOpen(true)
  }

  return (
    <article
      id={post.id}
      aria-label={`Post by ${author.handle}`}
      className="rise mb-5 pb-5 last:mb-0"
      style={{ '--i': index % 4 }}
    >
      <PostHeader author={author} location={post.location} isSelf={me?.handle === author.handle} />

      <div className="mt-4">
        <PostMedia
          ratio={post.ratio}
          photos={photos}
          label={`Photographs by ${author.name}`}
          onDoubleTap={() => actions.likeOnce(post.id)}
        />
      </div>

      <div className="mt-2">
        <PostActions
          liked={isLiked(post.id)}
          saved={isSaved(post.id)}
          commentsOpen={open}
          commentsId={regionId}
          onLike={() => actions.toggleLike(post.id)}
          onSave={() => actions.toggleSave(post.id)}
          onComment={() => setOpen((v) => !v)}
          onShare={openShare}
        />
      </div>

      <PostBody
        post={post}
        handle={author.handle}
        likes={likeCount(post)}
        comments={comments}
        now={now}
        open={open}
        regionId={regionId}
        onToggleComments={() => setOpen((v) => !v)}
        onAddComment={(text) => addComment(post.id, text)}
      />

      {shareMounted && (
        <SharePanel
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          post={post}
          author={author}
          cover={photos[0]}
          count={photos.length}
        />
      )}
    </article>
  )
}
