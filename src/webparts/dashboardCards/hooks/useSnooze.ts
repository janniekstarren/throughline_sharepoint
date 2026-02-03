// src/webparts/dashboardCards/hooks/useSnooze.ts

import { useState, useCallback } from 'react';
import { StaleConversation } from '../models/WaitingOnYou';

export type SnoozeOption = 'tomorrow' | 'monday' | 'nextWeek' | 'custom';

export interface UseSnoozeReturn {
  // Dialog state
  isSnoozeDialogOpen: boolean;
  targetConversation: StaleConversation | null;

  // Actions
  openSnoozeDialog: (conversation: StaleConversation) => void;
  closeSnoozeDialog: () => void;

  // Snooze date calculation
  getSnoozeDate: (option: SnoozeOption, customDate?: string) => Date;

  // Formatting
  formatSnoozeDate: (date: Date) => string;
  getSnoozeOptionLabel: (option: SnoozeOption) => string;
}

export function useSnooze(): UseSnoozeReturn {
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false);
  const [targetConversation, setTargetConversation] = useState<StaleConversation | null>(null);

  const openSnoozeDialog = useCallback((conversation: StaleConversation) => {
    setTargetConversation(conversation);
    setIsSnoozeDialogOpen(true);
  }, []);

  const closeSnoozeDialog = useCallback(() => {
    setIsSnoozeDialogOpen(false);
    setTargetConversation(null);
  }, []);

  const getSnoozeDate = useCallback((option: SnoozeOption, customDate?: string): Date => {
    const now = new Date();

    switch (option) {
      case 'tomorrow': {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      }
      case 'monday': {
        const monday = new Date(now);
        const dayOfWeek = monday.getDay();
        // Calculate days until next Monday (1 = Monday)
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
        monday.setDate(monday.getDate() + daysUntilMonday);
        monday.setHours(9, 0, 0, 0);
        return monday;
      }
      case 'nextWeek': {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(9, 0, 0, 0);
        return nextWeek;
      }
      case 'custom': {
        if (customDate) {
          const date = new Date(customDate);
          date.setHours(9, 0, 0, 0);
          return date;
        }
        return now;
      }
      default:
        return now;
    }
  }, []);

  const formatSnoozeDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getSnoozeOptionLabel = useCallback((option: SnoozeOption): string => {
    const date = getSnoozeDate(option);

    switch (option) {
      case 'tomorrow':
        return `Tomorrow morning (${formatSnoozeDate(date)})`;
      case 'monday':
        return `Monday morning (${formatSnoozeDate(date)})`;
      case 'nextWeek':
        return `Next week (${formatSnoozeDate(date)})`;
      case 'custom':
        return 'Pick a date...';
      default:
        return option;
    }
  }, [getSnoozeDate, formatSnoozeDate]);

  return {
    isSnoozeDialogOpen,
    targetConversation,
    openSnoozeDialog,
    closeSnoozeDialog,
    getSnoozeDate,
    formatSnoozeDate,
    getSnoozeOptionLabel
  };
}

// Utility function to format relative snooze time
export function formatSnoozedUntil(snoozedUntil: Date): string {
  const now = new Date();
  const diff = snoozedUntil.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Snooze expired';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Snoozed for ${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `Snoozed for ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(diff / (1000 * 60));
  return `Snoozed for ${minutes} minute${minutes > 1 ? 's' : ''}`;
}
