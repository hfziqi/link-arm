import { Document, Folder, DocumentFileType } from '../../shared/types/document.types'

export type { Document, Folder, DocumentFileType }

export interface UnifiedDocument extends Document {}

export interface UnifiedDocumentItem extends UnifiedDocument {}

export type KnowledgeTreeItem = UnifiedDocument | Folder
