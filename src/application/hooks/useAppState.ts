import { useModelState } from '../../domains/models/hooks/useModelState'
import { useUIStore } from '../../stores'
import { useConversationState } from '../../domains/chat/hooks/useConversationState'
import { useMessageState } from '../../domains/chat/hooks/useMessageState'

export function useAppState() {
  const conversationState = useConversationState()
  const messageState = useMessageState(conversationState)
  const modelState = useModelState()
  const uiState = useUIStore()

  return {
    ...conversationState,
    ...messageState,
    ...modelState,
    ...uiState
  }
}
