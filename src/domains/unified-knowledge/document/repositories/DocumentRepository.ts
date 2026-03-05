import { BaseRepository } from '../../../../infrastructure/repository/BaseRepository'
import type { Document, Folder } from '../../../shared/types/document.types'

export type DocumentOrFolder = Document | Folder

export class DocumentRepository extends BaseRepository<DocumentOrFolder> {
  protected getStoragePath(): string {
    return 'knowledge'
  }

  protected getTableName(): string {
    return 'index.json'
  }

  async findById(id: string): Promise<DocumentOrFolder | null> {
    const items = await this.findAll()
    return items.find(item => item.id === id) || null
  }

  async findByParentId(parentId?: string): Promise<DocumentOrFolder[]> {
    const items = await this.findAll()
    return items.filter(item => item.parentId === parentId)
  }

  async addToFront(item: DocumentOrFolder): Promise<void> {
    const items = await this.findAll()
    const updatedItems = [item, ...items]
    await this.saveAll(updatedItems)
  }

  async documentExists(documentId: string): Promise<boolean> {
    const items = await this.findAll()
    return items.some(item => item.id === documentId)
  }

  async folderExists(folderId: string): Promise<boolean> {
    const items = await this.findAll()
    return items.some(item => item.id === folderId)
  }
}

export const documentRepository = new DocumentRepository()
