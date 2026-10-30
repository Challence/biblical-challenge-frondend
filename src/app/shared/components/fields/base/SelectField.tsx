import { useId, type ChangeEvent } from 'react'
import { Label } from '@/app/shared/components/ui/label'
import { cn } from '@/app/shared/lib/utils'

export interface SelectFieldOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps {
  id: string
  label: string
  options: SelectFieldOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  helperText?: string
  placeholder?: string
}

export function SelectField({ id, label, options, value, onChange, required, disabled, error, helperText, placeholder }: SelectFieldProps) {
  const descriptionId = useId()
  const errorMessage = typeof error === 'string' ? error : undefined
  const describedBy = errorMessage ? `${id}-error` : helperText ? descriptionId : undefined

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-destructive' : '',
        )}
      >
        {placeholder ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      {errorMessage ? <p id={`${id}-error`} className="text-sm text-destructive" role="alert">{errorMessage}</p> : helperText ? <p id={descriptionId} className="text-sm text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}
