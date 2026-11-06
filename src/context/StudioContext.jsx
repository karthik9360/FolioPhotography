import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '../components/ui/Toast'
import { useTopProgress } from '../components/ui/TopProgress'
import { DAY, seedStudio } from '../data/studio'

/*
 * useStudioPipeline: the single source of truth for the photographer-client pipeline (campaigns,
 * invoices, proofs, notes, deliveries), shared by all three roles. Every action updates the state
 * first (optimistic), then runs a short mock "request", and rolls back with a toast if it fails.
 * It is saved to localStorage, so it survives reloads and switching roles.
 *
 * Payments are SIMULATED. No money moves and no UPI or card details are stored.
 */

const KEY = 'folio.studio.v1'
const MOCK_MS = 350
const GATEWAY_MS = 1500
const UPI_ID = /^[a-z0-9._-]{2,}@[a-z]{2,}$/i

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const sum = (list) => list.reduce((n, item) => n + item.amount, 0)

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved?.campaigns) {
      // A delivery that was mid-way when the page closed cannot resume: drop it.
      const deliveries = Object.fromEntries(
        Object.entries(saved.deliveries ?? {}).filter(([, d]) => d.status === 'delivered'),
      )
      return { ...saved, deliveries }
    }
  } catch {
    /* fall through to the seed */
  }
  return seedStudio()
}

const StudioContext = createContext(null)

function nextNumber(state) {
  const highest = Math.max(0, ...state.invoices.map((i) => Number(i.number.replace(/\D/g, '')) || 0))
  return `INV-${String(highest + 1).padStart(3, '0')}`
}

export function StudioProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const progress = useTopProgress()
  const [state, setState] = useState(load)
  const stateRef = useRef(state)
  stateRef.current = state
  const timers = useRef([])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])
  useEffect(() => () => timers.current.forEach(clearInterval), [])

  /** Applies `next` now, runs `request`, and restores the previous state if the request fails. */
  const optimistic = useCallback(
    async (next, request, failure) => {
      const previous = stateRef.current
      setState(next)
      try {
        await request()
        return { ok: true }
      } catch (error) {
        setState(previous)
        toast.show(failure, 'error')
        return { ok: false, message: error?.message ?? failure }
      }
    },
    [toast],
  )

  /* ------------------------------ invoices ------------------------------ */

  /** Issue a new invoice, or issue an existing draft by passing `draftId`. */
  const issueInvoice = useCallback(
    async ({ campaignId, title, amount, dueInDays = 14, draftId }) => {
      const now = Date.now()
      if (draftId) {
        return optimistic(
          (s) => ({
            ...s,
            invoices: s.invoices.map((i) =>
              i.id === draftId ? { ...i, status: 'issued', issuedAt: now, dueAt: now + dueInDays * DAY, number: nextNumber(s) } : i,
            ),
          }),
          () => wait(MOCK_MS),
          'Couldn’t issue that invoice.',
        )
      }
      if (!title?.trim() || !(Number(amount) > 0)) return { ok: false, message: 'Add a title and an amount above zero.' }
      const invoice = {
        id: crypto.randomUUID(),
        campaignId,
        number: '',
        title: title.trim(),
        amount: Math.round(Number(amount)),
        issuedAt: now,
        dueAt: now + dueInDays * DAY,
        status: 'issued',
      }
      return optimistic(
        (s) => ({ ...s, invoices: [...s.invoices, { ...invoice, number: nextNumber(s) }] }),
        () => wait(MOCK_MS),
        'Couldn’t issue that invoice.',
      )
    },
    [optimistic],
  )

  /** The photographer's "Invoice paid" switch. */
  const setInvoicePaid = useCallback(
    (invoiceId, paid) =>
      optimistic(
        (s) => ({
          ...s,
          invoices: s.invoices.map((i) =>
            i.id === invoiceId
              ? { ...i, status: paid ? 'paid' : 'issued', paidAt: paid ? Date.now() : null, paidVia: paid ? 'Marked by photographer' : null }
              : i,
          ),
        }),
        () => wait(MOCK_MS),
        'Couldn’t update that invoice.',
      ),
    [optimistic],
  )

  /** The client's simulated UPI payment. Use an id starting with "decline" to see a declined payment. */
  const payInvoice = useCallback(async (invoiceId, { upiId }) => {
    if (!UPI_ID.test(upiId ?? '')) return { ok: false, message: 'Enter a UPI ID like name@bank.' }
    const previous = stateRef.current
    setState((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, status: 'processing' } : i)) }))
    await wait(GATEWAY_MS) // the simulated gateway validating the payment
    if (upiId.toLowerCase().startsWith('decline')) {
      setState(previous)
      return { ok: false, message: 'The simulated gateway declined this payment. Try another UPI ID.' }
    }
    const reference = `SIM${Date.now().toString(36).toUpperCase()}`
    setState((s) => ({
      ...s,
      invoices: s.invoices.map((i) =>
        i.id === invoiceId ? { ...i, status: 'paid', paidAt: Date.now(), paidVia: 'UPI (simulated)', reference } : i,
      ),
    }))
    return { ok: true, reference }
  }, [])

  const updatePackage = useCallback(
    (campaignId, { tier, retainer }) =>
      optimistic(
        (s) => ({
          ...s,
          campaigns: s.campaigns.map((c) => (c.id === campaignId ? { ...c, tier, retainer: Math.round(Number(retainer)) || c.retainer } : c)),
        }),
        () => wait(MOCK_MS),
        'Couldn’t update that package.',
      ),
    [optimistic],
  )

  /* ------------------------------- proofs ------------------------------- */

  const submitProofFeedback = useCallback(
    (proofId, text) => {
      const body = text.trim()
      if (!body) return Promise.resolve({ ok: false, message: 'Write a note first.' })
      const note = { id: crypto.randomUUID(), author: user?.handle ?? 'unknown', role: user?.role ?? 'client', text: body, at: Date.now() }
      return optimistic(
        (s) => ({ ...s, proofs: s.proofs.map((p) => (p.id === proofId ? { ...p, notes: [...p.notes, note] } : p)) }),
        () => wait(MOCK_MS),
        'Couldn’t send that note.',
      )
    },
    [optimistic, user],
  )

  const approveAssetBatch = useCallback(
    (proofIds) => {
      const ids = new Set(proofIds)
      if (ids.size === 0) return Promise.resolve({ ok: false, message: 'Select at least one proof.' })
      return optimistic(
        (s) => ({ ...s, proofs: s.proofs.map((p) => (ids.has(p.id) ? { ...p, status: 'approved', approvedAt: Date.now() } : p)) }),
        () => wait(MOCK_MS),
        'Couldn’t approve those proofs.',
      )
    },
    [optimistic],
  )

  /* ------------------------------ delivery ------------------------------ */

  /** The photographer publishes the approved files to the client. Shows progress on the top strip. */
  const deliverFinalCampaign = useCallback(
    async (campaignId) => {
      const approved = stateRef.current.proofs.filter((p) => p.campaignId === campaignId && p.status === 'approved')
      if (approved.length === 0) return { ok: false, message: 'Approve at least one proof before delivering.' }

      setState((s) => ({ ...s, deliveries: { ...s.deliveries, [campaignId]: { status: 'generating', progress: 0 } } }))
      progress.start()
      await new Promise((resolve) => {
        let value = 0
        const id = setInterval(() => {
          value = Math.min(1, value + 0.07 + Math.random() * 0.05)
          progress.set(value)
          setState((s) => ({ ...s, deliveries: { ...s.deliveries, [campaignId]: { status: 'generating', progress: value } } }))
          if (value >= 1) {
            clearInterval(id)
            resolve()
          }
        }, 140)
        timers.current.push(id)
      })
      setState((s) => ({
        ...s,
        deliveries: { ...s.deliveries, [campaignId]: { status: 'delivered', progress: 1, deliveredAt: Date.now(), photoIds: approved.map((p) => p.photoId) } },
      }))
      progress.finish()
      toast.show(`Delivered ${approved.length} ${approved.length === 1 ? 'file' : 'files'} to the client`)
      return { ok: true }
    },
    [progress, toast],
  )

  const resetDemo = useCallback(() => setState(seedStudio()), [])

  /* ------------------------------ selectors ------------------------------ */

  const value = useMemo(() => {
    const campaignsFor = (role, handle) =>
      role === 'client' ? state.campaigns.filter((c) => c.clientHandle === handle) : state.campaigns
    const invoicesFor = (campaignId) => state.invoices.filter((i) => i.campaignId === campaignId)
    const proofsFor = (campaignId) => state.proofs.filter((p) => p.campaignId === campaignId)
    const summary = (campaignId) => {
      const invoices = invoicesFor(campaignId)
      const campaign = state.campaigns.find((c) => c.id === campaignId)
      return {
        retainer: campaign?.retainer ?? 0,
        paid: sum(invoices.filter((i) => i.status === 'paid')),
        outstanding: sum(invoices.filter((i) => i.status === 'issued' || i.status === 'processing')),
        upcoming: sum(invoices.filter((i) => i.status === 'draft')),
      }
    }
    return {
      campaigns: state.campaigns,
      invoices: state.invoices,
      proofs: state.proofs,
      deliveries: state.deliveries,
      campaignsFor,
      invoicesFor,
      proofsFor,
      summary,
      issueInvoice,
      setInvoicePaid,
      payInvoice,
      updatePackage,
      submitProofFeedback,
      approveAssetBatch,
      deliverFinalCampaign,
      resetDemo,
    }
  }, [state, issueInvoice, setInvoicePaid, payInvoice, updatePackage, submitProofFeedback, approveAssetBatch, deliverFinalCampaign, resetDemo])

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudioPipeline() {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudioPipeline must be used inside StudioProvider')
  return ctx
}
