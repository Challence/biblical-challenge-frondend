import type { ResourceMonth } from '../../../models/resource'
import { PublicResourceMonthSection } from './PublicResourceMonthSection'

export function PublicResourceMonthList({ months }: { months: ResourceMonth[] }) {
  return (
    <div className="space-y-12">
      {[...months]
        .sort((a, b) => a.position - b.position)
        .map((month) => (
          <PublicResourceMonthSection key={month.id} month={month} />
        ))}
    </div>
  )
}
