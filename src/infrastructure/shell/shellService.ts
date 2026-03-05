import { open } from '@tauri-apps/plugin-shell'
import { createLogger } from '../../domains/shared/utils/logger'

const logger = createLogger('ShellService')

export class ShellService {
  async openExternalLink(url: string): Promise<void> {
    if (!url) {
      logger.warn('URL is empty, cannot open')
      return
    }

    try {
      await open(url)
      logger.info('Opened external link:', url)
    } catch (error) {
      logger.error('Failed to open link with Tauri, falling back to window.open:', error)
      window.open(url, '_blank')
    }
  }
}

let instance: ShellService | null = null

export function getShellService(): ShellService {
  if (!instance) {
    instance = new ShellService()
  }
  return instance
}

export const shellService = getShellService()
