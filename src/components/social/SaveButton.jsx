import { Bookmark } from 'lucide-react'
import { useSocial } from '../../context/SocialContext'

// Saves to a single local list for now; mood boards are a later step.
export default function SaveButton({ photo }) {
  const { isSaved, toggleSave } = useSocial()
  return (
    <button
      type="button"
      className="toggle-icon inline-flex h-11 items-center gap-2"
      aria-pressed={isSaved(photo.id)}
      aria-label="Save to mood board"
      onClick={() => toggleSave(photo.id)}
    >
      <Bookmark size={20} strokeWidth={1.25} aria-hidden="true" />
      <span className="label">Save</span>
    </button>
  )
}
