import { useController, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { YearField, type YearFieldProps } from '../base/YearField'

type Props<T extends FieldValues> = Omit<YearFieldProps, 'value' | 'onChange' | 'error'> & {
  name: FieldPath<T>
}

export function RhfYearField<T extends FieldValues>({ name, ...props }: Props<T>) {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController({ name, control })

  return (
    <YearField
      {...props}
      value={String(field.value ?? '')}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  )
}
