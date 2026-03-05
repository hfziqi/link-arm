import { Message } from '../types/chat.types'
import { createLogger } from '../../shared/utils/logger'
import { handleError } from '../../shared/services/errorHandlingService'

const logger = createLogger('MessageActions')

export async function copyMessage(message: Message): Promise<void> {
  try {
    await navigator.clipboard.writeText(message.content)
    logger.info('Message copied to clipboard')
  } catch (error) {
    handleError(error, { logToConsole: true })
    throw error
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    logger.info('Text copied to clipboard')
  } catch (error) {
    handleError(error, { logToConsole: true })
    throw error
  }
}
