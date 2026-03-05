import React from 'react'
import { ModelItem } from './ModelItem'
import { AIModel } from '../../../domains/models/types/models.types'
import {
  getModelDisplayName,
  getModelLogo
} from '../../../domains/models/utils/modelHelpers'

interface ModelListProps {
  models: AIModel[]
  activeModelId: string | null
  onSelectModel: (modelId: string) => void
  onDeleteModel?: (id: string) => void
}

export const ModelList: React.FC<ModelListProps> = ({
  models,
  activeModelId,
  onSelectModel,
  onDeleteModel
}) => {
  return (
    <>
      {models.map((model) => {
        const displayName = getModelDisplayName(model)
        const logo = getModelLogo(model)

        return (
          <ModelItem
            key={model.id}
            id={model.id}
            displayName={displayName}
            logo={logo}
            selected={activeModelId === model.id}
            onSelect={onSelectModel}
            onDelete={onDeleteModel}
            showDeleteAction={true}
            model={model}
          />
        )
      })}
    </>
  )
}
