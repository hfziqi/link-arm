import React from 'react'
import { Modal } from '../ui'
import { AddModelForm } from './AddModelForm'
import { AddModelFormData } from '../../../domains/models/types/addModel'

export interface AddModelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddModelFormData) => Promise<void>
  isLoading?: boolean
}

export const AddModelModal: React.FC<AddModelModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <AddModelForm
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  )
}
