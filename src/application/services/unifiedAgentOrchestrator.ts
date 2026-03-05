import { AGIOrchestrator } from '../../domains/agi/core/AGIOrchestrator'
import { modelOrchestration } from '../../domains/models/services/modelOrchestration'
import { StreamMessageManager } from '../services/StreamMessageManager'
import { createLogger } from '../../domains/shared/utils/logger'
import type { Message } from '../../domains/chat/types/chat.types'

import { documentDataService } from '../../domains/unified-knowledge/document/services/DocumentDataService'
import { documentOperationService } from '../../domains/unified-knowledge/services/documentOperationService'
import type { BusinessToolsDependencies } from '../../domains/tools-v2'

const logger = createLogger('UnifiedAgentOrchestrator')

const businessDependencies: BusinessToolsDependencies = {
  fileService: {
    listFiles: (params) => documentDataService.listFiles(params),
    readFile: (fileId) => documentDataService.readFile(fileId),
    writeFile: (fileId, content, fileType) => documentDataService.writeFile(fileId, content, fileType as any),
    createFile: (params) => documentDataService.createFile(params),
    deleteFile: (fileId, recursive) => documentDataService.deleteFile(fileId, recursive),
    renameFile: (fileId, newTitle) => documentDataService.renameFile(fileId, newTitle),
    copyFile: (fileId, newTitle, parentId) => documentDataService.copyFile(fileId, newTitle, parentId)
  },
  knowledgeService: {
    createDocument: (title, content, fileType, parentId) =>
      documentOperationService.createDocument({
        title,
        content,
        file_type: fileType as 'txt' | 'docx',
        parent_id: parentId
      }),
    createFolder: (title, parentId) =>
      documentOperationService.createFolder({
        title,
        parent_id: parentId
      }),
    getOrCreateFolder: (title, parentId) =>
      documentOperationService.getOrCreateFolder({
        title,
        parent_id: parentId
      }),
    deleteResource: (id, type) =>
      documentOperationService.deleteResource({ id, type }),
    renameResource: (id, type, newName) =>
      documentOperationService.renameResource({ id, type, new_name: newName }),
    moveResource: (id, type, targetParentId) =>
      documentOperationService.moveResource({ id, type, target_parent_id: targetParentId })
  }
}

export interface UnifiedAgentParams {
  conversationId: string
  messageContent: string
  modelId: string
  aiMessageId: string
  replaceMessage: (conversationId: string, messageId: string, message: Omit<Message, 'conversationId'> | null) => void
  addMessage: (conversationId: string, message: Omit<Message, 'conversationId'>) => void
  historyMessages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface UnifiedAgentResult {
  success: boolean
  content: string
}

export class UnifiedAgentOrchestrator {
  async process(params: UnifiedAgentParams): Promise<UnifiedAgentResult> {
    const { messageContent, aiMessageId, conversationId, historyMessages } = params

    logger.info(`[UnifiedAgentOrchestrator] Starting to process: ${messageContent.slice(0, 50)}...`)
    logger.info(`[UnifiedAgentOrchestrator] Using AGI collaboration mode`)

    try {
      const mainModel = await modelOrchestration.getSelectedModel()

      const agiOrchestrator = await AGIOrchestrator.create({
        mainModel: mainModel!,
        sessionId: conversationId,
        messageId: aiMessageId,
        maxRetries: 2,
        qualityThreshold: 60,
        enableCollaborationPanel: true,
        businessDependencies
      })

      const stream = agiOrchestrator.runStream(messageContent, historyMessages)

      const response = new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })

      await this.consumeStream(response, params)

      logger.info(`[UnifiedAgentOrchestrator] AGI mode processing completed`)

      return {
        success: true,
        content: ''
      }

    } catch (error) {
      logger.error('[UnifiedAgentOrchestrator] Processing failed:', error)
      StreamMessageManager.errorStream(aiMessageId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private async consumeStream(
    response: Response,
    params: UnifiedAgentParams
  ): Promise<void> {
    const { conversationId, aiMessageId, modelId, replaceMessage } = params

    if (!response.body) {
      throw new Error('Response body is empty')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let content = ''
    let reasoning = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)

          if (parsed.type === 'orchestrator') {
            continue
          }

          const delta = parsed.choices?.[0]?.delta
          if (delta?.content) {
            content += delta.content
          }
          if (delta?.reasoning_content) {
            reasoning += delta.reasoning_content
          }

          StreamMessageManager.updateContent(aiMessageId, {
            content,
            reasoning,
            modelId,
            status: 'streaming'
          })
        } catch {
        }
      }
    }

    StreamMessageManager.updateContent(aiMessageId, {
      content,
      reasoning,
      modelId,
      status: 'completed'
    })

    replaceMessage(conversationId, aiMessageId, {
      id: aiMessageId,
      role: 'assistant',
      content,
      reasoningContent: reasoning,
      modelId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    logger.info(`[UnifiedAgentOrchestrator] Stream response processed, content length: ${content.length}`)
  }
}

export const unifiedAgentOrchestrator = new UnifiedAgentOrchestrator()
