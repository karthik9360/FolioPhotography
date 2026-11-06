import { useCallback, useState } from 'react'
import { useToast } from '../components/ui/Toast'

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * One controller for a settings form: current values, a baseline of what is saved, a per-field
 * dirty map (for the unsaved-change underline), validation, and an optimistic save.
 *
 *  - rules[field](value, values, baseline) returns a message, or '' when fine.
 *  - Errors show once a field has been left, then update live as the user types.
 *  - save() flips the baseline and fires the success toast straight away, then calls
 *    onSave(values, previousBaseline). If that throws, the baseline is restored and an error
 *    toast fires. onSave may return a patch (for example, clearing password fields).
 */
export function useSettingsManager({ initial, rules = {}, onSave, successMessage = 'Changes saved' }) {
  const toast = useToast()
  const [baseline, setBaseline] = useState(initial)
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [nudges, setNudges] = useState({})
  const [saving, setSaving] = useState(false)

  const dirty = Object.fromEntries(Object.keys(values).map((k) => [k, !same(values[k], baseline[k])]))
  const isDirty = Object.values(dirty).some(Boolean)

  const errors = {}
  for (const key of Object.keys(rules)) {
    const message = serverErrors[key] || rules[key](values[key], values, baseline)
    if (message) errors[key] = message
  }
  const shown = (key) => (touched[key] ? errors[key] ?? '' : '')

  const set = useCallback((key, value) => {
    setValues((v) => ({ ...v, [key]: value }))
    setServerErrors((e) => (e[key] ? { ...e, [key]: '' } : e))
  }, [])
  const blur = useCallback((key) => setTouched((t) => ({ ...t, [key]: true })), [])

  const reset = useCallback(() => {
    setValues(baseline)
    setTouched({})
    setServerErrors({})
  }, [baseline])

  async function save() {
    if (saving) return false
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])))

    const bad = Object.keys(errors)
    if (bad.length) {
      setNudges((n) => ({ ...n, ...Object.fromEntries(bad.map((k) => [k, (n[k] ?? 0) + 1])) }))
      return false
    }
    if (!isDirty) return true

    const previous = baseline
    const submitted = values
    setSaving(true)
    setBaseline(submitted) // optimistic: the unsaved marks clear at once
    toast.show(successMessage)
    try {
      const patch = await onSave(submitted, previous)
      if (patch) {
        setValues((v) => ({ ...v, ...patch }))
        setBaseline((b) => ({ ...b, ...patch }))
      }
      return true
    } catch (error) {
      setBaseline(previous) // roll back
      if (error?.field) {
        setServerErrors((e) => ({ ...e, [error.field]: error.message }))
        setTouched((t) => ({ ...t, [error.field]: true }))
      }
      toast.show(error?.message ?? 'Couldn’t save your changes.', 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { values, set, blur, shown, dirty, isDirty, nudges, saving, save, reset }
}
