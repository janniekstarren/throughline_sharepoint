import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  mergeClasses,
  Tooltip,
} from '@fluentui/react-components';
import {
  Settings24Regular,
  Eye24Regular,
  EyeOff24Regular,
  Delete24Regular,
  Info16Regular,
} from '@fluentui/react-icons';

export interface IMiniCardProps {
  cardId: string;
  title: string;
  icon: React.ReactElement;
  visible: boolean;
  description?: string;
  onSettingsClick: () => void;
  onVisibilityToggle: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  isDragging?: boolean;
}

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '140px',
    height: '120px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    cursor: 'grab',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  cardHidden: {
    opacity: 0.5,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  cardDragging: {
    opacity: 0.8,
    boxShadow: tokens.shadow16,
    transform: 'scale(1.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  icon: {
    fontSize: '28px',
    color: tokens.colorBrandForeground1,
  },
  iconHidden: {
    color: tokens.colorNeutralForeground4,
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalS,
    textAlign: 'center',
  },
  title: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  titleHidden: {
    color: tokens.colorNeutralForeground4,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: tokens.spacingVerticalXS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  actionButton: {
    minWidth: '32px',
    height: '28px',
    padding: '4px',
  },
  infoIcon: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
    cursor: 'help',
    ':hover': {
      color: tokens.colorBrandForeground1,
    },
  },
  headerContainer: {
    position: 'relative',
  },
});

export const MiniCard: React.FC<IMiniCardProps> = ({
  cardId,
  title,
  icon,
  visible,
  description,
  onSettingsClick,
  onVisibilityToggle,
  onDelete,
  showDelete = false,
  isDragging = false,
}) => {
  const styles = useStyles();

  const handleSettingsClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSettingsClick();
  };

  const handleVisibilityClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onVisibilityToggle();
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className={mergeClasses(
        styles.card,
        !visible && styles.cardHidden,
        isDragging && styles.cardDragging
      )}
      data-card-id={cardId}
    >
      <div className={mergeClasses(styles.header, styles.headerContainer)}>
        <span className={mergeClasses(styles.icon, !visible && styles.iconHidden)}>
          {icon}
        </span>
        {description && (
          <Tooltip content={description} relationship="description" positioning="above">
            <span className={styles.infoIcon}>
              <Info16Regular />
            </span>
          </Tooltip>
        )}
      </div>
      <div className={styles.content}>
        <Text className={mergeClasses(styles.title, !visible && styles.titleHidden)}>
          {title}
        </Text>
      </div>
      <div className={styles.actions}>
        <Button
          appearance="subtle"
          size="small"
          icon={<Settings24Regular />}
          className={styles.actionButton}
          onClick={handleSettingsClick}
          title="Configure card"
        />
        <Button
          appearance="subtle"
          size="small"
          icon={visible ? <Eye24Regular /> : <EyeOff24Regular />}
          className={styles.actionButton}
          onClick={handleVisibilityClick}
          title={visible ? 'Hide card' : 'Show card'}
        />
        {showDelete && (
          <Button
            appearance="subtle"
            size="small"
            icon={<Delete24Regular />}
            className={styles.actionButton}
            onClick={handleDeleteClick}
            title="Remove from category"
          />
        )}
      </div>
    </div>
  );
};

export default MiniCard;
