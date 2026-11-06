import { useRef } from 'react'

export const TABS = [
  { id: 'grid', label: 'Lookbook' },
  { id: 'series', label: 'Series' },
  { id: 'tagged', label: 'Tagged' },
]
export const tabId = (id) => `tab-${id}`
export const panelId = (id) => `panel-${id}`

/** WAI-ARIA tablist with roving tabindex and arrow-key navigation. */
export default function ProfileTabs({ value, onChange }) {
  const refs = useRef({})

  function onKeyDown(event) {
    const index = TABS.findIndex((t) => t.id === value)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TABS.length - 1
    else return
    event.preventDefault()
    onChange(TABS[next].id)
    refs.current[TABS[next].id]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      className="label"
      onKeyDown={onKeyDown}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            refs.current[tab.id] = el
          }}
          type="button"
          role="tab"
          id={tabId(tab.id)}
          aria-selected={value === tab.id}
          aria-controls={panelId(tab.id)}
          tabIndex={value === tab.id ? 0 : -1}
          className="tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
