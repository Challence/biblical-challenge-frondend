import { IconExternalLink, IconPlayerPlay } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { initialMonths, type Month } from './resources'

export function ResourcesPage({ months = initialMonths }: { months?: Month[] }) {
  return <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
    <header className="max-w-2xl space-y-3"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Recursos</p><h1 className="font-[Merriweather,Georgia,serif] text-3xl font-bold tracking-tight sm:text-4xl">Recursos de cada mes</h1><p className="text-muted-foreground">Imágenes, encuentros y videos para acompañar tu camino.</p></header>
    {months.map((month) => <section key={month.id} aria-labelledby={`month-${month.id}`} className="space-y-5"><div><h2 id={`month-${month.id}`} className="text-2xl font-semibold">{month.title}</h2><p className="mt-1 text-muted-foreground">{month.description}</p></div>
      {month.resources.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-muted-foreground">Aún no hay recursos para este mes.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{month.resources.map((resource) => <Card key={resource.id} className="overflow-hidden">{resource.type === 'image' ? <img src={resource.source} alt={resource.title} className="aspect-video w-full object-cover" /> : <div className="flex aspect-video items-center justify-center bg-slate-900 text-white"><IconPlayerPlay aria-hidden="true" size={42} /></div>}<CardHeader className="pb-2"><CardTitle className="text-lg">{resource.title}</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">{resource.description}</p>{resource.type === 'video' && <a href={resource.source} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><IconExternalLink size={16} aria-hidden="true" />Ver video</a>}</CardContent></Card>)}</div>}
    </section>)}
  </main>
}
