/** A small square plate (never a circle): the user's photograph if they set one, otherwise their initials. */
export default function Avatar({ user, size = 40 }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        aria-hidden="true"
        className="flex-none object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="label grid flex-none place-items-center bg-ink !tracking-[0.08em] text-paper"
      style={{ width: size, height: size }}
    >
      {user.initials}
    </span>
  )
}
