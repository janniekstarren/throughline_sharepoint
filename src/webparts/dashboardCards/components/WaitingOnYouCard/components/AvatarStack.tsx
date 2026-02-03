// src/webparts/dashboardCards/components/WaitingOnYouCard/components/AvatarStack.tsx

import * as React from 'react';
import {
  Avatar,
  AvatarGroup,
  AvatarGroupItem,
  AvatarGroupPopover,
  partitionAvatarGroupItems,
  Tooltip,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { Person } from '../../../models/WaitingOnYou';

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  popoverContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
  },
  personRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

interface AvatarStackProps {
  people: Person[];
  maxVisible?: number;
  size?: 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  people,
  maxVisible = 3,
  size = 24
}) => {
  const styles = useStyles();

  if (people.length === 0) {
    return null;
  }

  if (people.length === 1) {
    const person = people[0];
    return (
      <Tooltip content={person.displayName} relationship="label">
        <Avatar
          name={person.displayName}
          image={person.photoUrl ? { src: person.photoUrl } : undefined}
          size={size}
        />
      </Tooltip>
    );
  }

  const { inlineItems, overflowItems } = partitionAvatarGroupItems({
    items: people.map(p => p.displayName),
    maxInlineItems: maxVisible
  });

  return (
    <div className={styles.container}>
      <AvatarGroup layout="stack" size={size}>
        {inlineItems.map((name, index) => {
          const person = people.find(p => p.displayName === name);
          return (
            <AvatarGroupItem
              key={person?.id || index}
              name={name}
              image={person?.photoUrl ? { src: person.photoUrl } : undefined}
            />
          );
        })}

        {overflowItems && overflowItems.length > 0 && (
          <AvatarGroupPopover>
            <div className={styles.popoverContent}>
              {overflowItems.map((name, index) => {
                const person = people.find(p => p.displayName === name);
                return (
                  <div key={person?.id || index} className={styles.personRow}>
                    <Avatar
                      name={name}
                      image={person?.photoUrl ? { src: person.photoUrl } : undefined}
                      size={24}
                    />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          </AvatarGroupPopover>
        )}
      </AvatarGroup>
    </div>
  );
};
