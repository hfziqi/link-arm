import {
  IResource,
  IResourceProvider,
  IResourceManager,
  ResourceType,
  ListResourcesParams
} from '../../domains/shared/types/resource.types'
import { createLogger } from '../../domains/shared/utils/logger'
import { handleError } from '../../domains/shared/services/errorHandlingService'

const logger = createLogger('ResourceManager')

export class ResourceManager implements IResourceManager {
  private providers = new Map<ResourceType, IResourceProvider>()

  registerProvider(provider: IResourceProvider): void {
    this.providers.set(provider.resourceType, provider)
    logger.info(`Registered Provider: ${provider.resourceType}`)
  }

  async listAllResources(params?: ListResourcesParams): Promise<IResource[]> {
    const { filter, parentId } = params || {}

    const types = filter && filter.length > 0
      ? filter
      : Array.from(this.providers.keys())

    const results = await Promise.all(
      types.map(async type => {
        const provider = this.providers.get(type)
        if (!provider) {
          logger.warn(`Provider not found: ${type}`)
          return []
        }
        try {
          return await provider.listResources(parentId)
        } catch (error) {
          handleError(error, {
            showToast: false,
            logToConsole: true,
            context: { source: 'ResourceManager', action: 'listResources', resourceType: type }
          })
          return []
        }
      })
    )

    const allResources = results.flat()
    return allResources.sort((a, b) => {
      const timeA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime()
      const timeB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime()
      return timeB - timeA
    })
  }

  async listResourcesByType(type: ResourceType, parentId?: string): Promise<IResource[]> {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`[ResourceManager] Provider not found: ${type}`)
    }
    return provider.listResources(parentId)
  }

  async getResource(id: string, type: ResourceType): Promise<IResource | null> {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`[ResourceManager] Provider not found: ${type}`)
    }
    return provider.getResource(id)
  }

  async deleteResource(id: string, type: ResourceType): Promise<boolean> {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`[ResourceManager] Provider not found: ${type}`)
    }
    return provider.deleteResource(id)
  }

  async renameResource(id: string, type: ResourceType, newName: string): Promise<boolean> {
    const provider = this.providers.get(type)
    if (!provider) {
      throw new Error(`[ResourceManager] Provider not found: ${type}`)
    }
    return provider.renameResource(id, newName)
  }

  getRegisteredTypes(): ResourceType[] {
    return Array.from(this.providers.keys())
  }
}

export const resourceManager = new ResourceManager()
