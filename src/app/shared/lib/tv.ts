import { tv as createTv } from 'tailwind-variants'

/**
 * Shared Tailwind style factory.
 *
 * Define component styles with `tv({ base, slots, variants })` and consume
 * the returned slot functions in the component. Keep feature-specific style
 * definitions next to their component; this export is the shared convention
 * and avoids each component importing the package directly.
 */
export const tv = createTv
