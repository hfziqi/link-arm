/**
 * Common Hooks - Pure UI interaction logic (no business logic)
 *
 * Responsibilities:
 * - Provide common React Hooks
 * - No business logic included
 * - Can be used by any layer (presentation, domains, application)
 *
 * Difference from business Hooks:
 * - src/hooks/ - Common hooks (pure UI interaction)
 * - domains/hooks/ - Business hooks (contains business logic)
 */

export { useHover } from './useHover'
export type { UseHoverOptions, UseHoverReturn } from './useHover'

export { useHoverEffect } from './useHoverEffect'
export type { UseHoverEffectReturn } from './useHoverEffect'

export { useClickOutside } from './useClickOutside'

export { useFocus } from './useFocus'
export type { UseFocusOptions, UseFocusReturn } from './useFocus'

export { useMessageListScroll } from './useMessageListScroll'
export type { UseMessageListScrollOptions, UseMessageListScrollReturn } from './useMessageListScroll'
