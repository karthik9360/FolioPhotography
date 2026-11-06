import PhotoTile from './PhotoTile'
import { useViewer } from '../../context/ViewerContext'

// Column masonry. Every tile reserves its aspect ratio, so nothing shifts as images load.
export default function MasonryGrid({ photos, showOwner = false }) {
  const { openPhoto } = useViewer()
  const ids = photos.map((p) => p.id)

  return (
    <ul className="masonry">
      {photos.map((photo, i) => (
        <li key={photo.id}>
          <PhotoTile photo={photo} index={i} showOwner={showOwner} onOpen={(id) => openPhoto(id, ids)} />
        </li>
      ))}
    </ul>
  )
}
