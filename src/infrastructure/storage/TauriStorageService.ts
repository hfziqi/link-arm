import { invoke } from '@tauri-apps/api/core'
import { createLogger } from '../../domains/shared/utils/logger'

const logger = createLogger('TauriStorageService')

export class TauriStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      const result = await invoke<string | null>('load_data', { key })
      return result
    } catch (error) {
      logger.error('Failed to load data:', error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await invoke('save_data', { key, value })
    } catch (error) {
      logger.error('Failed to save data:', error)
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await invoke('delete_data', { key })
    } catch (error) {
      logger.error('Failed to delete data:', error)
      throw error
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await invoke<string[]>('get_all_keys')
      return keys
    } catch (error) {
      logger.error('Failed to get all keys:', error)
      return []
    }
  }

  async clear(): Promise<void> {
    try {
      await invoke('clear_all_data')
    } catch (error) {
      logger.error('Failed to clear data:', error)
      throw error
    }
  }

  getStorageMode(): 'file' | 'localStorage' | 'none' {
    return 'file'
  }
}

let instance: TauriStorageService | null = null

export function getTauriStorageService(): TauriStorageService {
  if (!instance) {
    instance = new TauriStorageService()
  }
  return instance
}
