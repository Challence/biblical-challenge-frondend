import { useController, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { TextareaField, type TextareaFieldProps } from '../base/TextareaField'
type Props<T extends FieldValues> = Omit<TextareaFieldProps, 'value' | 'onChange' | 'error'> & {
  name: FieldPath<T>
}
export function RhfTextareaField<T extends FieldValues>({ name, ...props }: Props<T>) {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController({ name, control })
  return (
    <TextareaField
      {...props}
      value={String(field.value ?? '')}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )
}
