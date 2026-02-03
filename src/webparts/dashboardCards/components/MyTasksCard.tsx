import * as React from 'react';
import {
  makeStyles,
  tokens,
  mergeClasses,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Badge,
  Checkbox,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr24Regular,
  ErrorCircle24Regular,
  CheckmarkCircle24Regular,
  Important16Filled,
  CalendarLtr16Regular,
} from '@fluentui/react-icons';
import { ITaskItem } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IMyTasksCardProps {
  tasks: ITaskItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    flex: 1,
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  errorIcon: {
    fontSize: '24px',
    color: tokens.colorPaletteRedForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  emptyIcon: {
    fontSize: '32px',
    color: tokens.colorPaletteGreenForeground1,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  taskItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    gap: tokens.spacingHorizontalS,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  overdue: {
    borderLeft: `3px solid ${tokens.colorPaletteRedBorder1}`,
  },
  checkbox: {
    flexShrink: 0,
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  taskTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground1,
  },
  titleText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  importantIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
  listName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dueDate: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
  },
  overdueDue: {
    color: tokens.colorPaletteRedForeground1,
  },
});

export const MyTasksCard: React.FC<IMyTasksCardProps> = ({ tasks, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const formatDueDate = (date: Date | undefined): string => {
    if (!date) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (taskDate < today) return 'Overdue';

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <TaskListSquareLtr24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'My Tasks'}</Body1Strong>
        {!loading && tasks.length > 0 && (
          <Badge appearance="filled" color="brand" size="small">{tasks.length}</Badge>
        )}
      </div>
      <div className={styles.cardContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <ErrorCircle24Regular className={styles.errorIcon} />
            <Text>{error}</Text>
          </div>
        ) : tasks.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <CheckmarkCircle24Regular className={styles.emptyIcon} />
              <Text>All tasks completed!</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.taskList}>
              {tasks.map(task => (
                <ItemHoverCard
                  key={task.id}
                  item={task}
                  itemType="task"
                  onAction={onAction}
                  theme={theme}
                >
                  <div
                    className={mergeClasses(
                      styles.taskItem,
                      task.isOverdue && styles.overdue
                    )}
                    role="button"
                    tabIndex={0}
                  >
                    <Checkbox checked={false} disabled className={styles.checkbox} />
                    <div className={styles.taskContent}>
                      <div className={styles.taskTitle}>
                        {task.importance === 'high' && (
                          <Important16Filled className={styles.importantIcon} />
                        )}
                        <Body1 className={styles.titleText}>{task.title}</Body1>
                      </div>
                      <div className={styles.taskMeta}>
                        <Caption1 className={styles.listName}>{task.listName}</Caption1>
                        {task.dueDateTime && (
                          <Caption1 className={mergeClasses(
                            styles.dueDate,
                            task.isOverdue && styles.overdueDue
                          )}>
                            <CalendarLtr16Regular />
                            {formatDueDate(task.dueDateTime)}
                          </Caption1>
                        )}
                      </div>
                    </div>
                  </div>
                </ItemHoverCard>
              ))}
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default MyTasksCard;
