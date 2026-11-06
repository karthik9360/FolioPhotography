import { useEffect, useState } from 'react'
import FloatingField from '../../components/auth/FloatingField'
import AvatarDrop from '../../components/settings/AvatarDrop'
import CategoryTags from '../../components/settings/CategoryTags'
import ProfilePreview from '../../components/settings/ProfilePreview'
import { useAuth } from '../../context/AuthContext'
import { initialsOf, useUserTenant } from '../../context/TenantContext'
import { useSettingsManager } from '../../hooks/useSettingsManager'
import { normalizeHandle, rules } from '../../lib/validation'

const IDLE = { status: 'idle', for: '' }
const BIO_LIMIT = 150

/** External brand and identity: avatar, name, handle, bio, categories. A live preview sits beside the form. */
export default function ProfileSettingsPage() {
  const { user, updateProfile, checkHandle } = useAuth()
  const tenant = useUserTenant()
  const profile = tenant.profileFor(user.handle)
  const handleLocked = Boolean(profile?.isSeeded) // seeded demo profiles keep their handle
  const [handleState, setHandleState] = useState(IDLE)

  const form = useSettingsManager({
    initial: {
      name: profile?.name ?? user.name,
      handle: user.handle,
      bio: profile?.bio ?? '',
      categories: profile?.categories ?? [],
      avatar: profile?.avatarUrl ?? '',
    },
    rules: {
      name: (v) => rules.name(v),
      handle: (v, all, base) => {
        if (handleLocked) return ''
        const next = normalizeHandle(v)
        const taken = next !== base.handle && handleState.status === 'taken' && handleState.for === next
        return rules.handle(v) || (taken ? 'That handle is taken. Try another.' : '')
      },
      bio: (v) => (v.length > BIO_LIMIT ? `Keep your bio to ${BIO_LIMIT} characters.` : ''),
      // Categories are optional: a new profile starts with none, and a rename must still be savable.
    },
    successMessage: 'Profile updated',
    onSave: async (v, previous) => {
      await updateProfile({ name: v.name, handle: v.handle, bio: v.bio, categories: v.categories, avatar: v.avatar })
      const next = normalizeHandle(v.handle)
      tenant.refreshDirectory()
      if (next !== previous.handle) tenant.renameHandle(previous.handle, next)
      return { handle: next }
    },
  })

  const { values, set, blur, shown, dirty, isDirty, nudges, saving, save, reset } = form
  const nextHandle = normalizeHandle(values.handle)

  // Live availability check for a changed handle.
  useEffect(() => {
    if (handleLocked || nextHandle === user.handle || rules.handle(nextHandle)) {
      setHandleState(IDLE)
      return undefined
    }
    setHandleState({ status: 'checking', for: nextHandle })
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const { available } = await checkHandle(nextHandle)
        if (!cancelled) setHandleState({ status: available ? 'available' : 'taken', for: nextHandle })
      } catch {
        if (!cancelled) setHandleState(IDLE)
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [nextHandle, user.handle, handleLocked, checkHandle])

  // A taken handle is the result of a live check, so it shows the moment it comes back.
  const handleTakenNow = handleState.status === 'taken' && handleState.for === nextHandle
  const handleStatus =
    handleState.status === 'checking' && handleState.for === nextHandle
      ? 'Checking availability…'
      : handleState.status === 'available' && handleState.for === nextHandle
        ? `@${nextHandle} is available.`
        : ''

  const textField = (key) => ({
    value: values[key],
    onChange: (e) => set(key, e.target.value),
    onBlur: () => blur(key),
    error: shown(key),
    dirty: dirty[key],
    nudge: nudges[key],
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      noValidate
      className="grid gap-x-20 gap-y-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
    >
      <div>
        <AvatarDrop
          value={values.avatar}
          initials={initialsOf(values.name)}
          dirty={dirty.avatar}
          onChange={(url) => set('avatar', url)}
        />

        <div className="mt-4">
          <FloatingField label="Display name" name="name" autoComplete="name" {...textField('name')} />
        </div>
        <div className="mt-2">
          <FloatingField
            label="Username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={handleLocked}
            status={handleStatus}
            hint={handleLocked ? 'Demo profiles keep their handle.' : 'This is your address: /handle'}
            {...textField('handle')}
            error={shown('handle') || (handleTakenNow ? 'That handle is taken. Try another.' : '')}
          />
        </div>
        <div className="mt-5">
          <FloatingField
            label="Biography"
            name="bio"
            multiline
            maxLength={BIO_LIMIT}
            counter={{ max: BIO_LIMIT }}
            {...textField('bio')}
          />
        </div>
        <div className="mt-4">
          <CategoryTags
            value={values.categories}
            dirty={dirty.categories}
            error={shown('categories')}
            onBlur={() => blur('categories')}
            onChange={(next) => {
              set('categories', next)
              blur('categories')
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-auth mt-4" disabled={!isDirty || saving} aria-busy={saving}>
          {saving ? 'Saving' : 'Save profile'}
        </button>
        <p className="mt-4 min-h-6">
          {isDirty && (
            <button type="button" className="link text-ink-soft" onClick={reset}>
              Discard changes
            </button>
          )}
        </p>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Profile preview">
        <ProfilePreview
          name={values.name}
          handle={nextHandle || user.handle}
          bio={values.bio}
          categories={values.categories}
          avatar={values.avatar}
          initials={initialsOf(values.name)}
          photos={tenant.photosFor(user.handle)}
        />
      </aside>
    </form>
  )
}
