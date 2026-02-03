// src/webparts/dashboardCards/hooks/useLocalStorage.ts

import { useState, useEffect, useCallback } from 'react';
import { PersistedState, DismissedItem, SnoozedItem } from '../models/WaitingOnYou';

const STORAGE_KEY = 'throughline_waiting_on_you';
const DISMISS_TTL_HOURS = 24;

const getDefaultState = (): PersistedState => ({
  dismissed: [],
  snoozed: [],
  lastCleanup: new Date()
});

export function useLocalStorage() {
  const [state, setState] = useState<PersistedState>(getDefaultState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        // Convert date strings back to Date objects
        const hydrated: PersistedState = {
          dismissed: parsed.dismissed.map(d => ({
            ...d,
            dismissedAt: new Date(d.dismissedAt),
            expiresAt: new Date(d.expiresAt)
          })),
          snoozed: parsed.snoozed.map(s => ({
            ...s,
            snoozedAt: new Date(s.snoozedAt),
            snoozedUntil: new Date(s.snoozedUntil)
          })),
          lastCleanup: new Date(parsed.lastCleanup)
        };
        const cleaned = cleanupExpired(hydrated);
        setState(cleaned);
        saveToStorage(cleaned);
      }
    } catch (err) {
      console.warn('Failed to load persisted state:', err);
    }
  }, []);

  const saveToStorage = useCallback((newState: PersistedState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (err) {
      console.warn('Failed to save persisted state:', err);
    }
  }, []);

  const dismissItem = useCallback((conversationId: string) => {
    setState(prev => {
      const now = new Date();
      const newDismissed: DismissedItem = {
        conversationId,
        dismissedAt: now,
        expiresAt: new Date(now.getTime() + DISMISS_TTL_HOURS * 60 * 60 * 1000)
      };

      const newState: PersistedState = {
        ...prev,
        dismissed: [...prev.dismissed.filter(d => d.conversationId !== conversationId), newDismissed]
      };

      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const snoozeItem = useCallback((conversationId: string, until: Date, reason?: string) => {
    setState(prev => {
      const newSnoozed: SnoozedItem = {
        conversationId,
        snoozedAt: new Date(),
        snoozedUntil: until,
        reason
      };

      const newState: PersistedState = {
        ...prev,
        snoozed: [...prev.snoozed.filter(s => s.conversationId !== conversationId), newSnoozed]
      };

      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const unsnoozeItem = useCallback((conversationId: string) => {
    setState(prev => {
      const newState: PersistedState = {
        ...prev,
        snoozed: prev.snoozed.filter(s => s.conversationId !== conversationId)
      };

      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const isItemDismissed = useCallback((conversationId: string): boolean => {
    const now = new Date();
    return state.dismissed.some(
      d => d.conversationId === conversationId && new Date(d.expiresAt) > now
    );
  }, [state.dismissed]);

  const isItemSnoozed = useCallback((conversationId: string): boolean => {
    const now = new Date();
    return state.snoozed.some(
      s => s.conversationId === conversationId && new Date(s.snoozedUntil) > now
    );
  }, [state.snoozed]);

  const getSnoozeInfo = useCallback((conversationId: string): SnoozedItem | undefined => {
    const now = new Date();
    return state.snoozed.find(
      s => s.conversationId === conversationId && new Date(s.snoozedUntil) > now
    );
  }, [state.snoozed]);

  const clearAll = useCallback(() => {
    const newState = getDefaultState();
    setState(newState);
    saveToStorage(newState);
  }, [saveToStorage]);

  return {
    persistedState: state,
    dismissItem,
    snoozeItem,
    unsnoozeItem,
    isItemDismissed,
    isItemSnoozed,
    getSnoozeInfo,
    clearAll
  };
}

function cleanupExpired(state: PersistedState): PersistedState {
  const now = new Date();
  return {
    dismissed: state.dismissed.filter(d => new Date(d.expiresAt) > now),
    snoozed: state.snoozed.filter(s => new Date(s.snoozedUntil) > now),
    lastCleanup: now
  };
}
