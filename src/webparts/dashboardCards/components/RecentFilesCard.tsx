// ============================================
// RecentFilesCard - Displays recently accessed files
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Theme,
} from '@fluentui/react-components';
import {
  History24Regular,
  FolderOpen24Regular,
  Folder20Regular,
  DocumentPdf20Regular,
  Document20Regular,
  Image20Regular,
} from '@fluentui/react-icons';
import { IFileItem } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface IRecentFilesCardProps {
  files: IFileItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

// File icon component using Fluent UI 9 icons
const FileTypeIcon: React.FC<{ fileType?: string; isFolder: boolean }> = ({ fileType, isFolder }) => {
  if (isFolder) return <Folder20Regular />;

  const type = fileType?.toLowerCase() || '';

  // Map file types to icons
  if (type === 'pdf') return <DocumentPdf20Regular />;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) return <Image20Regular />;

  // For Office files and others, use a styled document icon
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

export const RecentFilesCard: React.FC<IRecentFilesCardProps> = ({
  files,
  loading,
  error,
  onAction,
  theme,
  title
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

  // Empty state content
  if (!loading && !error && files.length === 0) {
    return (
      <BaseCard testId="recent-files-card">
        <CardHeader
          icon={<History24Regular />}
          title={title || 'Recent Files'}
        />
        <EmptyState
          icon={<FolderOpen24Regular />}
          title="No recent files"
          description="Files you work with will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading files..."
      testId="recent-files-card"
    >
      <CardHeader
        icon={<History24Regular />}
        title={title || 'Recent Files'}
        badge={files.length > 0 ? files.length : undefined}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {files.map(file => (
              <ItemHoverCard
                key={file.id}
                item={file}
                itemType="file"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={styles.item}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.itemIcon}>
                    <FileTypeIcon fileType={file.fileType} isFolder={file.isFolder} />
                  </div>
                  <div className={styles.itemContent}>
                    <Body1 className={styles.itemTitle}>{file.name}</Body1>
                    <div className={styles.itemMeta} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {file.lastModifiedBy && (
                        <Caption1 style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: '1 1 auto',
                          minWidth: '40px'
                        }}>
                          {file.lastModifiedBy}
                        </Caption1>
                      )}
                      <Caption1 style={{ flexShrink: 0 }}>
                        {formatDate(file.lastModifiedDateTime)}
                      </Caption1>
                      {!file.isFolder && (
                        <Caption1 style={{ flexShrink: 0 }}>
                          {formatFileSize(file.size)}
                        </Caption1>
                      )}
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

export default RecentFilesCard;
