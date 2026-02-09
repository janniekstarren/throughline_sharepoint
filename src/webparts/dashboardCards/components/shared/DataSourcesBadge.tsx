// ============================================
// DataSourcesBadge — Shows data sources at the bottom of every card
// Base: "Sources: Teams · Email · Calendar"
// Enriched: adds coloured dots for connected platforms
// ============================================

import * as React from 'react';
import { makeStyles, tokens, Tooltip, Text } from '@fluentui/react-components';
import { CardEnrichmentState } from '../../models/Integration';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    paddingTop: tokens.spacingVerticalXS,
  },
  sourceTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  enrichmentDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandForeground1,
    display: 'inline-block',
  },
  separator: {
    color: tokens.colorNeutralForeground4,
  },
});

interface DataSourcesBadgeProps {
  dataSources?: string[];
  enrichment?: CardEnrichmentState;
}

export const DataSourcesBadge: React.FC<DataSourcesBadgeProps> = ({
  dataSources,
  enrichment,
}) => {
  const classes = useStyles();

  if (!dataSources?.length && !enrichment?.isEnriched) return null;

  return (
    <div className={classes.wrapper}>
      <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
        Sources:
      </Text>
      {dataSources?.map((source, i) => (
        <React.Fragment key={source}>
          {i > 0 && <span className={classes.separator}>·</span>}
          <span className={classes.sourceTag}>{source}</span>
        </React.Fragment>
      ))}
      {enrichment?.isEnriched && enrichment.enrichmentSources.map(src => (
        <React.Fragment key={src.platformId}>
          <span className={classes.separator}>·</span>
          <Tooltip
            content={src.enrichmentDescription}
            relationship="description"
          >
            <span className={classes.sourceTag}>
              <span className={classes.enrichmentDot} />
              {src.platformName}
            </span>
          </Tooltip>
        </React.Fragment>
      ))}
    </div>
  );
};
