import * as React from 'react';
import {
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  History24Regular,
  ErrorCircle24Regular,
  FolderOpen24Regular,
  Folder20Regular,
  DocumentPdf20Regular,
  Document20Regular,
  Image20Regular,
} from '@fluentui/react-icons';
import { IFileItem } from '../services/GraphService';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

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
    return { color: colorMap[type] || '#605e5c' };
  };

  return <Document20Regular style={getFileStyle()} />;
};

export const RecentFilesCard: React.FC<IRecentFilesCardProps> = ({ files, loading, error, onAction, theme, title }) => {
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

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <History24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'Recent Files'}</Body1Strong>
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
          ) : files.length === 0 ? (
            <div className={styles.emptyState}>
              <FolderOpen24Regular className={styles.emptyIcon} />
              <Text>No recent files</Text>
            </div>
          ) : (
            <div className={styles.itemList}>
              {files.map((file, index) => (
                <ListItemEnter key={file.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: tokens.colorNeutralForeground2,
                          flexShrink: 0
                        }}>
                          <FileTypeIcon fileType={file.fileType} isFolder={file.isFolder} />
                        </div>
                        <div className={styles.itemContent}>
                          <Body1 className={styles.itemTitle}>{file.name}</Body1>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            {file.lastModifiedBy && (
                              <Caption1 className={styles.itemMeta} style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.lastModifiedBy}</Caption1>
                            )}
                            <Caption1 className={styles.itemMeta}>{formatDate(file.lastModifiedDateTime)}</Caption1>
                            {!file.isFolder && (
                              <Caption1 className={styles.itemMeta}>{formatFileSize(file.size)}</Caption1>
                            )}
                          </div>
                        </div>
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default RecentFilesCard;
