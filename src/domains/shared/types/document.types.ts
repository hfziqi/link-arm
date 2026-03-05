import { BaseEntity } from './common.types'

export type DocumentFileType =
  | 'folder'
  | 'txt'
  | 'docx'
  | 'task'
  | 'video'
  | 'ppt'
  | 'image'

export interface TaskConfig {
  triggerType: 'delay' | 'cron'
  delayMs?: number
  cronExpression?: string
  jobStatus?: 'pending' | 'active' | 'completed' | 'failed'
}

export interface DocumentBase {
  title: string
  content?: string
  fileType: DocumentFileType
  parentId?: string
  taskConfig?: TaskConfig
}

export interface Document extends BaseEntity, DocumentBase {}

export interface Folder extends BaseEntity {
  title: string
  fileType: 'folder'
  parentId?: string
}
