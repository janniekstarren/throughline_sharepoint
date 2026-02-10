/**
 * FollowUpChips - Follow-up question pills after query results
 *
 * Clicking a chip submits that follow-up as a new query.
 */

import * as React from 'react';
import { Badge } from '@fluentui/react-components';
import { useResultsStyles } from './hubStyles';

export interface IFollowUpChipsProps {
  followUps: string[];
  onFollowUp: (query: string) => void;
}

export const FollowUpChips: React.FC<IFollowUpChipsProps> = ({ followUps, onFollowUp }) => {
  const styles = useResultsStyles();

  if (!followUps || followUps.length === 0) return null;

  return (
    <div className={styles.followUps}>
      {followUps.map((followUp, index) => (
        <Badge
          key={index}
          appearance="tint"
          shape="rounded"
          size="medium"
          onClick={() => onFollowUp(followUp)}
          style={{ cursor: 'pointer' }}
        >
          {followUp}
        </Badge>
      ))}
    </div>
  );
};
