import { useController, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { FileField, type FileFieldProps } from '../base/FileField'
type Props<T extends FieldValues> = Omit<FileFieldProps, 'value' | 'onFileChange' | 'error'> & { name: FieldPath<T> }
export function RhfFileField<T extends FieldValues>({ name, ...props }: Props<T>) { const { control } = useFormContext<T>(); const { field, fieldState } = useController({ name, control }); return <FileField {...props} value={field.value ?? null} onFileChange={field.onChange} error={fieldState.error?.message} /> }
