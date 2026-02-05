// ============================================
// RecentFilesCardLarge - Large card variant for Recent Files
// Master-detail layout with file details panel
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  History24Regular,
  FolderOpen24Regular,
  Folder20Regular,
  Folder24Regular,
  DocumentPdf20Regular,
  DocumentPdf24Regular,
  Document20Regular,
  Document24Regular,
  Image20Regular,
  Image24Regular,
  Person24Regular,
  Clock24Regular,
  ArrowDownload24Regular,
  Link24Regular,
  Open24Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { IFileItem } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IRecentFilesCardLargeProps {
  files: IFileItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  fileIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  fileName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  modifiedBy: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1 1 auto',
    minWidth: '40px',
  },
  modifiedTime: {
    flexShrink: 0,
  },
  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  detailIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },
  detailHeaderInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
    wordBreak: 'break-word',
  },
  detailSubtitle: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailRowIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  // Preview placeholder
  previewPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground4,
    fontSize: '13px',
  },
  // Action buttons
  actionButton: {
    minWidth: 'auto',
  },
  // Empty states
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// File type colors for Office files
const FILE_TYPE_COLORS: Record<string, string> = {
  'docx': '#2b579a',
  'doc': '#2b579a',
  'xlsx': '#217346',
  'xls': '#217346',
  'pptx': '#d24726',
  'ppt': '#d24726',
  'pdf': '#d13438',
};

// File icon component (20px for master list)
const FileTypeIcon20: React.FC<{ fileType?: string; isFolder: boolean }> = ({ fileType, isFolder }) => {
  if (isFolder) return <Folder20Regular />;

  const type = fileType?.toLowerCase() || '';

  if (type === 'pdf') return <DocumentPdf20Regular style={{ color: FILE_TYPE_COLORS.pdf }} />;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) return <Image20Regular />;

  const color = FILE_TYPE_COLORS[type] || tokens.colorNeutralForeground2;
  return <Document20Regular style={{ color }} />;
};

// File icon component (24px for detail panel)
const FileTypeIcon24: React.FC<{ fileType?: string; isFolder: boolean }> = ({ fileType, isFolder }) => {
  if (isFolder) return <Folder24Regular />;

  const type = fileType?.toLowerCase() || '';

  if (type === 'pdf') return <DocumentPdf24Regular style={{ color: FILE_TYPE_COLORS.pdf }} />;
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) return <Image24Regular />;

  const color = FILE_TYPE_COLORS[type] || tokens.colorNeutralForeground2;
  return <Document24Regular style={{ color }} />;
};

// Get file type display name
const getFileTypeName = (fileType?: string, isFolder?: boolean): string => {
  if (isFolder) return 'Folder';
  if (!fileType) return 'File';

  const type = fileType.toLowerCase();
  const typeNames: Record<string, string> = {
    'docx': 'Microsoft Word Document',
    'doc': 'Microsoft Word Document',
    'xlsx': 'Microsoft Excel Spreadsheet',
    'xls': 'Microsoft Excel Spreadsheet',
    'pptx': 'Microsoft PowerPoint Presentation',
    'ppt': 'Microsoft PowerPoint Presentation',
    'pdf': 'PDF Document',
    'png': 'PNG Image',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image',
    'gif': 'GIF Image',
    'svg': 'SVG Image',
    'txt': 'Text File',
    'csv': 'CSV File',
    'zip': 'ZIP Archive',
  };

  return typeNames[type] || `${type.toUpperCase()} File`;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format relative date
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Format full date for detail panel
const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Sort files by last modified (most recent first)
const sortFiles = (files: IFileItem[]): IFileItem[] => {
  return [...files].sort((a, b) => b.lastModifiedDateTime.getTime() - a.lastModifiedDateTime.getTime());
};

export const RecentFilesCardLarge: React.FC<IRecentFilesCardLargeProps> = ({
  files,
  loading,
  error,
  onAction,
  theme,
  title = 'Recent Files',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedFile, setSelectedFile] = React.useState<IFileItem | undefined>(undefined);

  // Sort files
  const sortedFiles = React.useMemo(() => sortFiles(files), [files]);

  // Handler for selecting a file
  const handleSelectFile = React.useCallback((file: IFileItem): void => {
    setSelectedFile(file);
  }, []);

  // Auto-select first file when files load
  React.useEffect(() => {
    if (sortedFiles.length > 0 && !selectedFile) {
      setSelectedFile(sortedFiles[0]);
    }
  }, [sortedFiles, selectedFile]);

  // Handle action callback
  const handleFileAction = (action: string, file: IFileItem): void => {
    if (onAction) {
      onAction(action, file as IHoverCardItem, 'file');
    }
  };

  // Render master item (compact file display)
  const renderMasterItem = (file: IFileItem, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.fileIcon}>
          <FileTypeIcon20 fileType={file.fileType} isFolder={file.isFolder} />
        </div>
        <div className={styles.fileInfo}>
          <Text className={styles.fileName}>{file.name}</Text>
          <div className={styles.fileMeta}>
            {file.lastModifiedBy && (
              <span className={styles.modifiedBy}>{file.lastModifiedBy}</span>
            )}
            <span className={styles.modifiedTime}>
              {formatRelativeDate(file.lastModifiedDateTime)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (file: IFileItem): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* File Header */}
        <div className={styles.detailHeader}>
          <div className={styles.detailIcon}>
            <FileTypeIcon24 fileType={file.fileType} isFolder={file.isFolder} />
          </div>
          <div className={styles.detailHeaderInfo}>
            <Text className={styles.detailTitle}>{file.name}</Text>
            <Text className={styles.detailSubtitle}>
              {getFileTypeName(file.fileType, file.isFolder)}
              {!file.isFolder && ` • ${formatFileSize(file.size)}`}
            </Text>
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <Clock24Regular className={styles.detailRowIcon} />
            <span>Modified: {formatFullDate(file.lastModifiedDateTime)}</span>
          </div>
          {file.lastModifiedBy && (
            <div className={styles.detailRow}>
              <Person24Regular className={styles.detailRowIcon} />
              <span>Modified by: {file.lastModifiedBy}</span>
            </div>
          )}
        </div>

        {/* Preview Placeholder */}
        {!file.isFolder && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Preview</Text>
            <div className={styles.previewPlaceholder}>
              Preview not available
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (file: IFileItem): React.ReactNode => {
    return (
      <>
        {!file.isFolder && (
          <Button
            appearance="primary"
            icon={<ArrowDownload24Regular />}
            className={styles.actionButton}
            onClick={() => handleFileAction('download', file)}
          >
            Download
          </Button>
        )}
        <Button
          appearance="secondary"
          icon={<Link24Regular />}
          className={styles.actionButton}
          onClick={() => handleFileAction('copyLink', file)}
        >
          Copy Link
        </Button>
        <Button
          appearance="secondary"
          icon={<Open24Regular />}
          className={styles.actionButton}
          onClick={() => window.open(file.webUrl, '_blank', 'noopener,noreferrer')}
        >
          Open
        </Button>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <History24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a file to view details</Text>
      </>
    );
  };

  // Render empty state (no files)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <FolderOpen24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No recent files</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedFiles}
      selectedItem={selectedFile}
      onItemSelect={handleSelectFile}
      getItemKey={(file: IFileItem) => file.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<History24Regular />}
      title={title}
      itemCount={sortedFiles.length}
      loading={loading}
      error={error}
      emptyMessage="No recent files"
      emptyIcon={<FolderOpen24Regular />}
      headerActions={
        onToggleSize && (
          <Tooltip content="Collapse to compact view" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ContractDownLeft20Regular />}
              onClick={onToggleSize}
              aria-label="Collapse card"
            />
          </Tooltip>
        )
      }
    />
  );
};

export default RecentFilesCardLarge;
