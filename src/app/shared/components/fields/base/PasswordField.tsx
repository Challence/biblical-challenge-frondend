import { useId, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { cn } from '@/app/shared/lib/utils'

export interface PasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type' | 'value' | 'onChange' | 'disabled' | 'required'
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

export function PasswordField({
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
}: PasswordFieldProps) {
  const descriptionId = useId()
  const [visible, setVisible] = useState(false)
  const errorMessage = typeof error === 'string' ? error : undefined
  const describedBy = errorMessage ? `${id}-error` : helperText ? descriptionId : undefined
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <div className="relative">
        <Input
          {...props}
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn('pr-12', error ? 'border-destructive' : '', className)}
        />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? (
            <IconEyeOff aria-hidden="true" size={20} />
          ) : (
            <IconEye aria-hidden="true" size={20} />
          )}
        </button>
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
