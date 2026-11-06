/** Avatar for small sizes: the user's photograph if they set one, otherwise their initials. */
export default function Avatar({ user, size = 40 }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        aria-hidden="true"
        className="flex-none rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="caption grid flex-none place-items-center rounded-full bg-ink font-sans font-semibold text-paper"
      style={{ width: size, height: size }}
    >
      {user.initials}
    </span>
  )
}
