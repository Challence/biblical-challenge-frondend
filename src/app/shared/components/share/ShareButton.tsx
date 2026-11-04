import { IconShare } from '@tabler/icons-react'
import {
  useContentShare,
  type ContentShareInput,
  type ContentShareMethod,
} from '@/app/shared/hooks/useContentShare'
import { Button } from '@/app/shared/components/button/button'

type ShareEntity = 'segment' | 'reading' | 'resource' | 'announcement'

export interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  file?: File | Blob | string
  files?: Array<File | Blob | string>
  content?: ContentShareInput
  entityType?: ShareEntity
  entityId?: string
  onSuccess?: (method: ContentShareMethod) => void
  variant?: 'public' | 'admin'
  accessibleLabel?: string
  disabled?: boolean
}

export function ShareButton({
  title = '',
  text = '',
  url = '',
  file,
  files,
  content,
  entityType,
  entityId,
  onSuccess,
  variant = 'public',
  accessibleLabel = 'Compartir',
  disabled = false,
}: ShareButtonProps) {
  const share = useContentShare({
    kind:
      content?.kind ??
      (entityType === 'reading'
        ? 'readingGuide'
        : entityType === 'resource'
          ? 'monthlyResource'
          : (entityType ?? 'segment')),
    data: content?.data ?? { title, text },
    publicUrl: content?.publicUrl ?? url,
    files: content?.files ?? files ?? (file ? [file] : undefined),
    entityId: content?.entityId ?? entityId,
    disabled,
    onSuccess,
  })

  return (
    <Button
      aria-label={accessibleLabel}
      className={
        variant === 'admin'
          ? 'size-10 rounded-md'
          : 'size-11 rounded-full bg-yellow-400 text-yellow-950 shadow-sm hover:bg-yellow-500 focus-visible:ring-yellow-600'
      }
      disabled={share.disabled}
      onClick={() => void share.share()}
      variant={variant === 'admin' ? 'ghost' : undefined}
      size="icon"
    >
      <IconShare aria-hidden="true" size={variant === 'admin' ? 16 : 20} stroke={2} />
    </Button>
  )
}
