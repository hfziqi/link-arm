/**
 * Prompt Engineering
 * 
 * Architecture Design:
 * - base/: Base prompt components (reusable)
 * - agi/: AGI collaboration mode prompts (combines base components)
 * 
 * Design Principles (Context Engineering 2025):
 * 1. Layered Reuse: Base components → Role prompts
 * 2. Single Responsibility: Each component handles one thing
 * 3. Composable: Components can be freely combined
 * 4. Configurable: Customize output through parameters
 * 5. Stateless: Pure functions, easy to test
 */

export * from './base'
export * from './agi'
