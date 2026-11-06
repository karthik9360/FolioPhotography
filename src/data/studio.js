// Synthetic demonstration data for the studio pipeline: two campaigns, their invoices, and the proofs
// from the first one. Nothing here is a real client, invoice or amount.

import { photos } from './photos'

export const PHOTOGRAPHER_HANDLE = 'studio_karthik'
export const DAY = 86_400_000

export function seedStudio() {
  const now = Date.now()
  const proofPhotos = photos.filter((p) => p.userHandle === PHOTOGRAPHER_HANDLE).slice(0, 8)

  return {
    campaigns: [
      {
        id: 'c-monsoon',
        title: 'Monsoon Edit',
        season: 'Autumn/Winter',
        clientHandle: 'vogue_editorial', // the demo client account
        clientName: 'Editorial Desk',
        tier: 'Campaign',
        retainer: 150000,
      },
      {
        id: 'c-atelier',
        title: 'Atelier Nine lookbook',
        season: 'Spring/Summer',
        clientHandle: null, // a client with no portal account in this demo
        clientName: 'Atelier Nine',
        tier: 'Lookbook',
        retainer: 90000,
      },
    ],
    invoices: [
      { id: 'inv-1', campaignId: 'c-monsoon', number: 'INV-001', title: 'Production retainer', amount: 150000, issuedAt: now - 20 * DAY, dueAt: now - 10 * DAY, status: 'paid', paidAt: now - 12 * DAY, paidVia: 'UPI' },
      { id: 'inv-2', campaignId: 'c-monsoon', number: 'INV-002', title: 'Shoot days (three)', amount: 240000, issuedAt: now - 3 * DAY, dueAt: now + 11 * DAY, status: 'issued' },
      { id: 'inv-3', campaignId: 'c-monsoon', number: '', title: 'Retouching and final delivery', amount: 180000, issuedAt: null, dueAt: now + 35 * DAY, status: 'draft' },
      { id: 'inv-4', campaignId: 'c-atelier', number: 'INV-003', title: 'Production retainer', amount: 90000, issuedAt: now - 15 * DAY, dueAt: now - 1 * DAY, status: 'issued' },
    ],
    proofs: proofPhotos.map((photo, i) => ({
      id: `proof-${i + 1}`,
      campaignId: 'c-monsoon',
      photoId: photo.id,
      status: i < 2 ? 'approved' : 'open',
      notes:
        i === 3
          ? [{ id: 'note-1', author: 'vogue_editorial', role: 'client', text: 'Lift the shadows a little on the left side.', at: now - DAY }]
          : [],
    })),
    deliveries: {},
  }
}
