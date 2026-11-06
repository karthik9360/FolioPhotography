// DEMO ONLY. Stands in for the server call that records a like or a save.
// Replace the body with a real request; keep the contract: resolve on success, reject on failure,
// so the optimistic UI in useReactions can roll back.

const LATENCY_MS = 250

/** Stands in for saving a published post. Resolves after a short delay; reject to test the rollback. */
export function persistPost(post) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: post.id }), 450)
  })
}

export function persistReaction(kind, id, on) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ kind, id, on }), LATENCY_MS)
  })
}
