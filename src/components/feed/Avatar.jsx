/** A small rounded-square plate (never a circle): the user's photograph if they set one, otherwise their initials. */
export default function Avatar({ user, size = 40 }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        aria-hidden="true"
        className="rounded-tile flex-none object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="label rounded-tile grid flex-none place-items-center bg-signal !tracking-[0.06em] text-on-accent"
      style={{ width: size, height: size }}
    >
      {user.initials}
    </span>
  )
}
