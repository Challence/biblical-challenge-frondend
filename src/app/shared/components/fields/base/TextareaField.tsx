import { useId, type ChangeEvent, type TextareaHTMLAttributes } from 'react'
import { Label } from '@/app/shared/components/ui/label'
import { Textarea } from '@/app/shared/components/ui/textarea'
import { cn } from '@/app/shared/lib/utils'

export interface TextareaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'value' | 'onChange' | 'disabled' | 'required'
> {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  helperText?: string
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  required,
  disabled,
  error,
  helperText,
  className,
  ...props
}: TextareaFieldProps) {
  const descriptionId = useId()
  const errorMessage = typeof error === 'string' ? error : undefined
  const describedBy = errorMessage ? `${id}-error` : helperText ? descriptionId : undefined
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <Textarea
        {...props}
        id={id}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(error ? 'border-destructive' : '', className)}
      />
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
