import { useParams } from 'react-router-dom'
import PostCard from '../components/feed/PostCard'
import NotFoundPage from './NotFoundPage'
import { useUserTenant } from '../context/TenantContext'
import { useReactions } from '../hooks/useSocialFeed'

/** A single post at its own address, which is what the Share button copies. */
export default function PostPage() {
  const { postId } = useParams()
  const { postById } = useUserTenant()
  const post = postById(postId)
  const actions = useReactions()

  if (!post) return <NotFoundPage />

  return (
    <main id="main" className="wrap pt-4 md:pt-5">
      <h1 className="sr-only">Post</h1>
      <div className="mx-auto max-w-[540px]">
        <PostCard post={post} actions={actions} />
      </div>
    </main>
  )
}
