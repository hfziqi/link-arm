import { useState, useEffect, useMemo } from 'react'
import { UnifiedDocument, Folder } from '../types'
import { documentOperationService } from '../services/documentOperationService'
import { documentIOService } from '../document/services/DocumentIOService'
import { documentEventManager } from '../../../infrastructure/events/documentEventManager'
import { useNavigationStore } from '../../../stores/navigation.store'
import { handleError } from '../../shared/services/errorHandlingService'
import { createLogger } from '../../shared/utils/logger'

const logger = createLogger('useUnifiedDocuments')

interface FolderPath {
  id: string
  title: string
}

interface UseUnifiedDocumentsOptions {
  onDocumentsChanged?: () => void
}

export function useUnifiedDocuments(options?: UseUnifiedDocumentsOptions) {
  const { onDocumentsChanged } = options || {}

  const [allDocuments, setAllDocuments] = useState<(UnifiedDocument | Folder)[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<FolderPath[]>([])

  const {
    enterKnowledgeFolder,
    registerKnowledgeBackCallback
  } = useNavigationStore()

  const filterDocuments = (docs: (UnifiedDocument | Folder)[], folderId: string | null) => {
    if (!folderId) {
      return docs.filter(doc => !doc.parentId)
    }
    return docs.filter(doc => doc.parentId === folderId)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const docs = await documentOperationService.listDocuments()
        setAllDocuments(docs)
      } catch (error) {
        handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'loadData' } })
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const unsubscribe = documentEventManager.subscribe(() => {
      reloadDocuments()
      onDocumentsChanged?.()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    registerKnowledgeBackCallback(() => {
      if (folderPath.length > 0) {
        const newPath = folderPath.slice(0, -1)
        setFolderPath(newPath)
        const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null
        setCurrentFolderId(newFolderId)
      }
    })

    return () => {
      registerKnowledgeBackCallback(null)
    }
  }, [folderPath, registerKnowledgeBackCallback])

  useEffect(() => {
    if (folderPath.length > 0 && currentFolderId) {
      const currentFolder = folderPath[folderPath.length - 1]
      enterKnowledgeFolder(currentFolder.id, currentFolder.title)
    }
  }, [folderPath, currentFolderId, enterKnowledgeFolder])

  const currentDocuments = filterDocuments(allDocuments, currentFolderId)

  const allItems = useMemo(() => {
    if (!currentFolderId) {
      return currentDocuments.filter(item => !item.parentId)
    } else {
      return currentDocuments.filter(item => item.parentId === currentFolderId)
    }
  }, [currentDocuments, currentFolderId])

  const reloadDocuments = async () => {
    try {
      const docs = await documentOperationService.listDocuments()
      setAllDocuments(docs)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'reloadDocuments' } })
    }
  }

  const enterFolder = (folder: Folder) => {
    const newPath = [...folderPath, { id: folder.id, title: folder.title }]
    setFolderPath(newPath)
    setCurrentFolderId(folder.id)
  }

  const goBack = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1)
      setFolderPath(newPath)
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null
      setCurrentFolderId(newFolderId)
    }
  }

  const goBackFromWindowControls = () => {
    goBack()
  }

  const deleteItem = async (id: string, itemType: string) => {
    try {
      const type = mapFileTypeToResourceType(itemType)
      await documentOperationService.deleteResource({ id, type })
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'deleteItem' } })
      throw error
    }
  }

  const mapFileTypeToResourceType = (fileType: string): 'document' | 'folder' => {
    switch (fileType) {
      case 'folder':
        return 'folder'
      case 'txt':
      case 'docx':
      default:
        return 'document'
    }
  }

  const renameItem = async (id: string, newTitle: string, itemType: string) => {
    try {
      const type = mapFileTypeToResourceType(itemType)
      await documentOperationService.renameResource({ id, type, new_name: newTitle })
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'renameItem' } })
      throw error
    }
  }

  const createDocument = async (fileType: 'txt' | 'docx') => {
    try {
      await documentOperationService.createDocument({
        file_type: fileType,
        parent_id: currentFolderId || undefined
      })
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'createDocument' } })
      throw error
    }
  }

  const createFolder = async () => {
    try {
      await documentOperationService.createFolder({
        parent_id: currentFolderId || undefined
      })
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'createFolder' } })
      throw error
    }
  }

  const openItem = async (item: UnifiedDocument | Folder) => {
    try {
      if (item.fileType === 'folder') {
        enterFolder(item as Folder)
      } else {
        const extension = item.fileType === 'docx' ? '.docx' : '.txt'
        await documentIOService.openDocument(item.id, extension, item.parentId)
      }
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'openItem' } })
      throw error
    }
  }

  const downloadItem = async (item: UnifiedDocument | Folder) => {
    if (item.fileType === 'folder') {
      try {
        const targetPath = await documentIOService.downloadFolder(
          item.id,
          item.title,
          item.parentId
        )
        logger.info(`Folder downloaded to: ${targetPath}`)
      } catch (error) {
        handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'downloadFolder' } })
        throw error
      }
      return
    }
    try {
      const content = (item as UnifiedDocument).content || ''
      const extension = item.fileType === 'docx' ? '.docx' : '.txt'
      await documentIOService.downloadDocument(item.id, content, item.title, extension)
    } catch (error) {
      handleError(error, { showToast: false, logToConsole: true, context: { source: 'useUnifiedDocuments', action: 'downloadItem' } })
      throw error
    }
  }

  return {
    allItems,
    loading,
    currentFolderId,
    folderPath,
    enterFolder,
    goBack,
    goBackFromWindowControls,
    deleteItem,
    renameItem,
    createDocument,
    createFolder,
    openItem,
    downloadItem
  }
}
