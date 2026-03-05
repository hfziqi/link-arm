import { useSyncExternalStore, useCallback } from 'react';

export interface StreamState {
  content: string;
  reasoning: string;
  modelId: string;
  status: 'idle' | 'streaming' | 'completed' | 'error';
  timestamp: number;
}

const streamStates = new Map<string, StreamState>();
const subscribers = new Map<string, Set<() => void>>();

const snapshotCache = new Map<string, StreamState>();

const EMPTY_STATE: StreamState = { 
  content: '', 
  reasoning: '', 
  modelId: '', 
  status: 'idle', 
  timestamp: 0 
};

const getCachedSnapshot = (messageId: string): StreamState => {
  const cached = snapshotCache.get(messageId);
  const current = streamStates.get(messageId);
  
  if (!current) {
    return cached || EMPTY_STATE;
  }
  
  const hasChanged = !cached || 
    cached.content !== current.content || 
    cached.reasoning !== current.reasoning || 
    cached.status !== current.status;
  
  if (hasChanged) {
    const newSnapshot: StreamState = { 
      content: current.content,
      reasoning: current.reasoning,
      modelId: current.modelId,
      status: current.status,
      timestamp: current.timestamp
    };
    snapshotCache.set(messageId, newSnapshot);
    return newSnapshot;
  }
  
  return cached;
};

const notify = (messageId: string) => {
  const subs = subscribers.get(messageId);
  if (subs) {
    setTimeout(() => {
      subs.forEach(cb => cb());
    }, 0);
  }
};

export const StreamMessageManager = {
  startStream(messageId: string, modelId: string = ''): void {
    streamStates.set(messageId, {
      content: '',
      reasoning: '',
      modelId,
      status: 'streaming',
      timestamp: Date.now(),
    });
    notify(messageId);
  },

  appendContent(messageId: string, chunk: string): void {
    const state = streamStates.get(messageId);
    if (state && state.status === 'streaming') {
      state.content += chunk;
      state.timestamp = Date.now();
      notify(messageId);
    }
  },

  updateContent(messageId: string, data: { content: string; reasoning: string; modelId: string; status?: StreamState['status'] }): void {
    const state = streamStates.get(messageId);
    if (state) {
      state.content = data.content;
      state.reasoning = data.reasoning;
      state.modelId = data.modelId;
      if (data.status) {
        state.status = data.status;
      }
      state.timestamp = Date.now();
      notify(messageId);
    } else {
      streamStates.set(messageId, {
        content: data.content,
        reasoning: data.reasoning,
        modelId: data.modelId,
        status: data.status || 'streaming',
        timestamp: Date.now(),
      });
      notify(messageId);
    }
  },

  completeStream(messageId: string): void {
    const state = streamStates.get(messageId);
    if (state) {
      state.status = 'completed';
      notify(messageId);
      setTimeout(() => {
        StreamMessageManager.cleanup(messageId);
      }, 5 * 60 * 1000);
    }
  },

  errorStream(messageId: string, _error: string): void {
    const state = streamStates.get(messageId);
    if (state) {
      state.status = 'error';
      notify(messageId);
      setTimeout(() => {
        StreamMessageManager.cleanup(messageId);
      }, 60 * 1000);
    }
  },

  getContent(messageId: string): string {
    return streamStates.get(messageId)?.content || '';
  },

  getReasoning(messageId: string): string {
    return streamStates.get(messageId)?.reasoning || '';
  },

  getState(messageId: string): StreamState | undefined {
    return streamStates.get(messageId);
  },

  getStatus(messageId: string): StreamState['status'] {
    return streamStates.get(messageId)?.status || 'idle';
  },

  cleanup(messageId: string): void {
    streamStates.delete(messageId);
    subscribers.delete(messageId);
    snapshotCache.delete(messageId);
  },

  subscribe(messageId: string, callback: () => void): () => void {
    if (!subscribers.has(messageId)) {
      subscribers.set(messageId, new Set());
    }
    subscribers.get(messageId)!.add(callback);
    
    return () => {
      subscribers.get(messageId)?.delete(callback);
    };
  },
};

export function useStreamContent(messageId: string): StreamState {
  const subscribe = useCallback(
    (callback: () => void) => StreamMessageManager.subscribe(messageId, callback),
    [messageId]
  );

  const getSnapshot = useCallback(() => {
    return getCachedSnapshot(messageId);
  }, [messageId]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useIsStreaming(messageId: string): boolean {
  const state = useStreamContent(messageId);
  return state.status === 'streaming';
}
