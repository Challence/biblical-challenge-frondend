import type { SegmentBlockType } from '../../../models/segment'

type Block = { type: SegmentBlockType; content: string; file_name?: string | null }

function getVideoSource(url: string) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1).split('/')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (parsedUrl.hostname === 'youtube.com' || parsedUrl.hostname === 'www.youtube.com') {
      const videoId = parsedUrl.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
  } catch {
    // Keep malformed or non-YouTube URLs as the iframe source.
  }
  return url
}

export function SegmentBlockRenderer({ block }: { block: Block }) {
  if (block.type === 'image')
    return (
      <img
        src={block.content}
        alt={block.file_name || 'Imagen de la lectura'}
        className="max-h-96 w-full rounded-md object-contain"
      />
    )
  if (block.type === 'video')
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md">
        <iframe
          className="h-full w-full border-0"
          src={getVideoSource(block.content)}
          title="Video de la lectura"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  return <p className="whitespace-pre-wrap leading-relaxed">{block.content}</p>
}
