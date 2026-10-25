import { Button } from '@/app/shared/components/button/button'
import { tv } from '@/app/shared/lib/tv'

const catalogStyles = tv({
  slots: {
    catalog: 'space-y-8 p-8',
    header: 'space-y-2',
    title: 'text-2xl font-semibold',
    section: 'space-y-4',
    sectionTitle: 'text-lg font-medium',
    examples: 'flex flex-wrap gap-4',
    stateExamples: 'flex flex-wrap items-center gap-4',
  },
})

/** Desarrollo: catálogo visual del Button compartido. Abrir con `ButtonCatalog` desde una pantalla de desarrollo. */
export function ButtonCatalog() {
  const styles = catalogStyles()
  return (
    <main aria-labelledby="button-catalog-title" className={styles.catalog()}>
      <header className={styles.header()}>
        <h1 id="button-catalog-title" className={styles.title()}>Button</h1>
        <p>Acciones compactas con variantes consistentes y foco visible.</p>
      </header>
      <section aria-labelledby="button-variants-title" className={styles.section()}>
        <h2 id="button-variants-title" className={styles.sectionTitle()}>Variantes</h2>
        <div className={styles.examples()}>
          <Button>Default</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button><Button variant="link">Link</Button>
        </div>
      </section>
      <section aria-labelledby="button-states-title" className={styles.section()}>
        <h2 id="button-states-title" className={styles.sectionTitle()}>Estados y tamaños</h2>
        <div className={styles.stateExamples()}>
          <Button size="small">Small</Button><Button size="medium">Normal</Button><Button size="large">Large</Button><Button disabled>Disabled</Button>
        </div>
      </section>
    </main>
  )
}
