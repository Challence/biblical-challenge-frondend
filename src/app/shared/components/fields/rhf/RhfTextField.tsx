import { useController, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { TextField, type TextFieldProps } from '../base/TextField'

type Props<T extends FieldValues> = Omit<TextFieldProps, 'value' | 'onChange' | 'error'> & {
  name: FieldPath<T>
}
export function RhfTextField<T extends FieldValues>({ name, ...props }: Props<T>) {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController({ name, control })
  return (
    <TextField
      {...props}
      value={String(field.value ?? '')}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )
}
