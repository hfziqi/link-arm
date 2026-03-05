// AGI Memory System - Main exports
// Provides a modular memory system for tracking multi-model collaboration

// Core Memory Coordinator
export { AGIMemory } from './AGIMemory'
export type { default as AGIMemoryClass } from './AGIMemory'

// Individual Stores
export { MessageStore } from './stores/MessageStore'
export { ActionStore } from './stores/ActionStore'
export { DecisionStore } from './stores/DecisionStore'
export { ReflectionStore } from './stores/ReflectionStore'
export { ToolResultStore } from './stores/ToolResultStore'
export { SubModelStore } from './stores/SubModelStore'

// Types
export type {
  MessageRole,
  ModelActionType,
  MessageSource,
  ModelAction,
  AGIMessage,
  ToolResult,
  SubModelExecution,
  ResultQuality,
  QualityAssessment,
  CallChainNode,
  DecisionRecord,
  ReflectionRecord,
  MemoryStats,
  MemoryConfig,
  BaseStoreConfig
} from './types/memory.types'
