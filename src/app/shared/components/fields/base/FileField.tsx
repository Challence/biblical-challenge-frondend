import { IconFile, IconUpload } from '@tabler/icons-react'
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/app/shared/lib/utils'
import { Label } from '@/app/shared/components/ui/label'

export interface FileFieldProps {
  id: string
  label: string
  accept?: string
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  helperText?: string
  value?: File | null
  onFileChange: (file: File | null) => void
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(',').some((rawRule) => {
    const rule = rawRule.trim().toLowerCase()
    if (!rule) return false
    if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
    if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
    return file.type.toLowerCase() === rule
  })
}

export function FileField({
  id,
  label,
  accept,
  required,
  disabled,
  error,
  helperText,
  value,
  onFileChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const descriptionId = useId()
  const errorMessage = typeof error === 'string' ? error : undefined
  const describedBy = errorMessage ? `${id}-error` : helperText ? descriptionId : undefined
  const file = value !== undefined ? value : selectedFile

  const chooseFile = (candidate?: File) => {
    if (!candidate || disabled || !matchesAccept(candidate, accept)) return
    setSelectedFile(candidate)
    onFileChange(candidate)
  }
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0])
    event.target.value = ''
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    chooseFile(event.dataTransfer.files[0])
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false)
        }}
        onDrop={onDrop}
        className={cn(
          'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          isDragging
            ? 'border-primary bg-accent/30'
            : 'border-input bg-background hover:border-primary',
          error ? 'border-destructive' : '',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          required={required}
          disabled={disabled}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
        />
        {file ? (
          <IconFile aria-hidden="true" size={28} />
        ) : (
          <IconUpload aria-hidden="true" size={28} />
        )}
        <span className="font-medium">
          {file ? file.name : 'Selecciona un archivo o arrástralo aquí'}
        </span>
        {!file && (
          <span className="text-sm text-muted-foreground">Haz clic o pulsa Enter para buscar</span>
        )}
      </div>
      {errorMessage ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
