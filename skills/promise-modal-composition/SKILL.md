---
name: promise-modal-composition
description: 'Trigger: promise modal, promise dialog, modal composition, confirm dialog. Define a typed, library-agnostic promise-based modal contract and safe composition rules.'
license: Apache-2.0
metadata:
  author: 'jacobito'
  version: '1.0'
---

## Activation Contract

Use when designing or reviewing a modal/dialog opened imperatively and awaited by its caller. Keep the contract independent of any UI library.

## Hard Rules

- `open(data, template)` returns one promise; resolve exactly once with `dismiss`, `close`, or `confirm` plus typed data where applicable.
- Route every terminal path—buttons, Escape, backdrop, unmount, and cancellation—through one settlement guard; never leave a promise pending.
- Queue requests in a Provider-owned coordinator; define ordering and behavior during provider teardown.
- Templates are typed render contracts. Pass data in; return typed results out. Do not put business rules, HTTP, or domain decisions in the modal base.
- Provider owns lifecycle, queue, focus return, Escape, and backdrop policy. Preserve focus, use accessible names, and make destructive confirmation explicit.

## Decision Gates

| Need                          | Choose                                                 |
| ----------------------------- | ------------------------------------------------------ |
| Shared shell/lifecycle        | Base modal composed by a template                      |
| Domain-specific content/rules | Specialized template or caller-owned service           |
| Concurrent opens              | Queue (or explicitly reject); never silently overwrite |
| Non-modal flow                | Use a regular component instead                        |

## Execution Steps

1. Specify input, template, result union, cancellation semantics, and queue policy.
2. Implement the global Provider/coordinator and single-settlement guard.
3. Compose typed templates over the base; keep business behavior outside it.
4. Verify keyboard/focus, backdrop, teardown, queue ordering, and every result path.

## Output Contract

Report the contract, ownership boundaries, result states, queue policy, accessibility behavior, and tests covering resolution exactly once.

## References

- `skills/component-composition/SKILL.md` — reusable composition and specialization.
- `skills/atomic-design/SKILL.md` — component layer placement.
