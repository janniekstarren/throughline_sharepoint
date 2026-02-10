// ============================================
// useCardEnrichment — Computes enrichment state for a card (Mode 2)
// Determines which connected platforms are contributing signals
// ============================================

import * as React from 'react';
import {
  CardEnrichmentState,
  EnrichmentSource,
  ConnectionStatus,
} from '../models/Integration';
import { INTEGRATION_REGISTRY } from '../config/integrationRegistry';
import { getEnrichmentDescription } from '../config/enrichmentDescriptions';
import { useIntegrations } from '../context/IntegrationContext';

export function useCardEnrichment(cardId: string): CardEnrichmentState {
  const { connectorManager } = useIntegrations();

  return React.useMemo(() => {
    const enrichmentSources: EnrichmentSource[] = [];

    for (const platform of INTEGRATION_REGISTRY) {
      if (platform.enrichedCardIds.includes(cardId)) {
        const status = connectorManager.getStatus(platform.id);
        if (status === ConnectionStatus.Connected) {
          const health = connectorManager.getHealthMetrics(platform.id);
          enrichmentSources.push({
            platformId: platform.id,
            platformName: platform.name,
            category: platform.category,
            enrichmentDescription: getEnrichmentDescription(platform.id, cardId),
            signalCount: 0,
            lastSignalAt: health?.lastSuccessfulSync ?? null,
          });
        }
      }
    }

    return {
      cardId,
      isEnriched: enrichmentSources.length > 0,
      enrichmentSources,
      baseSource: 'microsoft-365' as const,
    };
  }, [cardId, connectorManager]);
}
