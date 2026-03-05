import React, { createContext, useContext } from 'react';
import { AIModel } from '../../domains/models/types/models.types';

interface ModelsContextValue {
  models: AIModel[];
  getModelById: (modelId: string) => AIModel | undefined;
}

const ModelsContext = createContext<ModelsContextValue>({
  models: [],
  getModelById: () => undefined,
});

export const ModelsProvider: React.FC<{
  children: React.ReactNode;
  models: AIModel[];
}> = ({ children, models }) => {
  const getModelById = (modelId: string): AIModel | undefined => {
    return models.find(m => m.id === modelId);
  };

  const value: ModelsContextValue = {
    models,
    getModelById,
  };

  return (
    <ModelsContext.Provider value={value}>
      {children}
    </ModelsContext.Provider>
  );
};

export const useModels = () => {
  const context = useContext(ModelsContext);
  return context;
};
