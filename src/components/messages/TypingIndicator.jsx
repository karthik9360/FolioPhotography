/** Three quiet dots that rise in turn. The wrapper reserves its height, so showing it never moves the thread. */
export default function TypingIndicator({ name }) {
  return (
    <span className="typing" role="status" aria-label={`${name} is typing`}>
      <i />
      <i />
      <i />
    </span>
  )
}
