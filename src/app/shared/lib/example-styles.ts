import { tv } from './tv'

/** Reusable slot pattern example; importing it does not render or alter UI. */
export const examplePanelStyles = tv({
  slots: {
    root: 'rounded-lg border border-slate-200 bg-white',
    header: 'flex items-center justify-between gap-4 px-4 py-3',
    content: 'px-4 pb-4',
  },
})
