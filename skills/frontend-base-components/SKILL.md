---
name: frontend-base-components
description: "Trigger: frontend base component, reusable field, dialog, table, pagination, component catalog. Decide when and how to create tested, accessible frontend primitives."
license: Apache-2.0
metadata:
  author: "jacobito"
  version: "1.0"
---

## Activation Contract

Use when creating or reviewing reusable frontend components such as fields, dialogs/modals, tables, pagination, or shared interaction primitives.

## Hard Rules

- Create a base only for a stable behavior with demonstrated consumers; do not manufacture abstractions for hypothetical reuse or boilerplate reduction alone.
- Preserve layers: `base` owns generic presentation/accessibility, `composed` combines bases, and `specialized` adds feature-specific behavior.
- Expose explicit, typed props and controlled state contracts. Base components must not know business rules, HTTP, domain models, or form-library state.
- Put integration in separate adapters (for example RHF), without duplicating base markup, styling, or behavior.
- Cover accessible names, labels, keyboard/focus behavior, and relevant loading, empty, error, disabled, and permission states. Test behavior, not implementation.
- Add shared components to the development catalog with variants, states, and usage examples.

## Decision Gates

| Evidence | Action |
|---|---|
| Existing component fits | Reuse or compose it |
| One module owns the behavior | Keep it in that module |
| Multiple real consumers share stable behavior | Create or adapt a base |
| Only data/business differs | Use props, composition, or a specialized wrapper |

## Execution Steps

1. Search existing components and record why reuse or adaptation is insufficient.
2. Define scope, explicit props, states, accessibility contract, and consumer examples.
3. Implement the smallest layer; isolate adapters and feature logic.
4. Add focused tests and catalog coverage, then run lint, typecheck, tests, and build.

## Output Contract

Report consumers, chosen layer, public props, excluded concerns, accessibility/states, tests, catalog entry, and validation results.

## References

- `skills/component-composition/SKILL.md` — composition and layer boundaries.
- `skills/atomic-design/SKILL.md` — base/composed/specialized structure.
- `skills/react-hook-form-composition/SKILL.md` — adapter separation for RHF.
