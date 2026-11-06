import FloatingField from '../../components/auth/FloatingField'
import Switch from '../../components/ui/Switch'
import { useAuth } from '../../context/AuthContext'
import { useUserTenant } from '../../context/TenantContext'
import { useSettingsManager } from '../../hooks/useSettingsManager'
import { rules } from '../../lib/validation'

/** Systemic, sensitive data: email, password, visibility. Never touches what the public profile shows. */
export default function AccountSettingsPage() {
  const { user, updateAccount } = useAuth()
  const { isPrivate, refreshDirectory } = useUserTenant()

  const form = useSettingsManager({
    initial: {
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isPrivate: isPrivate(user.handle),
    },
    rules: {
      email: (v) => rules.email(v),
      // Changing the email or the password needs the current password.
      currentPassword: (v, all, base) => {
        const sensitive = all.email.trim().toLowerCase() !== base.email.toLowerCase() || all.newPassword
        return sensitive && !v ? 'Enter your current password to confirm this change.' : ''
      },
      newPassword: (v) => (v ? rules.password(v) : ''),
      confirmPassword: (v, all) => (all.newPassword && v !== all.newPassword ? 'The passwords don’t match.' : ''),
    },
    successMessage: 'Account updated',
    onSave: async (v) => {
      await updateAccount({
        email: v.email,
        currentPassword: v.currentPassword,
        newPassword: v.newPassword || undefined,
        isPrivate: v.isPrivate,
      })
      refreshDirectory()
      // Passwords are never kept after saving.
      return { email: v.email.trim().toLowerCase(), currentPassword: '', newPassword: '', confirmPassword: '' }
    },
  })

  const { values, set, blur, shown, dirty, isDirty, nudges, saving, save, reset } = form
  const field = (key) => ({
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
      className="max-w-[30rem]"
    >
      <h2 className="headline">Email</h2>
      <p className="mt-2 text-ink-soft">The address you sign in with.</p>
      <div className="mt-6">
        <FloatingField label="Email address" name="email" type="email" autoComplete="email" {...field('email')} />
      </div>

      <h2 className="headline mt-16">Password</h2>
      <p className="mt-2 text-ink-soft">Your current password is needed to change your email or your password.</p>
      <div className="mt-6">
        <FloatingField
          label="Current password"
          name="current-password"
          type="password"
          autoComplete="current-password"
          {...field('currentPassword')}
        />
        <div className="mt-2">
          <FloatingField
            label="New password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            hint="At least 10 characters, with a letter and a number."
            {...field('newPassword')}
          />
        </div>
        <div className="mt-2">
          <FloatingField
            label="Confirm new password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            {...field('confirmPassword')}
          />
        </div>
      </div>

      <h2 className="headline mt-16">Visibility</h2>
      <div className="mt-2 border-y border-hairline">
        <Switch
          checked={values.isPrivate}
          onChange={(checked) => set('isPrivate', checked)}
          dirty={dirty.isPrivate}
          label="Private account"
          description="Only people who follow you can see your photographs and posts."
        />
      </div>

      <button type="submit" className="btn btn-primary btn-auth mt-12" disabled={!isDirty || saving} aria-busy={saving}>
        {saving ? 'Saving' : 'Save changes'}
      </button>
      <p className="mt-4 min-h-6">
        {isDirty && (
          <button type="button" className="link text-ink-soft" onClick={reset}>
            Discard changes
          </button>
        )}
      </p>
    </form>
  )
}
