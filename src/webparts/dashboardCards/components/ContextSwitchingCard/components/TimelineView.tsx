// ============================================
// Timeline View Component
// Displays recent context switches in a timeline list
// ============================================

import * as React from 'react';
import { Text } from '@fluentui/react-components';
import {
  MailRegular,
  ChatRegular,
  PeopleRegular,
  VideoRegular,
  DocumentRegular,
  TaskListSquareLtrRegular,
  CalendarLtrRegular,
  CircleRegular
} from '@fluentui/react-icons';
import { ContextSwitch, ContextType, getContextTypeColor } from '../../../models/ContextSwitching';
import { useContextSwitchingStyles } from '../ContextSwitchingCard.styles';

interface TimelineViewProps {
  switches: ContextSwitch[];
  onItemClick?: (item: ContextSwitch) => void;
  maxItems?: number;
}

// Get icon for context type
const getContextIcon = (type: ContextType): React.ReactElement => {
  const iconProps = { style: { fontSize: '16px' } };

  switch (type) {
    case 'email':
      return <MailRegular {...iconProps} />;
    case 'teams-chat':
      return <ChatRegular {...iconProps} />;
    case 'teams-channel':
      return <PeopleRegular {...iconProps} />;
    case 'meeting':
      return <VideoRegular {...iconProps} />;
    case 'file':
      return <DocumentRegular {...iconProps} />;
    case 'task':
      return <TaskListSquareLtrRegular {...iconProps} />;
    case 'calendar':
      return <CalendarLtrRegular {...iconProps} />;
    default:
      return <CircleRegular {...iconProps} />;
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  switches,
  onItemClick,
  maxItems = 10
}) => {
  const styles = useContextSwitchingStyles();

  // Sort by timestamp descending (most recent first)
  const sortedSwitches = [...switches]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleClick = (item: ContextSwitch): void => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.webUrl) {
      window.open(item.webUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (sortedSwitches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CircleRegular className={styles.emptyIcon} />
        <Text>No context switches recorded today</Text>
      </div>
    );
  }

  return (
    <div className={styles.timelineList}>
      {sortedSwitches.map(item => {
        const color = getContextTypeColor(item.contextType);

        return (
          <div
            key={item.id}
            className={styles.timelineItem}
            onClick={() => handleClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(item);
              }
            }}
          >
            <div
              className={styles.timelineIcon}
              style={{
                backgroundColor: `${color}20`,
                color: color
              }}
            >
              {getContextIcon(item.contextType)}
            </div>
            <div className={styles.timelineContent}>
              <Text className={styles.timelineTitle}>{item.contextName}</Text>
              <Text className={styles.timelineSubtitle}>
                {formatTime(item.timestamp)}
                {item.person && ` · ${item.person.displayName}`}
                {item.project && ` · ${item.project}`}
              </Text>
            </div>
            <Text className={styles.timelineDuration}>
              {formatDuration(item.duration)}
            </Text>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;
