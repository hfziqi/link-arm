import { resourceManager } from './services/ResourceManager'
import { DocumentProvider } from '../domains/unified-knowledge/document/providers/DocumentProvider'
import { FolderProvider } from '../domains/unified-knowledge/document/providers/FolderProvider'
import { createLogger } from '../domains/shared/utils/logger'

const logger = createLogger('Init')

export function initResourceManager(): void {
  logger.info('Initializing ResourceManager...')

  resourceManager.registerProvider(new DocumentProvider())
  resourceManager.registerProvider(new FolderProvider())

  logger.info('ResourceManager initialization complete')
  logger.info('Registered Providers:', resourceManager.getRegisteredTypes())
}

export function initializeApp(): void {
  initResourceManager()
}

export { resourceManager } from './services/ResourceManager'
