/** An open circle that slides and fills into an accent mark when a proof is approved. The change takes 180ms. */
export default function StatusMark({ state }) {
  return <span className="mark" data-state={state} aria-hidden="true" />
}
