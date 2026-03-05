/**
 * Base Prompt Layer
 * 
 * Purpose: Provide reusable base prompt components
 * 
 * Design Principles:
 * 1. Single Responsibility: Each file handles only one type of base prompt
 * 2. Composable: Base prompts can be freely combined
 * 3. Configurable: Customize output through parameters
 * 4. Stateless: Pure functions, easy to test
 */

export * from './timeContext'
export * from './constraints'
export * from './outputFormat'
export * from './thinkingProcess'
export * from './codeCreation'
