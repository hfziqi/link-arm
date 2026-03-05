export enum ResourceType {
  DOCUMENT = 'document',
  TASK = 'task',
  FOLDER = 'folder',
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf'
}

export interface IResource {
  id: string
  name: string
  type: ResourceType
  parentId?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface ListResourcesParams {
  filter?: ResourceType[]
  parentId?: string
}

export interface IResourceProvider {
  readonly resourceType: ResourceType
  listResources(parentId?: string): Promise<IResource[]>
  getResource(id: string): Promise<IResource | null>
  deleteResource(id: string): Promise<boolean>
  renameResource(id: string, newName: string): Promise<boolean>
}

export interface IResourceManager {
  registerProvider(provider: IResourceProvider): void
  listAllResources(params?: ListResourcesParams): Promise<IResource[]>
  listResourcesByType(type: ResourceType, parentId?: string): Promise<IResource[]>
  getResource(id: string, type: ResourceType): Promise<IResource | null>
  deleteResource(id: string, type: ResourceType): Promise<boolean>
  renameResource(id: string, type: ResourceType, newName: string): Promise<boolean>
}
