import { ContextMenuItem } from '../../shared/types/ui.types'

export function buildModelManagerContextMenuItems(onAction: (action: string) => void): ContextMenuItem[] {
  return [
    {
      id: 'add-model',
      label: 'Add Model',
      onClick: () => onAction('add-model')
    }
  ]
}
