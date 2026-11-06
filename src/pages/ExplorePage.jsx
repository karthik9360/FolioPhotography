import { useState } from 'react'
import MasonryGrid from '../components/gallery/MasonryGrid'
import { categories, photos } from '../data/photos'

/** Everyone's photographs in one grid. Open one for the story and EXIF; the caption names the photographer. */
export default function ExplorePage() {
  const [category, setCategory] = useState('All')
  const visible = category === 'All' ? photos : photos.filter((p) => p.category === category)

  return (
    <main id="main">
      <section className="wrap pt-14 md:pt-24" aria-labelledby="explore-title">
        <h1 id="explore-title" className="display">
          Explore
        </h1>

        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end md:gap-x-5">
          <p className="measure text-[1.0625rem] text-ink-soft md:col-span-6">
            Photographs from every photographer on the platform. Open one for its story and EXIF, then
            follow the people whose work you want in your feed.
          </p>

          <div
            role="group"
            aria-label="Filter by category"
            className="label flex flex-wrap gap-x-8 gap-y-2 md:col-span-6 md:justify-end"
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="nav-link"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap mt-12 md:mt-20" aria-label="Photographs">
        <p className="caption mb-6 text-ink-soft" aria-live="polite">
          {visible.length} photographs
        </p>
        <MasonryGrid photos={visible} showOwner />
      </section>
    </main>
  )
}
