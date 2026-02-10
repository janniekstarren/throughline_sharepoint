/**
 * SuggestionChips - Centre-aligned clickable suggestion pills
 *
 * Uses time-of-day suggestions from SuggestionService.
 * Clicking a chip submits that suggestion as a query.
 * Frosted glass badge backgrounds, centre-aligned.
 */

import * as React from 'react';
import { Badge, makeStyles, tokens } from '@fluentui/react-components';
import { getSuggestions, QuerySuggestion } from '../../services/SuggestionService';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chip: {
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: tokens.shadow2,
    },
  },
});

export interface ISuggestionChipsProps {
  onSubmit: (query: string) => void;
}

export const SuggestionChips: React.FC<ISuggestionChipsProps> = ({ onSubmit }) => {
  const styles = useStyles();

  const suggestions: QuerySuggestion[] = React.useMemo(() => getSuggestions(), []);

  return (
    <div className={styles.root}>
      {suggestions.map((suggestion, index) => (
        <Badge
          key={index}
          className={styles.chip}
          appearance="outline"
          shape="rounded"
          size="medium"
          onClick={() => onSubmit(suggestion.query)}
          style={{ cursor: 'pointer' }}
        >
          {suggestion.label}
        </Badge>
      ))}
    </div>
  );
};
