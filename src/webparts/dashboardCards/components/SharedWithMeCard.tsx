// ============================================
// SharedWithMeCard - Displays files shared with the user
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Theme,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  PeopleSwap24Regular,
  Folder24Regular,
  DocumentPdf20Regular,
  Document20Regular,
  Image20Regular,
  FolderZip20Regular,
  Person16Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { ISharedFile } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface ISharedWithMeCardProps {
  files: ISharedFile[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

// File icon component using Fluent UI 9 icons
const FileTypeIcon: React.FC<{ fileType?: string }> = ({ fileType }) => {
  const type = fileType?.toLowerCase() || '';

  if (type === 'pdf') return <DocumentPdf20Regular />;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) return <Image20Regular />;
  if (type === 'zip') return <FolderZip20Regular />;

  const getFileStyle = (): React.CSSProperties => {
    const colorMap: Record<string, string> = {
      'docx': '#2b579a',
      'doc': '#2b579a',
      'xlsx': '#217346',
      'xls': '#217346',
      'pptx': '#d24726',
      'ppt': '#d24726',
    };
    return { color: colorMap[type] || tokens.colorNeutralForeground2 };
  };

  return <Document20Regular style={getFileStyle()} />;
};

export const SharedWithMeCard: React.FC<ISharedWithMeCardProps> = ({
  files,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

  // Empty state
  if (!loading && !error && files.length === 0) {
    return (
      <BaseCard testId="shared-with-me-card">
        <CardHeader
          icon={<PeopleSwap24Regular />}
          title={title || 'Shared With Me'}
          cardId="sharedWithMe"
          actions={expandButton}
        />
        <EmptyState
          icon={<Folder24Regular />}
          title="No shared files"
          description="Files shared with you will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading shared files..."
      testId="shared-with-me-card"
    >
      <CardHeader
        icon={<PeopleSwap24Regular />}
        title={title || 'Shared With Me'}
        cardId="sharedWithMe"
        badge={files.length > 0 ? files.length : undefined}
        badgeVariant="brand"
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {files.map(file => (
              <ItemHoverCard
                key={file.id}
                item={file}
                itemType="sharedFile"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={styles.item}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.itemIcon}>
                    <FileTypeIcon fileType={file.fileType} />
                  </div>
                  <div className={styles.itemContent}>
                    <Body1 className={styles.itemTitle}>{file.name}</Body1>
                    <div className={styles.itemMeta} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Caption1 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacingHorizontalXS,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: '1 1 auto',
                        minWidth: '40px'
                      }}>
                        <Person16Regular />
                        {file.sharedBy}
                      </Caption1>
                      <Caption1 style={{ flexShrink: 0 }}>
                        {formatDate(file.sharedDateTime)}
                      </Caption1>
                      <Caption1 style={{ flexShrink: 0 }}>
                        {formatFileSize(file.size)}
                      </Caption1>
                    </div>
                  </div>
                </div>
              </ItemHoverCard>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default SharedWithMeCard;
