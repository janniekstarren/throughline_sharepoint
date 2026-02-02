import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Badge,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  PeopleSwap24Regular,
  ErrorCircle24Regular,
  Folder24Regular,
  DocumentPdf20Regular,
  Document20Regular,
  Image20Regular,
  FolderZip20Regular,
  Person16Regular,
} from '@fluentui/react-icons';
import { ISharedFile } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ISharedWithMeCardProps {
  files: ISharedFile[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

// Fluent UI 9 styles using makeStyles and design tokens
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
    color: tokens.colorNeutralForeground4,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    gap: tokens.spacingHorizontalM,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
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
  fileIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },
  fileDetails: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  fileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
  sharedBy: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
  },
  sharedDate: {
    flexShrink: 0,
  },
  fileSize: {
    flexShrink: 0,
  },
});

// File icon component using Fluent UI 9 icons
const FileTypeIcon: React.FC<{ fileType?: string }> = ({ fileType }) => {
  const type = fileType?.toLowerCase() || '';

  // Map file types to icons
  if (type === 'pdf') return <DocumentPdf20Regular />;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) return <Image20Regular />;
  if (type === 'zip') return <FolderZip20Regular />;

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

export const SharedWithMeCard: React.FC<ISharedWithMeCardProps> = ({ files, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

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
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <PeopleSwap24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Shared With Me'}</Body1Strong>
        {!loading && files.length > 0 && (
          <Badge appearance="filled" color="brand" size="small">{files.length}</Badge>
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
        ) : files.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <Folder24Regular className={styles.emptyIcon} />
              <Text>No shared files</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.fileList}>
              {files.map(file => (
                <ItemHoverCard
                  key={file.id}
                  item={file}
                  itemType="sharedFile"
                  onAction={onAction}
                  theme={theme}
                >
                  <div
                    className={styles.fileItem}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.fileIcon}>
                      <FileTypeIcon fileType={file.fileType} />
                    </div>
                    <div className={styles.fileDetails}>
                      <Body1 className={styles.fileName}>{file.name}</Body1>
                      <div className={styles.fileMeta}>
                        <Caption1 className={styles.sharedBy}>
                          <Person16Regular />
                          {file.sharedBy}
                        </Caption1>
                        <Caption1 className={styles.sharedDate}>{formatDate(file.sharedDateTime)}</Caption1>
                        <Caption1 className={styles.fileSize}>{formatFileSize(file.size)}</Caption1>
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

export default SharedWithMeCard;
