// Filtration for the Explore index. Pure functions over plain arrays, so the page can run them inside
// a React transition and they are easy to test.
//
// Matching: the query is split into words; every word must appear somewhere in the searched fields
// (case and accents ignored). An empty query matches nothing: the index opens blank on purpose.

const fold = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')

export const wordsOf = (query) => fold(query).split(/\s+/).filter(Boolean)

const hasAll = (haystack, words) => words.every((word) => haystack.includes(word))

export const RESULT_LIMIT = 60

/**
 * Photographers. Searches handle, name, bio, location, specialty and categories.
 * Ranking: a handle that starts with the first word, then a name that does, then everything else.
 */
export function searchPhotographers(profiles, query, limit = RESULT_LIMIT) {
  const words = wordsOf(query)
  if (words.length === 0) return []
  return profiles
    .filter((p) => hasAll(fold([p.handle, p.name, p.bio, p.location, p.specialty, ...(p.categories ?? [])].join(' ')), words))
    .map((p) => ({ p, rank: fold(p.handle).startsWith(words[0]) ? 0 : fold(p.name).startsWith(words[0]) ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || a.p.handle.localeCompare(b.p.handle))
    .slice(0, limit)
    .map((entry) => entry.p)
}

/**
 * Feeds. Each row is `{ id, title, handle, category, series, location, caption, tags, ... }`.
 * Searches title, handle, category, series, location, caption and tags. Newest first is the caller's order.
 */
export function searchFeeds(rows, query, limit = RESULT_LIMIT) {
  const words = wordsOf(query)
  if (words.length === 0) return []
  return rows
    .filter((row) =>
      hasAll(fold([row.title, row.handle, row.category, row.series, row.location, row.caption, ...(row.tags ?? [])].join(' ')), words),
    )
    .slice(0, limit)
}
