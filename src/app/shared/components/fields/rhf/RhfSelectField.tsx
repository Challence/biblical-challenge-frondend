import { useController, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { SelectField, type SelectFieldProps } from '../base/SelectField'
type Props<T extends FieldValues> = Omit<SelectFieldProps, 'value' | 'onChange' | 'error'> & { name: FieldPath<T> }
export function RhfSelectField<T extends FieldValues>({ name, ...props }: Props<T>) { const { control } = useFormContext<T>(); const { field, fieldState } = useController({ name, control }); return <SelectField {...props} value={String(field.value ?? '')} onChange={field.onChange} error={fieldState.error?.message} /> }
