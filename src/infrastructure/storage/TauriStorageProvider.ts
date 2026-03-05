import { invoke } from '@tauri-apps/api/core'
import { createLogger } from '../../domains/shared/utils/logger'

const logger = createLogger('TauriStorageProvider')

const DEVICE_ID_KEY = 'device_id.json'

function generateDeviceId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}`
}

export interface StorageProvider {
  loadAll<T>(path: string, table: string): Promise<T[]>
  save<T>(path: string, table: string, data: T): Promise<void>
  update<T>(path: string, table: string, id: string, data: Partial<T>): Promise<void>
  delete(path: string, table: string, id: string): Promise<void>
  saveRaw(key: string, value: string): Promise<void>
  loadRaw(key: string): Promise<string | null>
  deleteRaw(key: string): Promise<void>
  deleteDirectory(dirPath: string): Promise<void>
  getDeviceId(): Promise<string>
}

export class TauriStorageProvider implements StorageProvider {
  private deviceIdCache: string | null = null

  async getDeviceId(): Promise<string> {
    if (this.deviceIdCache) {
      return this.deviceIdCache
    }

    try {
      const storedId = await this.loadRaw(DEVICE_ID_KEY)

      if (storedId) {
        const deviceData = JSON.parse(storedId)
        if (deviceData.deviceId) {
          this.deviceIdCache = deviceData.deviceId as string
          return this.deviceIdCache
        }
      }
    } catch (error) {
      logger.warn('Failed to load device ID, creating new one', error)
    }

    const newDeviceId = generateDeviceId()
    const deviceData = {
      deviceId: newDeviceId,
      createdAt: Date.now()
    }

    await this.saveRaw(DEVICE_ID_KEY, JSON.stringify(deviceData))
    this.deviceIdCache = newDeviceId

    logger.info('Created new device ID:', newDeviceId)
    return newDeviceId
  }

  private async getCurrentUserId(): Promise<string> {
    return this.getDeviceId()
  }

  private async buildKey(path: string, table: string): Promise<string> {
    const userId = await this.getCurrentUserId()
    return `user_${userId}/${path}/${table}`
  }

  async loadAll<T>(path: string, table: string): Promise<T[]> {
    try {
      const key = await this.buildKey(path, table)
      const result = await invoke('load_data', { key })
      if (!result) return []
      return JSON.parse(result as string) as T[]
    } catch (error) {
      logger.error('Failed to load data', error)
      return []
    }
  }

  async save<T>(path: string, table: string, data: T): Promise<void> {
    try {
      const key = await this.buildKey(path, table)
      await invoke('save_data', { key, value: JSON.stringify(data) })
    } catch (error) {
      logger.error('Failed to save data', error)
      throw error
    }
  }

  async update<T extends { id: string }>(path: string, table: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const items = await this.loadAll<T>(path, table)
      const index = items.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error(`Record with id ${id} not found`)
      }
      items[index] = {
        ...items[index],
        ...data
      }
      await this.save(path, table, items)
    } catch (error) {
      logger.error('Failed to update data', error)
      throw error
    }
  }

  async delete(path: string, table: string, id: string): Promise<void> {
    try {
      const items = await this.loadAll(path, table)
      const filteredItems = items.filter((item: any) => item.id !== id)
      await this.save(path, table, filteredItems)
    } catch (error) {
      logger.error('Failed to delete data', error)
      throw error
    }
  }

  async saveRaw(key: string, value: string): Promise<void> {
    try {
      await invoke('save_data', { key, value })
    } catch (error) {
      logger.error('Failed to save raw data', error)
      throw error
    }
  }

  async loadRaw(key: string): Promise<string | null> {
    try {
      const result = await invoke('load_data', { key })
      return result as string | null
    } catch (error) {
      logger.error('Failed to load raw data', error)
      return null
    }
  }

  async deleteRaw(key: string): Promise<void> {
    try {
      await invoke('delete_data', { key })
    } catch (error) {
      logger.error('Failed to delete raw data', error)
      throw error
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await invoke('delete_folder', { folderPath: dirPath })
    } catch (error) {
      logger.error('Failed to delete directory', error)
      throw error
    }
  }
}

export const tauriStorageProvider = new TauriStorageProvider()
export const storageProvider = tauriStorageProvider
