// ============================================
// {{CardName}}CardLarge - Large Card (Detail View)
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")
// Replace {{CARD_NAME}} with UPPER_SNAKE_CASE (e.g., "UPCOMING_MEETINGS")
// Replace {{CardTitle}} with display title (e.g., "Upcoming Meetings")
// Replace {{CardIcon}} with Fluent UI icon (e.g., "CalendarRegular")

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  TabList,
  Tab,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuGroup,
  MenuGroupHeader,
  MenuDivider,
  Badge,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  ArrowMinimize20Regular,
  ArrowSortDownLines20Regular,
  Filter20Regular,
  Dismiss20Regular,
  {{CardIcon}},
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  use{{CardName}},
  I{{CardName}}Settings,
  DEFAULT_{{CARD_NAME}}_SETTINGS,
} from '../hooks/use{{CardName}}';
import { {{CardName}}Data, {{CardName}}Item } from '../models/{{CardName}}';
import { MasterDetailCard, EmptyState, CardHeader } from './shared';
import { DataMode } from '../services/testData';
import { getTest{{CardName}}Data, getTest{{CardName}}Trend } from '../services/testData/{{cardName}}';

// ============================================
// Types
// ============================================
type ViewMode = 'list' | 'grouped';
type SortMode = 'date' | 'title' | 'priority';
type FilterType = 'filter1' | 'filter2' | 'filter3';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  tabSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tabToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
  },
  filterActive: {
    color: tokens.colorBrandForeground1,
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  listScroll: {
    flex: 1,
    overflow: 'auto',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  listItemSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  listItemContent: {
    flex: 1,
    minWidth: 0,
  },
  listItemTitle: {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listItemMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  detailPanel: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    height: '100%',
    overflow: 'auto',
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailTitle: {
    fontSize: '20px',
    fontWeight: 600,
  },
  detailActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  emptyDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props Interface
// ============================================
interface {{CardName}}CardLargeProps {
  context: WebPartContext;
  settings?: I{{CardName}}Settings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Component
// ============================================
export const {{CardName}}CardLarge: React.FC<{{CardName}}CardLargeProps> = ({
  context,
  settings = DEFAULT_{{CARD_NAME}}_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const styles = useStyles();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [selectedItem, setSelectedItem] = useState<{{CardName}}Item | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [checkedFilterValues, setCheckedFilterValues] = useState<Record<string, string[]>>({ filter: [] });

  // Test data state
  const [testData, setTestData] = useState<{{CardName}}Data | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTest{{CardName}}Data());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = use{{CardName}}(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTest{{CardName}}Data());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Filter handler
  const handleFilterChange = useCallback((filters: string[]) => {
    setActiveFilters(new Set(filters as FilterType[]));
    setCheckedFilterValues({ filter: filters });
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
    setCheckedFilterValues({ filter: [] });
  }, []);

  // Sort and filter items
  const listItems = useMemo(() => {
    if (!data) return [];

    let items = [...data.items];

    // Apply filters
    if (activeFilters.size > 0) {
      items = items.filter((item) => {
        // Add filter logic here
        return true;
      });
    }

    // Apply sort
    items.sort((a, b) => {
      switch (sortMode) {
        case 'date':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return items;
  }, [data, activeFilters, sortMode]);

  // Collapse button
  const collapseButton = onToggleSize ? (
    <Tooltip content="Collapse" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowMinimize20Regular />}
        onClick={onToggleSize}
        aria-label="Collapse card"
      />
    </Tooltip>
  ) : undefined;

  // Header
  const header = (
    <CardHeader
      icon={<{{CardIcon}} />}
      title="{{CardTitle}}"
      badge={data?.totalCount}
      actions={
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              icon={<ArrowClockwiseRegular />}
              size="small"
              onClick={refresh}
            />
          </Tooltip>
          {collapseButton}
        </div>
      }
    />
  );

  // Tab section with sort and filter
  const tabSection = (
    <div className={styles.tabSection}>
      <TabList selectedValue={viewMode} onTabSelect={(_, d) => setViewMode(d.value as ViewMode)}>
        <Tab value="list">All Items</Tab>
        <Tab value="grouped">Grouped</Tab>
      </TabList>

      <div className={styles.tabToolbar}>
        {/* Sort Menu */}
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Tooltip content="Sort" relationship="label">
              <Button appearance="subtle" size="small" icon={<ArrowSortDownLines20Regular />} />
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuGroup>
                <MenuGroupHeader>Sort by</MenuGroupHeader>
                <MenuItemRadio name="sort" value="date" checked={sortMode === 'date'} onClick={() => setSortMode('date')}>
                  Date
                </MenuItemRadio>
                <MenuItemRadio name="sort" value="title" checked={sortMode === 'title'} onClick={() => setSortMode('title')}>
                  Title
                </MenuItemRadio>
              </MenuGroup>
            </MenuList>
          </MenuPopover>
        </Menu>

        {/* Filter Menu */}
        <Menu
          checkedValues={checkedFilterValues}
          onCheckedValueChange={(_, menuData) => handleFilterChange(menuData.checkedItems)}
        >
          <MenuTrigger disableButtonEnhancement>
            <Tooltip content={activeFilters.size > 0 ? `${activeFilters.size} filter(s) active` : 'Filter'} relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<Filter20Regular />}
                className={activeFilters.size > 0 ? styles.filterActive : undefined}
              />
            </Tooltip>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuGroup>
                <MenuGroupHeader>Filter by</MenuGroupHeader>
                <MenuItemCheckbox name="filter" value="filter1">
                  Filter Option 1
                </MenuItemCheckbox>
                <MenuItemCheckbox name="filter" value="filter2">
                  Filter Option 2
                </MenuItemCheckbox>
                <MenuItemCheckbox name="filter" value="filter3">
                  Filter Option 3
                </MenuItemCheckbox>
              </MenuGroup>
              {activeFilters.size > 0 && (
                <>
                  <MenuDivider />
                  <MenuItem icon={<Dismiss20Regular />} onClick={clearFilters}>
                    Clear all filters
                  </MenuItem>
                </>
              )}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </div>
  );

  // Master panel (list)
  const masterPanel = (
    <div className={styles.listContainer}>
      {tabSection}
      <div className={styles.listScroll}>
        {listItems.length === 0 ? (
          <EmptyState
            icon={<{{CardIcon}} />}
            title="No items"
            description="Nothing matches your filters"
          />
        ) : (
          listItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.listItem} ${selectedItem?.id === item.id ? styles.listItemSelected : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className={styles.listItemContent}>
                <Text className={styles.listItemTitle}>{item.title}</Text>
                <Text className={styles.listItemMeta}>
                  {new Date(item.createdDate).toLocaleDateString()}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Detail panel
  const detailPanel = selectedItem ? (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <Text className={styles.detailTitle}>{selectedItem.title}</Text>
        <Text className={styles.listItemMeta}>
          Created: {new Date(selectedItem.createdDate).toLocaleString()}
        </Text>
      </div>

      {/* Detail content here */}

      <div className={styles.detailActions}>
        <Button appearance="primary">Primary Action</Button>
        <Button appearance="secondary">Secondary Action</Button>
      </div>
    </div>
  ) : (
    <div className={styles.emptyDetail}>
      <Text>Select an item to view details</Text>
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <MasterDetailCard
        testId="{{cardName}}-card-large"
        header={header}
        master={
          <EmptyState
            icon={<{{CardIcon}} />}
            title="No items"
            description="Nothing to show here"
          />
        }
        detail={null}
        selectedItem={null}
      />
    );
  }

  return (
    <MasterDetailCard
      testId="{{cardName}}-card-large"
      loading={isLoading && !data}
      error={error?.message}
      header={header}
      master={masterPanel}
      detail={detailPanel}
      selectedItem={selectedItem}
    />
  );
};

export default {{CardName}}CardLarge;
