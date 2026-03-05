import { createLogger } from '../../domains/shared/utils/logger'

const logger = createLogger('DocumentEventManager')

class DocumentEventManager {
  private subscribers: Set<() => void> = new Set()

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  notify(): void {
    logger.debug('Document change event triggered')
    this.subscribers.forEach(callback => callback())
  }
}

export const documentEventManager = new DocumentEventManager()
