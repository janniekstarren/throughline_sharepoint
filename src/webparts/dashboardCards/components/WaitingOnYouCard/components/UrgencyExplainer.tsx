// src/webparts/dashboardCards/components/WaitingOnYouCard/components/UrgencyExplainer.tsx

import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Text,
  Badge,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { InfoRegular } from '@fluentui/react-icons';
import { UrgencyFactor } from '../../../models/WaitingOnYou';

const useStyles = makeStyles({
  trigger: {
    cursor: 'help',
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: tokens.spacingHorizontalXS,
  },
  surface: {
    maxWidth: '280px',
    padding: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  factorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  baseScore: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalXS,
  },
  factor: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    color: tokens.colorPaletteDarkOrangeForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

interface UrgencyExplainerProps {
  score: number;
  factors: UrgencyFactor[];
}

export const UrgencyExplainer: React.FC<UrgencyExplainerProps> = ({ score, factors }) => {
  const styles = useStyles();

  const getScoreColor = (): 'danger' | 'warning' | 'informative' => {
    if (score >= 9) return 'danger';
    if (score >= 7) return 'warning';
    return 'informative';
  };

  return (
    <Popover withArrow positioning="above">
      <PopoverTrigger disableButtonEnhancement>
        <span className={styles.trigger}>
          <InfoRegular style={{ fontSize: '14px', color: tokens.colorNeutralForeground3 }} />
        </span>
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        <div className={styles.header}>
          <Text weight="semibold">Why this urgency?</Text>
          <Badge appearance="filled" color={getScoreColor()}>{score}/10</Badge>
        </div>

        <div className={styles.factorList}>
          <Text size={200} className={styles.baseScore}>
            Base score: 5
          </Text>

          {factors.map((factor, index) => (
            <div key={index} className={styles.factor}>
              <Text size={200}>{factor.description}</Text>
              <Text size={200} className={styles.points}>+{factor.points}</Text>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <Text weight="semibold" size={200}>Total</Text>
          <Text weight="semibold" size={200}>{score}/10</Text>
        </div>
      </PopoverSurface>
    </Popover>
  );
};
