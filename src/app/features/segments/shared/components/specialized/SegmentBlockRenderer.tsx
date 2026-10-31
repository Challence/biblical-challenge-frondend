import type { SegmentBlockType } from '../../../models/segment'

type Block = { type: SegmentBlockType; content: string; file_name?: string | null }
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
      <a className="text-primary underline" href={block.content} target="_blank" rel="noreferrer">
        Ver video
      </a>
    )
  return <p className="whitespace-pre-wrap leading-relaxed">{block.content}</p>
}
