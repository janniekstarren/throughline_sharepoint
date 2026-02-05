// ============================================
// RecentFilesCardLarge - Large Card (Detail View)
// Master-detail layout showing recent files
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  Badge,
} from '@fluentui/react-components';
import {
  DocumentMultiple24Regular,
  Folder16Regular,
  Document16Regular,
  DocumentPdf16Regular,
  DocumentText16Regular,
  SlideText16Regular,
  Table16Regular,
  ArrowMinimize20Regular,
  ArrowClockwiseRegular,
  Open16Regular,
  Person16Regular,
  Clock16Regular,
  Storage16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useRecentFiles,
  IRecentFilesSettings,
  DEFAULT_RECENT_FILES_SETTINGS,
} from '../../hooks/useRecentFiles';
import { RecentFilesData, FileItem } from '../../models/RecentFiles';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { DataMode } from '../../services/testData';
import { getTestRecentFilesData } from '../../services/testData/recentFiles';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { getGenericAICardSummary, getGenericAIInsights } from '../../services/testData/aiDemoData';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  fileIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  folderIcon: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },
  pdfIcon: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },
  excelIcon: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },
  wordIcon: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  pptIcon: {
    backgroundColor: tokens.colorPaletteDarkOrangeBackground2,
    color: tokens.colorPaletteDarkOrangeForeground2,
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
  // Detail panel styles
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  detailIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '32px',
    flexShrink: 0,
  },
  detailTitleArea: {
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalXS,
    wordBreak: 'break-word',
  },
  detailSubtitle: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  detailSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  detailSectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} 0`,
    color: tokens.colorNeutralForeground2,
  },
  detailRowIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  typeBadge: {
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 600,
  },
});

// ============================================
// Props Interface
// ============================================
interface RecentFilesCardLargeProps {
  context: WebPartContext;
  settings?: IRecentFilesSettings;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format file size to human-readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Format date to relative time
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

/**
 * Format date to full date/time
 */
const formatFullDateTime = (date: Date): string => {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get file icon based on file type
 */
const getFileIcon = (file: FileItem, size: 'small' | 'large' = 'small'): React.ReactElement => {
  if (file.isFolder) {
    return <Folder16Regular />;
  }

  switch (file.fileType?.toLowerCase()) {
    case 'pdf':
      return <DocumentPdf16Regular />;
    case 'doc':
    case 'docx':
      return <DocumentText16Regular />;
    case 'xls':
    case 'xlsx':
      return <Table16Regular />;
    case 'ppt':
    case 'pptx':
      return <SlideText16Regular />;
    default:
      return <Document16Regular />;
  }
};

/**
 * Get icon style class based on file type
 */
const getIconStyleClass = (
  file: FileItem,
  styles: ReturnType<typeof useStyles>
): string => {
  if (file.isFolder) return styles.folderIcon;

  switch (file.fileType?.toLowerCase()) {
    case 'pdf':
      return styles.pdfIcon;
    case 'doc':
    case 'docx':
      return styles.wordIcon;
    case 'xls':
    case 'xlsx':
      return styles.excelIcon;
    case 'ppt':
    case 'pptx':
      return styles.pptIcon;
    default:
      return '';
  }
};

/**
 * Get file type display name
 */
const getFileTypeDisplay = (file: FileItem): string => {
  if (file.isFolder) return 'Folder';

  switch (file.fileType?.toLowerCase()) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    default:
      return file.fileType?.toUpperCase() || 'File';
  }
};

/**
 * Sort files by last modified date (most recent first)
 */
const sortFilesByDate = (files: FileItem[]): FileItem[] => {
  return [...files].sort(
    (a, b) => b.lastModifiedDateTime.getTime() - a.lastModifiedDateTime.getTime()
  );
};

// ============================================
// Component
// ============================================
export const RecentFilesCardLarge: React.FC<RecentFilesCardLargeProps> = ({
  context,
  settings = DEFAULT_RECENT_FILES_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<RecentFilesData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestRecentFilesData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = React.useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = React.useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = React.useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getGenericAICardSummary('recentFiles'));
      setAiInsights(getGenericAIInsights('recentFiles'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // API hook
  const apiHook = useRecentFiles(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestRecentFilesData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Sorted files
  const sortedFiles = useMemo(() => {
    if (!data) return [];
    return sortFilesByDate(data.files);
  }, [data]);

  // Auto-select first file
  React.useEffect(() => {
    if (sortedFiles.length > 0 && !selectedFile) {
      setSelectedFile(sortedFiles[0]);
    }
  }, [sortedFiles, selectedFile]);

  const handleSelectFile = useCallback((file: FileItem): void => {
    setSelectedFile(file);
  }, []);

  // Handle opening file
  const handleOpenFile = (file: FileItem): void => {
    window.open(file.webUrl, '_blank', 'noopener,noreferrer');
  };

  // Render master item
  const renderMasterItem = (file: FileItem, isSelected: boolean): React.ReactNode => (
    <div className={styles.masterItem}>
      <div className={`${styles.fileIcon} ${getIconStyleClass(file, styles)}`}>
        {getFileIcon(file)}
      </div>
      <div className={styles.fileInfo}>
        <Text className={styles.fileName}>{file.name}</Text>
        <div className={styles.fileMeta}>
          <span>{formatRelativeTime(file.lastModifiedDateTime)}</span>
          {!file.isFolder && file.size > 0 && (
            <>
              <span>-</span>
              <span>{formatFileSize(file.size)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render detail content
  const renderDetailContent = (file: FileItem): React.ReactNode => (
    <>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={`${styles.detailIcon} ${getIconStyleClass(file, styles)}`}>
          {getFileIcon(file, 'large')}
        </div>
        <div className={styles.detailTitleArea}>
          <Text className={styles.detailTitle}>{file.name}</Text>
          <Text className={styles.detailSubtitle}>
            {file.isFolder ? 'Folder' : getFileTypeDisplay(file)} - {formatRelativeTime(file.lastModifiedDateTime)}
          </Text>
        </div>
      </div>

      {/* File Details */}
      <div className={styles.detailSection}>
        <Text className={styles.detailSectionTitle}>Details</Text>

        <div className={styles.detailRow}>
          <Clock16Regular className={styles.detailRowIcon} />
          <Text size={300}>Modified: {formatFullDateTime(file.lastModifiedDateTime)}</Text>
        </div>

        {file.lastModifiedBy && (
          <div className={styles.detailRow}>
            <Person16Regular className={styles.detailRowIcon} />
            <Text size={300}>By: {file.lastModifiedBy.displayName}</Text>
          </div>
        )}

        {!file.isFolder && file.size > 0 && (
          <div className={styles.detailRow}>
            <Storage16Regular className={styles.detailRowIcon} />
            <Text size={300}>Size: {formatFileSize(file.size)}</Text>
          </div>
        )}

        <div className={styles.detailRow}>
          <Badge
            appearance="filled"
            color={file.isFolder ? 'warning' : 'brand'}
            size="small"
            className={styles.typeBadge}
          >
            {getFileTypeDisplay(file)}
          </Badge>
        </div>
      </div>
    </>
  );

  // Render detail actions
  const renderDetailActions = (file: FileItem): React.ReactNode => (
    <Button
      appearance="primary"
      icon={<Open16Regular />}
      onClick={() => handleOpenFile(file)}
    >
      Open {file.isFolder ? 'Folder' : 'File'}
    </Button>
  );

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <DocumentMultiple24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select a file to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <DocumentMultiple24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No recent files</Text>
    </>
  );

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      {onToggleSize && (
        <Tooltip content="Collapse to compact view" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowMinimize20Regular />}
            onClick={onToggleSize}
            aria-label="Collapse card"
          />
        </Tooltip>
      )}
    </div>
  );

  // AI Insight Banner for header content
  const aiHeaderContent = aiDemoMode && aiCardSummary ? (
    <AIInsightBanner
      summary={aiCardSummary}
      insights={aiInsights}
      onLearnMore={handleAiLearnMore}
    />
  ) : undefined;

  return (
    <>
      <MasterDetailCard
        items={sortedFiles}
        selectedItem={selectedFile}
        onItemSelect={handleSelectFile}
        getItemKey={(file: FileItem) => file.id}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<DocumentMultiple24Regular />}
        title="Recent Files"
        itemCount={sortedFiles.length}
        loading={isLoading && !data}
        error={error?.message}
        emptyMessage="No recent files"
        emptyIcon={<DocumentMultiple24Regular />}
        headerActions={headerActions}
        headerContent={aiHeaderContent}
      />

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showAiOnboarding}
        onClose={() => setShowAiOnboarding(false)}
      />
    </>
  );
};

export default RecentFilesCardLarge;
