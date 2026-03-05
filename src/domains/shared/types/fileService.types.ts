export type FileType =
  | 'all'
  | 'text'
  | 'image'
  | 'video'
  | 'pdf'
  | 'docx'
  | 'task'
  | 'folder'

export interface FileItem {
  id: string
  title: string
  fileType: string
  type?: 'task'
  parentId?: string
  createdAt: Date
  updatedAt: Date
  metadata?: {
    size?: number
    duration?: number
    width?: number
    height?: number
    pages?: number
  }
}

export interface FileContent {
  type: 'text' | 'image' | 'video' | 'pdf' | 'task' | 'folder'
  content?: string
  url?: string
  thumbnail?: string
  metadata?: any
}

export interface ListFilesParams {
  filter?: FileType
  parentId?: string
}

export interface CreateFileParams {
  title: string
  content?: string
  fileType?: FileType
  parentId?: string
}

export interface ReadFileParams {
  fileId: string
}

export interface WriteFileParams {
  fileId: string
  content: string
}

export interface DeleteFileParams {
  fileId: string
}

export interface RenameFileParams {
  fileId: string
  newTitle: string
}

export interface IFileService {
  listFiles(params: ListFilesParams): Promise<FileItem[]>
  createFile(params: CreateFileParams): Promise<FileItem>
  readFile(params: ReadFileParams): Promise<FileContent | null>
  writeFile(params: WriteFileParams): Promise<boolean>
  deleteFile(params: DeleteFileParams): Promise<boolean>
  renameFile(params: RenameFileParams): Promise<boolean>
}
