import { useEffect, useRef } from 'react'
import { useNudge } from '../../hooks/useNudge'

/**
 * Segmented one-time-code input. Controlled: `digits` is an array of single characters or ''.
 * Handles typing (auto-advance), Backspace (steps back), arrow keys, paste, and one-time-code autofill.
 * Calls `onComplete(code)` when the last cell is filled.
 */
export default function OtpInput({
  digits,
  onChange,
  onComplete,
  invalid = false,
  nudge = 0,
  disabled = false,
  autoFocus = false,
  focusSignal = 0, // change it to pull focus back to the first cell (after a failed attempt)
  label = 'Verification code',
}) {
  const length = digits.length
  const refs = useRef([])
  const groupRef = useRef(null)
  useNudge(groupRef, nudge)

  const focusAt = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus, focusSignal])

  function commit(next, focusIndex) {
    onChange(next)
    if (focusIndex != null) focusAt(focusIndex)
    if (next.every(Boolean)) onComplete?.(next.join(''))
  }

  function fill(start, text) {
    const next = digits.slice()
    const chunk = text.slice(0, length - start)
    chunk.split('').forEach((d, k) => {
      next[start + k] = d
    })
    commit(next, Math.min(start + chunk.length, length - 1))
  }

  function handleChange(i, event) {
    const incoming = event.target.value.replace(/\D/g, '')
    if (!incoming) {
      const next = digits.slice()
      next[i] = ''
      commit(next)
      return
    }
    // Typing over a filled cell yields two characters: keep the new one.
    if (digits[i] && incoming.length === 2) {
      const typed = incoming.replace(digits[i], '').slice(0, 1) || digits[i]
      fill(i, typed)
      return
    }
    fill(i, incoming) // one digit, or a whole code from autofill
  }

  function handleKeyDown(i, event) {
    if (event.key === 'Backspace' && !digits[i] && i > 0) {
      event.preventDefault()
      const next = digits.slice()
      next[i - 1] = ''
      onChange(next)
      focusAt(i - 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(i - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(i + 1)
    }
  }

  function handlePaste(i, event) {
    const text = (event.clipboardData.getData('text') || '').replace(/\D/g, '')
    if (!text) return
    event.preventDefault()
    fill(text.length >= length ? 0 : i, text)
  }

  return (
    <div role="group" aria-label={label} className="otp-grid" ref={groupRef}>
      {digits.map((digit, i) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="otp-cell"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label}, digit ${i + 1} of ${length}`}
          aria-invalid={invalid}
          data-filled={Boolean(digit)}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}
