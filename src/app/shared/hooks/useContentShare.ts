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

const period = (data: ContentShareRaw) => {
  const monthDate = text(data, 'monthDate')
  const month = scalar(data, 'month') || (monthDate.match(/\d{4}-(\d{1,2})/)?.[1] ?? '')
  const year = scalar(data, 'year') || (monthDate.match(/(\d{4})/)?.[1] ?? '')
  if (!month || !year) return ''
  const monthNumber = Number(month)
  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const monthName =
    Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12
      ? monthNames[monthNumber - 1]
      : month
  return `${monthName} ${year}`
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

const asUrl = (input: ContentShareInput) =>
  input.publicUrl ?? text(input.data, 'publicUrl', 'url', 'slugUrl', 'href') ?? window.location.href

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
  if (value instanceof File) return value
  if (value instanceof Blob) return new File([value], 'shared-content', { type: value.type })
  if (value.startsWith('data:')) {
    const response = await fetch(value)
    const blob = await response.blob()
    return new File([blob], 'shared-content', { type: blob.type })
  }
  if (/^https?:\/\//i.test(value)) {
    const response = await fetch(value)
    if (!response.ok) return undefined
    const blob = await response.blob()
    return new File([blob], value.split('/').pop()?.split('?')[0] || 'shared-content', {
      type: blob.type,
    })
  }
  return undefined
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
  const date =
    text(input.data, 'date', 'publishedAt', 'createdAt', 'displayDate') || period(input.data)
  const dayText = input.kind === 'dailyReading' ? day(input.data) : ''
  const shareText = useMemo(() => {
    const values = [description, date, dayText, ...youtube(input.data)].filter(Boolean)
    return [...new Set(values)].join('\n')
  }, [date, dayText, description, input.data])
  const url = asUrl(input)
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
        return Promise.all([...new Set(files)].map(fileFrom))
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
      title,
      text: shareText,
      url,
      ...(preparedFiles.length ? { files: preparedFiles } : {}),
    }),
    [preparedFiles, shareText, title, url],
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
        await navigator.clipboard.writeText([title, shareText, url].filter(Boolean).join('\n'))
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
