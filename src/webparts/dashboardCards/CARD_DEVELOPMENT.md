# Card Development Guide

This guide explains how to create new dashboard cards using the established patterns from the WaitingOnOthers card (our "gold standard").

## Quick Start

Use the generator script to scaffold a new card:

```bash
npm run create-card -- --name="MyCard" --title="My Card" --icon="Calendar"
```

Options:
- `--name` (required): PascalCase card name (e.g., "UpcomingMeetings")
- `--title`: Display title (e.g., "Upcoming Meetings") - defaults to spaced name
- `--icon`: Fluent UI icon name without "Regular" suffix (e.g., "Calendar") - defaults to "Document"
- `--no-large`: Skip creating the large card

## Architecture Overview

Each card follows a layered architecture:

```
models/                    → TypeScript interfaces & types
    └── [CardName].ts

services/
    └── [CardName]Service.ts    → API integration (Microsoft Graph)
    └── testData/
        └── [cardName].ts       → Test data generators

hooks/
    └── use[CardName].ts        → React hook (state management)

components/
    └── [CardName]Card/
        ├── [CardName]Card.tsx  → Medium card (summary view)
        ├── index.ts            → Export barrel
        └── components/         → Card-specific subcomponents
    └── [CardName]CardLarge.tsx → Large card (master-detail view)
```

## File Templates

Templates are located in `src/webparts/dashboardCards/templates/`:

| Template | Purpose |
|----------|---------|
| `models.template.ts` | Data interfaces, settings |
| `service.template.ts` | Microsoft Graph API service |
| `testData.template.ts` | Mock data generators |
| `hook.template.ts` | React hook with state management |
| `mediumCard.template.tsx` | Summary card component |
| `largeCard.template.tsx` | Master-detail card component |
| `index.template.ts` | Export barrel file |

## Step-by-Step Guide

### 1. Generate the Card Files

```bash
npm run create-card -- --name="TasksDue" --title="Tasks Due Today" --icon="TaskList"
```

### 2. Define Your Data Models

Edit `models/TasksDue.ts`:

```typescript
export interface TasksDueItem {
  id: string;
  title: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  listName: string;
}

export interface TasksDueData {
  items: TasksDueItem[];
  totalCount: number;
  overdueCount: number;
  completedTodayCount: number;
}

export interface ITasksDueSettings {
  enabled: boolean;
  maxItems: number;
  showChart: boolean;
  includeCompleted: boolean;
}
```

### 3. Implement the Service

Edit `services/TasksDueService.ts`:

```typescript
public async getData(settings: ITasksDueSettings): Promise<TasksDueData> {
  const client = await this.getGraphClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const response = await client
    .api('/me/planner/tasks')
    .filter(`dueDateTime ge '${today.toISOString()}' and dueDateTime lt '${tomorrow.toISOString()}'`)
    .top(settings.maxItems)
    .get();

  // Transform and return
  return { items: [], totalCount: 0, overdueCount: 0, completedTodayCount: 0 };
}
```

### 4. Create Test Data

Edit `services/testData/tasksDue.ts`:

```typescript
export const getTestTasksDueData = (): TasksDueData => {
  return {
    items: [
      { id: '1', title: 'Review PR #123', dueDate: new Date(), priority: 'high', isCompleted: false, listName: 'Work' },
      { id: '2', title: 'Update documentation', dueDate: new Date(), priority: 'medium', isCompleted: false, listName: 'Work' },
      // ... more items
    ],
    totalCount: 5,
    overdueCount: 1,
    completedTodayCount: 2,
  };
};
```

### 5. Customize the Card UI

The medium card (`TasksDueCard.tsx`) shows a summary view with:
- Statistics grid (counts, metrics)
- Top items preview
- Expand button to see full details

The large card (`TasksDueCardLarge.tsx`) shows a master-detail view with:
- Tab navigation (All, Grouped, etc.)
- Sort and filter menus
- Scrollable item list
- Detail panel for selected item

### 6. Register the Card

#### In `DashboardCards.tsx`:

```typescript
// 1. Import settings and components
import { ITasksDueSettings, DEFAULT_TASKS_DUE_SETTINGS } from '../hooks/useTasksDue';
import { TasksDueCard } from './components/TasksDueCard';
import { TasksDueCardLarge } from './components/TasksDueCardLarge';

// 2. Add to CARD_DEFINITIONS
{
  id: 'tasksDue',
  title: 'Tasks Due Today',
  description: 'Shows tasks due today from Planner',
  icon: TaskListRegular,
  defaultEnabled: true,
  hasLargeView: true,
}

// 3. Add to LARGE_CARDS array
const LARGE_CARDS = ['waitingOnOthers', 'tasksDue'];

// 4. Add settings to props interface
export interface IDashboardCardsWebPartProps {
  // ... existing props
  tasksDueSettings: ITasksDueSettings;
}

// 5. Add default settings
tasksDueSettings: DEFAULT_TASKS_DUE_SETTINGS,

// 6. Add renderCard case
case 'tasksDue':
  return (
    <TasksDueCard
      context={context}
      settings={props.tasksDueSettings}
      dataMode={dataMode}
      onToggleSize={() => setExpandedCard('tasksDue')}
    />
  );

// 7. Add renderLargeCard case
case 'tasksDue':
  return (
    <TasksDueCardLarge
      context={context}
      settings={props.tasksDueSettings}
      dataMode={dataMode}
      onToggleSize={() => setExpandedCard(null)}
    />
  );
```

#### In `CardConfigDialog.tsx`:

```typescript
// Add to CARD_DEFINITIONS array
{
  id: 'tasksDue',
  title: 'Tasks Due Today',
  description: 'Shows tasks due today from Planner',
  icon: <TaskListRegular />,
  settings: [
    { key: 'enabled', label: 'Enable card', type: 'toggle', defaultValue: true },
    { key: 'maxItems', label: 'Maximum items', type: 'number', defaultValue: 10 },
    { key: 'showChart', label: 'Show trend chart', type: 'toggle', defaultValue: true },
    { key: 'includeCompleted', label: 'Include completed tasks', type: 'toggle', defaultValue: false },
  ]
}
```

## Shared Components

Reuse these components from `components/shared/`:

### BaseCard
Wrapper component with loading, error, and empty states.

```tsx
<BaseCard
  loading={isLoading}
  error={error?.message}
  loadingMessage="Loading..."
  testId="my-card"
>
  {/* Card content */}
</BaseCard>
```

### CardHeader
Consistent header with icon, title, badge, and actions.

```tsx
<CardHeader
  icon={<CalendarRegular />}
  title="My Card"
  badge={itemCount}
  badgeVariant="brand" // or 'warning'
  actions={<Button icon={<RefreshRegular />} />}
/>
```

### MasterDetailCard
Two-panel layout for large cards.

```tsx
<MasterDetailCard
  testId="my-card-large"
  loading={isLoading}
  error={error?.message}
  header={headerContent}
  master={listPanel}
  detail={detailPanel}
  selectedItem={selectedItem}
/>
```

### EmptyState
Consistent empty state display.

```tsx
<EmptyState
  icon={<CalendarRegular />}
  title="No items"
  description="Nothing to show here"
/>
```

## Shared Styles

From `components/cardStyles.ts`:

```typescript
import { useCardStyles, cardTokens } from '../cardStyles';

const styles = useCardStyles();

// Card height tokens
cardTokens.size.cardStandardHeight // Standard card height
cardTokens.size.cardTallHeight     // Tall card height
cardTokens.size.cardLargeHeight    // Large card height
```

## Test Data Mode

All cards support test data mode for development:

1. The card receives `dataMode: 'test' | 'api'` prop
2. When `dataMode === 'test'`, use test data generators
3. When `dataMode === 'api'`, use the real API hook

```tsx
// Test data state
const [testData, setTestData] = useState(null);
const [testLoading, setTestLoading] = useState(dataMode === 'test');

// Load test data
React.useEffect(() => {
  if (dataMode === 'test') {
    setTestLoading(true);
    setTimeout(() => {
      setTestData(getTestData());
      setTestLoading(false);
    }, 500);
  }
}, [dataMode]);

// API hook
const apiHook = useMyCard(context, settings);

// Select data source
const data = dataMode === 'test' ? testData : apiHook.data;
```

## Checklist for New Cards

- [ ] Generate files with `npm run create-card`
- [ ] Define data models in `models/[CardName].ts`
- [ ] Implement API service in `services/[CardName]Service.ts`
- [ ] Create test data in `services/testData/[cardName].ts`
- [ ] Update hook if needed in `hooks/use[CardName].ts`
- [ ] Customize medium card UI
- [ ] Customize large card UI (if applicable)
- [ ] Register in `DashboardCards.tsx`
  - [ ] Import settings and components
  - [ ] Add to `CARD_DEFINITIONS`
  - [ ] Add to `LARGE_CARDS` (if applicable)
  - [ ] Add settings to props interface
  - [ ] Add default settings
  - [ ] Add `renderCard` case
  - [ ] Add `renderLargeCard` case (if applicable)
- [ ] Register in `CardConfigDialog.tsx`
- [ ] Test with `gulp serve` in workbench
- [ ] Test in both API and test data modes
- [ ] Verify loading, error, and empty states

## Reference: Gold Standard Card

The WaitingOnOthers card serves as the reference implementation:

| Layer | File |
|-------|------|
| Models | `models/WaitingOnOthers.ts` |
| Service | `services/WaitingOnOthersService.ts` |
| Test Data | `services/testData/waitingOnOthers.ts` |
| Hook | `hooks/useWaitingOnOthers.ts` |
| Medium Card | `components/WaitingOnOthersCard/WaitingOnOthersCard.tsx` |
| Large Card | `components/WaitingOnOthersCardLarge.tsx` |

Study these files for patterns on:
- Handling test data vs API mode
- Implementing sort and filter functionality
- Creating master-detail layouts
- Managing snooze/action state
- Using Fluent UI components consistently
