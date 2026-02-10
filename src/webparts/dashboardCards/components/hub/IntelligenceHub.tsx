/**
 * IntelligenceHub - Main container for Zone 1.5
 *
 * Single-column 700px centre-aligned layout:
 * - HubSummaryStatement (attention / signals text)
 * - HubMetricTiles (4 sparkline tiles)
 * - HubQueryBox (frosted glass query box) + ThinkingAnimation / QueryResultDisplay
 * - HubInsightsGrid (full-width expandable 3-column grid)
 *
 * Greeting is rendered externally (in DashboardCards.tsx).
 * Hub visibility is controlled externally via eye toggle.
 *
 * Accepts an optional shared queryInterface (from useQueryInterface) so the
 * floating AI dialog and Hub share query state. If not provided, creates its own.
 */

import * as React from 'react';
import { useHubContainerStyles } from './hubStyles';
import { HubSummaryStatement } from './HubSummaryStatement';
import { HubMetricTiles } from './HubMetricTiles';
import { HubQueryBox } from './HubQueryBox';
import { ThinkingAnimation } from './ThinkingAnimation';
import { QueryResultDisplay } from './QueryResultDisplay';
import { HubInsightsGrid } from './HubInsightsGrid';
import {
  IntelligenceHubProvider,
  useIntelligenceHub,
} from '../../context/IntelligenceHubContext';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { useQueryEngine } from '../../hooks/useQueryEngine';
import { useInsightRollup } from '../../hooks/useInsightRollup';
import { IQueryInterface } from '../../hooks/useQueryInterface';
import { QUERY_INTENTS } from '../../config/queryIntents';

// ============================================
// Props
// ============================================

export interface IIntelligenceHubProps {
  /** User display name */
  userName: string;
  /** Initial collapsed state (from persisted prefs) — kept for compat */
  hubCollapsed: boolean;
  /** Callback when collapsed state changes — kept for compat */
  onHubCollapsedChange: (collapsed: boolean) => void;
  /** Feature flags for toggling sub-components */
  showQueryBox?: boolean;
  showInsightsRollup?: boolean;
  /** Shared query interface (from DashboardCards) — if provided, Hub and Dialog share state */
  queryInterface?: IQueryInterface;
  /** Ref to attach to query box for IntersectionObserver (floating icon visibility) */
  queryBoxRef?: React.RefObject<HTMLDivElement>;
  /** Salutation type for greeting in summary line */
  salutationType?: string;
}

// ============================================
// Inner Component (consumes context)
// ============================================

const IntelligenceHubInner: React.FC<IIntelligenceHubProps> = ({
  userName,
  showQueryBox = true,
  showInsightsRollup = true,
  queryInterface: externalQueryInterface,
  queryBoxRef,
  salutationType,
}) => {
  const styles = useHubContainerStyles();
  const hubState = useIntelligenceHub();
  const flags = useFeatureFlags();

  // Use external query interface if provided, otherwise create local one
  const localQueryEngine = useQueryEngine();
  const [localQueryText, setLocalQueryText] = React.useState('');

  // Compute local thinkingSourceNames for fallback
  const localThinkingSourceNames = React.useMemo(() => {
    const text = externalQueryInterface ? externalQueryInterface.queryText : localQueryText;
    const intent = QUERY_INTENTS.find(i =>
      i.patterns.some(p => p.test(text.toLowerCase()))
    );
    if (intent && intent.id !== 'fallback') {
      return intent.cardSources.slice(0, 4);
    }
    return ['Stale Conversations', 'Broken Promises', 'Focus Time Defender'];
  }, [externalQueryInterface, localQueryText]);

  // Unified query methods — either from shared interface or local
  const queryText = externalQueryInterface ? externalQueryInterface.queryText : localQueryText;
  const setQueryText = externalQueryInterface ? externalQueryInterface.setQueryText : setLocalQueryText;
  const isProcessing = externalQueryInterface ? externalQueryInterface.isProcessing : localQueryEngine.isProcessing;
  const results = externalQueryInterface ? externalQueryInterface.results : localQueryEngine.results;
  const thinkingSourceNames = externalQueryInterface ? externalQueryInterface.thinkingSourceNames : localThinkingSourceNames;

  const handleSubmitQuery = React.useCallback(
    async (query: string) => {
      if (externalQueryInterface) {
        await externalQueryInterface.submitQuery(query);
      } else {
        setLocalQueryText(query);
        hubState.setQueryText(query);
        await localQueryEngine.submitQuery(query);
      }
    },
    [externalQueryInterface, hubState, localQueryEngine]
  );

  const handleFollowUp = React.useCallback(
    async (query: string) => {
      if (externalQueryInterface) {
        await externalQueryInterface.handleFollowUp(query);
      } else {
        setLocalQueryText(query);
        hubState.setQueryText(query);
        await localQueryEngine.submitQuery(query);
      }
    },
    [externalQueryInterface, hubState, localQueryEngine]
  );

  const handleDismiss = React.useCallback(() => {
    if (externalQueryInterface) {
      externalQueryInterface.clearResults();
    } else {
      localQueryEngine.clearResults();
      setLocalQueryText('');
      hubState.setQueryText('');
    }
  }, [externalQueryInterface, localQueryEngine, hubState]);

  // Load insights
  const insightRollup = useInsightRollup(flags.insightsRefreshInterval);

  // Feed insights summary into hub context
  React.useEffect(() => {
    hubState.setInsightsSummary(insightRollup.summary);
  }, [insightRollup.summary]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check feature flags
  const shouldShowQueryBox = showQueryBox && flags.showQueryBox !== false;
  const shouldShowInsightsRollup = showInsightsRollup && flags.showInsightsRollup !== false;

  return (
    <div className={styles.root}>
      {/* Centre column: summary, metrics, query box, results */}
      <div className={styles.centerColumn}>
        {/* Greeting + summary statement */}
        {insightRollup.summary && (
          <HubSummaryStatement
            summary={insightRollup.summary}
            userName={userName}
            salutationType={salutationType}
          />
        )}

        {/* Metric tiles */}
        <HubMetricTiles />

        {/* Query box (frosted glass) */}
        {shouldShowQueryBox && (
          <HubQueryBox
            queryText={queryText}
            onQueryTextChange={setQueryText}
            onSubmit={handleSubmitQuery}
            isProcessing={isProcessing}
            hasResults={!!results}
            queryBoxRef={queryBoxRef}
          />
        )}

        {/* Thinking animation */}
        {isProcessing && (
          <ThinkingAnimation sourceNames={thinkingSourceNames} />
        )}

        {/* Results */}
        {results && !isProcessing && (
          <QueryResultDisplay
            results={results}
            onFollowUp={handleFollowUp}
            onDismiss={handleDismiss}
          />
        )}
      </div>

      {/* Full-width: expandable insights grid */}
      {shouldShowInsightsRollup && (
        <div className={styles.fullWidth}>
          <HubInsightsGrid
            insights={insightRollup.insights}
            summary={insightRollup.summary}
            onRefresh={insightRollup.refresh}
            lastUpdated={insightRollup.lastUpdated}
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// Outer Wrapper (provides context)
// ============================================

export const IntelligenceHub: React.FC<IIntelligenceHubProps> = (props) => {
  return (
    <IntelligenceHubProvider
      initialCollapsed={props.hubCollapsed}
      onCollapsedChange={props.onHubCollapsedChange}
    >
      <IntelligenceHubInner {...props} />
    </IntelligenceHubProvider>
  );
};
