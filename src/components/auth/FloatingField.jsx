import { useId, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNudge } from '../../hooks/useNudge'

/**
 * Floating-label field: no box, a hairline underline, and a signal line that draws in on focus.
 * The message line below always reserves its height, so errors never shift the layout.
 *  - `nudge`: increment on a failed attempt to play the 4px nudge.
 *  - `dirty`: the value differs from what is saved; the baseline turns signal blue.
 *  - `multiline`: a textarea (bio, caption). `counter={{ max }}` shows "length/max".
 */
export default function FloatingField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error = '',
  status = '',
  hint = '',
  nudge = 0,
  dirty = false,
  multiline = false,
  counter,
  inputRef,
  ...rest
}) {
  const id = useId()
  const wrapRef = useRef(null)
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const Control = multiline ? 'textarea' : 'input'
  useNudge(wrapRef, nudge)

  const message = error || status || hint
  const tone = error ? 'error' : status ? 'status' : 'hint'

  return (
    <div>
      <div
        ref={wrapRef}
        className={`float-field${multiline ? ' float-field--area' : ''}`}
        data-invalid={Boolean(error)}
        data-dirty={dirty}
      >
        <Control
          id={id}
          ref={inputRef}
          className={`float-input${isPassword ? ' float-input--toggle' : ''}${multiline ? ' float-input--area' : ''}`}
          type={multiline ? undefined : isPassword && reveal ? 'text' : type}
          rows={multiline ? 3 : undefined}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-msg`}
          {...rest}
        />
        <label htmlFor={id} className="float-label">
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            className="float-toggle"
            aria-pressed={reveal}
            aria-label="Show password"
            onClick={() => setReveal((v) => !v)}
          >
            {reveal ? (
              <EyeOff size={18} strokeWidth={1.25} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.25} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <p id={`${id}-msg`} className="float-msg" data-tone={tone} aria-live="polite">
          {message || ' '}
        </p>
        {counter && (
          <span className="data float-msg shrink-0 tabular-nums" aria-hidden="true">
            {String(value).length}/{counter.max}
          </span>
        )}
      </div>
    </div>
  )
}
