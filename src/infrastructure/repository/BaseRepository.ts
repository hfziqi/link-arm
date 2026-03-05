import { storageProvider } from '../storage/TauriStorageProvider'

export class StorageKeyBuilder {
  async getUserId(): Promise<string> {
    return storageProvider.getDeviceId()
  }

  async buildKey(storagePath: string, path: string = ''): Promise<string> {
    const userId = await this.getUserId()
    const basePath = `user_${userId}/${storagePath}`
    return path ? `${basePath}/${path}` : basePath
  }
}

export abstract class BaseRepository<T extends { id: string }> {
  private keyBuilder = new StorageKeyBuilder()

  protected abstract getStoragePath(): string
  protected abstract getTableName(): string

  protected async getUserId(): Promise<string> {
    return this.keyBuilder.getUserId()
  }

  protected async buildKey(path: string = ''): Promise<string> {
    return this.keyBuilder.buildKey(this.getStoragePath(), path)
  }

  async findAll(): Promise<T[]> {
    return storageProvider.loadAll<T>(this.getStoragePath(), this.getTableName())
  }

  async findById(id: string): Promise<T | null> {
    const items = await this.findAll()
    return items.find(item => item.id === id) || null
  }

  async save(item: T): Promise<void> {
    const items = await this.findAll()
    const existingIndex = items.findIndex(i => i.id === item.id)

    if (existingIndex >= 0) {
      items[existingIndex] = item
    } else {
      items.unshift(item)
    }

    await storageProvider.save(this.getStoragePath(), this.getTableName(), items)
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await storageProvider.update(this.getStoragePath(), this.getTableName(), id, data)
  }

  async delete(id: string): Promise<void> {
    await storageProvider.delete(this.getStoragePath(), this.getTableName(), id)
  }

  async saveAll(items: T[]): Promise<void> {
    await storageProvider.save(this.getStoragePath(), this.getTableName(), items)
  }

  async deleteAll(ids: string[]): Promise<void> {
    const items = await this.findAll()
    const filteredItems = items.filter(item => !ids.includes(item.id))
    await storageProvider.save(this.getStoragePath(), this.getTableName(), filteredItems)
  }

  async findByIds(ids: string[]): Promise<T[]> {
    const items = await this.findAll()
    const idSet = new Set(ids)
    return items.filter(item => idSet.has(item.id))
  }
}
