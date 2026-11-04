import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAnalytics } from '@/app/shared/analytics/useAnalytics'

export type ContentShareKind =
  'segment' | 'dailyReading' | 'readingGuide' | 'monthlyResource' | 'announcement'

export type ContentShareRaw = Record<string, unknown>

export type ContentShareInput = {
  kind: ContentShareKind
  data: ContentShareRaw
  publicUrl?: string
  files?: Array<File | Blob | string>
  entityId?: string
}

export type ContentShareMethod = 'native' | 'clipboard'
export type ContentShareResult = { method: ContentShareMethod }

export type UseContentShareOptions = ContentShareInput & {
  disabled?: boolean
  onSuccess?: (method: ContentShareMethod) => void
}

const text = (data: ContentShareRaw, ...keys: string[]) =>
  keys
    .map((key) => data[key])
    .find((value): value is string => typeof value === 'string' && value.length > 0) ?? ''

const scalar = (data: ContentShareRaw, ...keys: string[]) => {
  const value = keys
    .map((key) => data[key])
    .find((item) => typeof item === 'string' || typeof item === 'number')
  return value === undefined ? '' : String(value)
}

const isImageUrl = (value: string) =>
  /^(?:data:image\/|https?:\/\/).+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(value)

const shareableText = (value: string) =>
  value.startsWith('data:') || isImageUrl(value) ? '' : value

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const formatCalendarDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/)
  if (!match) return ''
  const month = Number(match[2])
  if (month < 1 || month > 12) return ''
  return `${String(Number(match[3] ?? 1)).padStart(2, '0')}/${monthNames[month - 1]}/${match[1]}`
}

const period = (data: ContentShareRaw) => {
  const monthDate = text(data, 'monthDate')
  const month = scalar(data, 'month') || (monthDate.match(/\d{4}-(\d{1,2})/)?.[1] ?? '')
  const year = scalar(data, 'year') || (monthDate.match(/(\d{4})/)?.[1] ?? '')
  if (!month || !year) return ''
  const monthNumber = Number(month)
  return Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12
    ? `01/${monthNames[monthNumber - 1]}/${year}`
    : ''
}

const day = (data: ContentShareRaw) => {
  const value = data.day ?? data.dayNumber
  return typeof value === 'number' || (typeof value === 'string' && value.length > 0)
    ? `Día ${value}`
    : ''
}

const rawFiles = (data: ContentShareRaw): Array<File | Blob | string> => {
  const values: unknown[] = []
  const imageKeys = new Set(['image', 'imageUrl', 'imagePath'])
  const visit = (value: unknown, key?: string) => {
    if (key && imageKeys.has(key)) {
      if (Array.isArray(value)) value.forEach((item) => visit(item, key))
      else if (typeof value === 'string' || (typeof Blob !== 'undefined' && value instanceof Blob))
        values.push(value)
      return
    }
    if (Array.isArray(value)) value.forEach((item) => visit(item))
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (record.type === 'image' && typeof record.content === 'string')
        visit(record.content, 'image')
      Object.entries(record).forEach(([childKey, childValue]) => visit(childValue, childKey))
    }
  }
  visit(data)
  return [...new Set(values)] as Array<File | Blob | string>
}

const publicHomeUrl = () => `${window.location.origin}/`

const publicUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined
  try {
    const candidate = value.trim()
    const url = new URL(candidate, publicHomeUrl())
    if (!['http:', 'https:'].includes(url.protocol) || /^\/admin(?:\/|$)/i.test(url.pathname))
      return undefined
    return /^https?:\/\//i.test(candidate) ? candidate : url.href
  } catch {
    return undefined
  }
}

const asUrl = (input: ContentShareInput) =>
  [input.publicUrl, ...['publicUrl', 'url', 'slugUrl', 'href'].map((key) => input.data[key])]
    .map(publicUrl)
    .find(Boolean) ?? publicHomeUrl()

const announcementUrl = (input: ContentShareInput) => {
  const item = input.data.item
  const itemHref =
    item && typeof item === 'object' && typeof (item as Record<string, unknown>).href === 'string'
      ? (item as Record<string, unknown>).href
      : ''
  return [input.publicUrl, itemHref, text(input.data, 'publicUrl', 'url', 'slugUrl', 'href')]
    .map(publicUrl)
    .find(Boolean)
}

const monthlyResourceDate = (data: ContentShareRaw) => {
  const value = text(data, 'date', 'monthDate')
  return formatCalendarDate(value) || period(data)
}

const youtube = (data: ContentShareRaw) => {
  const values: string[] = []
  const visit = (value: unknown) => {
    if (typeof value === 'string' && /(?:youtube\.com|youtu\.be)/i.test(value)) values.push(value)
    else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(data)
  return [...new Set(values)]
}

const fileFrom = async (value: File | Blob | string): Promise<File | undefined> => {
  let blob: Blob
  if (typeof value !== 'string' && value instanceof Blob) blob = value
  else if (value.startsWith('data:') || /^https?:\/\//i.test(value)) {
    const response = await fetch(value)
    if (!response.ok) return undefined
    blob = await response.blob()
  } else return undefined

  if (!blob.type.startsWith('image/')) return undefined
  try {
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
    bitmap.close()
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg'))
    return jpeg ? new File([jpeg], 'anuncio.jpg', { type: 'image/jpeg' }) : undefined
  } catch {
    return undefined
  }
}

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError'

export function useContentShare({ disabled = false, onSuccess, ...input }: UseContentShareOptions) {
  const { track } = useAnalytics()
  const [preparedFiles, setPreparedFiles] = useState<File[]>([])
  const [isPreparing, setIsPreparing] = useState(Boolean(input.files?.length))
  const [isSharing, setIsSharing] = useState(false)

  const title =
    input.kind === 'dailyReading' && text(input.data, 'segmentTitle')
      ? text(input.data, 'segmentTitle')
      : text(input.data, 'title', 'name', 'subject', 'heading')
  const description = shareableText(
    text(input.data, 'text', 'description', 'content', 'body', 'excerpt'),
  )
  const rawDate = text(input.data, 'date', 'publishedAt', 'createdAt', 'displayDate')
  const date = formatCalendarDate(rawDate) || period(input.data)
  const dayText = input.kind === 'dailyReading' ? day(input.data) : ''
  const url =
    input.kind === 'monthlyResource'
      ? [input.publicUrl, ...['publicUrl', 'url', 'slugUrl', 'href'].map((key) => input.data[key])]
          .map(publicUrl)
          .find(Boolean)
      : asUrl(input)
  const announcementHref = announcementUrl(input)
  const shareText = useMemo(() => {
    if (input.kind === 'announcement') {
      return [...new Set(['Anuncio', announcementHref, publicHomeUrl()].filter(Boolean))].join(
        '\n\n',
      )
    }
    if (input.kind === 'segment') return title
    if (input.kind === 'monthlyResource') {
      const resourceDate = monthlyResourceDate(input.data)
      const heading = [title, resourceDate].filter(Boolean).join(' — ')
      const links = [
        ...['videoUrl', 'video', 'videoURL'].map((key) => publicUrl(input.data[key])),
        ...youtube(input.data).map(publicUrl),
        url,
      ].filter((value): value is string => Boolean(value))
      const linkText = [...new Set(links)].join('\n')
      return [heading, description, linkText].filter(Boolean).join('\n\n')
    }
    const values = [description, date, dayText, ...youtube(input.data)].filter(Boolean)
    return [...new Set(values)].join('\n')
  }, [announcementHref, date, dayText, description, input.data, input.kind, title, url])
  const files = useMemo(
    () => (input.files?.length ? input.files : rawFiles(input.data)),
    [input.data, input.files],
  )

  useEffect(() => {
    let active = true
    if (!files.length) {
      void Promise.resolve().then(() => {
        if (active) {
          setPreparedFiles([])
          setIsPreparing(false)
        }
      })
      return () => {
        active = false
      }
    }
    void Promise.resolve()
      .then(() => {
        setIsPreparing(true)
        return Promise.all([...new Set(files)].map((file) => fileFrom(file).catch(() => undefined)))
      })
      .then((files) => {
        if (active) {
          setPreparedFiles(files.filter((file): file is File => Boolean(file)))
          setIsPreparing(false)
        }
      })
    return () => {
      active = false
    }
  }, [files])

  const shareData = useMemo<ShareData>(
    () => ({
      title: input.kind === 'announcement' ? 'Anuncio' : title,
      text: shareText,
      ...(input.kind === 'announcement' || input.kind === 'monthlyResource' || !url ? {} : { url }),
      ...(preparedFiles.length ? { files: preparedFiles } : {}),
    }),
    [input.kind, preparedFiles, shareText, title, url],
  )
  const share = useCallback(async (): Promise<ContentShareResult | undefined> => {
    if (disabled || isPreparing || isSharing) return undefined
    setIsSharing(true)
    try {
      const native = typeof navigator.share === 'function'
      let canNative = native
      if (canNative && navigator.canShare) {
        try {
          canNative = navigator.canShare(shareData)
        } catch {
          canNative = false
        }
      }
      let method: ContentShareMethod
      if (canNative) {
        await navigator.share(shareData)
        method = 'native'
      } else {
        const clipboardText =
          input.kind === 'announcement'
            ? shareText
            : input.kind === 'segment'
              ? [title, url].filter(Boolean).join('\n\n')
              : input.kind === 'monthlyResource'
                ? shareText
                : [title, shareText, url].filter(Boolean).join('\n')
        await navigator.clipboard.writeText(clipboardText)
        method = 'clipboard'
      }
      if (input.entityId)
        track({
          type: 'content_shared',
          entityType:
            input.kind === 'dailyReading' || input.kind === 'readingGuide'
              ? 'reading'
              : input.kind === 'monthlyResource'
                ? 'resource'
                : input.kind,
          entityId: input.entityId,
          method,
        })
      onSuccess?.(method)
      return { method }
    } catch (error) {
      if (!isAbortError(error) && typeof navigator.share !== 'function') return undefined
      return undefined
    } finally {
      setIsSharing(false)
    }
  }, [
    disabled,
    input.entityId,
    input.kind,
    isPreparing,
    isSharing,
    onSuccess,
    shareData,
    shareText,
    setIsSharing,
    title,
    track,
    url,
  ])

  return {
    share,
    shareData,
    title,
    text: shareText,
    url,
    isPreparing,
    isSharing,
    disabled: disabled || isPreparing || isSharing,
  }
}
