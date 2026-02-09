// ============================================
// LayoutTab - Tab 4: Layout preferences
// View selector, grid density, behaviour toggles
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  RadioGroup,
  Radio,
  Switch,
  Dropdown,
  Option,
} from '@fluentui/react-components';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    maxWidth: '600px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
  },
  sectionDesc: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalXS} 0`,
  },
  settingLabel: {
    fontSize: tokens.fontSizeBase200,
  },
  settingDesc: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  settingLabelGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

// ============================================
// Props
// ============================================

interface LayoutTabProps {
  /** User preference: hide locked/upgrade cards from the dashboard */
  hideLockedCards?: boolean;
  onHideLockedCardsChange?: (hide: boolean) => void;
  /** User preference: hide in-development/placeholder cards */
  hidePlaceholderCards?: boolean;
  onHidePlaceholderCardsChange?: (hide: boolean) => void;
  /** Current effective greeting style */
  salutationType?: string;
  onSalutationTypeChange?: (type: string | undefined) => void;
  /** Current effective theme mode */
  themeMode?: string;
  onThemeModeChange?: (mode: string | undefined) => void;
  /** Current effective category navigation mode */
  navMode?: string;
  onNavModeChange?: (mode: string | undefined) => void;
}

// ============================================
// Component
// ============================================

export const LayoutTab: React.FC<LayoutTabProps> = ({
  hideLockedCards = false,
  onHideLockedCardsChange,
  hidePlaceholderCards = false,
  onHidePlaceholderCardsChange,
  salutationType,
  onSalutationTypeChange,
  themeMode,
  onThemeModeChange,
  navMode,
  onNavModeChange,
}) => {
  const classes = useStyles();

  // Local state for layout preferences (will be wired to UserSettings in future)
  const [defaultView, setDefaultView] = React.useState('categories');
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);
  const [showFooter, setShowFooter] = React.useState(true);
  const [stickyHeader, setStickyHeader] = React.useState(true);

  return (
    <div className={classes.container}>
      {/* Default View */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>Default Dashboard View</Text>
        <Text className={classes.sectionDesc}>
          Choose which view to show when you first open the dashboard.
        </Text>
        <RadioGroup
          value={defaultView}
          onChange={(_ev, data) => setDefaultView(data.value)}
        >
          <Radio value="categories" label="Categories (grouped by category)" />
          <Radio value="needs-attention" label="Needs Attention (active alerts only)" />
          <Radio value="high-impact" label="High Impact (9-10 rated cards)" />
          <Radio value="compact" label="Compact (dense grid, no headers)" />
        </RadioGroup>
      </div>

      {/* Card Display */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>Card Display</Text>

        <div className={classes.settingRow}>
          <div className={classes.settingLabelGroup}>
            <Text className={classes.settingLabel}>Hide locked cards</Text>
            <Text className={classes.settingDesc}>
              Only show cards available on your current plan
            </Text>
          </div>
          <Switch
            checked={hideLockedCards}
            onChange={(_ev, data) => onHideLockedCardsChange?.(data.checked)}
          />
        </div>

        <div className={classes.settingRow}>
          <div className={classes.settingLabelGroup}>
            <Text className={classes.settingLabel}>Hide in-development cards</Text>
            <Text className={classes.settingDesc}>
              Only show fully built cards, hide upcoming placeholders
            </Text>
          </div>
          <Switch
            checked={hidePlaceholderCards}
            onChange={(_ev, data) => onHidePlaceholderCardsChange?.(data.checked)}
          />
        </div>
      </div>

      {/* Greeting */}
      {onSalutationTypeChange && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>Greeting</Text>
          <Text className={classes.sectionDesc}>
            Choose the greeting style shown at the top of your dashboard.
          </Text>
          <Dropdown
            value={
              salutationType === 'timeBased' ? 'Time-based (Good morning/afternoon/evening)' :
              salutationType === 'worldHello' ? 'World Hello (rotating languages)' :
              salutationType === 'claude' ? 'Friendly greeting' :
              salutationType === 'none' ? 'No greeting' :
              'Time-based (Good morning/afternoon/evening)'
            }
            selectedOptions={[salutationType || 'timeBased']}
            onOptionSelect={(_ev, data) => {
              onSalutationTypeChange(data.optionValue as string);
            }}
          >
            <Option value="timeBased">Time-based (Good morning/afternoon/evening)</Option>
            <Option value="worldHello">World Hello (rotating languages)</Option>
            <Option value="claude">Friendly greeting</Option>
            <Option value="none">No greeting</Option>
          </Dropdown>
        </div>
      )}

      {/* Appearance */}
      {onThemeModeChange && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>Appearance</Text>
          <Text className={classes.sectionDesc}>
            Choose between light and dark mode for the dashboard.
          </Text>
          <Dropdown
            value={
              themeMode === 'auto' ? 'Auto (follow system)' :
              themeMode === 'dark' ? 'Dark' :
              'Light'
            }
            selectedOptions={[themeMode || 'light']}
            onOptionSelect={(_ev, data) => {
              onThemeModeChange(data.optionValue as string);
            }}
          >
            <Option value="auto">Auto (follow system)</Option>
            <Option value="light">Light</Option>
            <Option value="dark">Dark</Option>
          </Dropdown>
        </div>
      )}

      {/* Menu Display */}
      {onNavModeChange && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>Menu</Text>
          <Text className={classes.sectionDesc}>
            Control how the dashboard menu is displayed.
          </Text>
          <Dropdown
            value={
              navMode === 'hidden' ? 'Hidden (no menu)' :
              navMode === 'collapsed' ? 'Collapsed (hamburger)' :
              'Expanded (all buttons visible)'
            }
            selectedOptions={[navMode || 'expanded']}
            onOptionSelect={(_ev, data) => {
              onNavModeChange(data.optionValue as string);
            }}
          >
            <Option value="expanded">Expanded (all buttons visible)</Option>
            <Option value="collapsed">Collapsed (hamburger)</Option>
            <Option value="hidden">Hidden (no menu)</Option>
          </Dropdown>
        </div>
      )}

      {/* Behaviour */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>Behaviour</Text>

        <div className={classes.settingRow}>
          <Text className={classes.settingLabel}>Enable animations</Text>
          <Switch
            checked={animationsEnabled}
            onChange={(_ev, data) => setAnimationsEnabled(data.checked)}
          />
        </div>

        <div className={classes.settingRow}>
          <Text className={classes.settingLabel}>Show dashboard footer</Text>
          <Switch
            checked={showFooter}
            onChange={(_ev, data) => setShowFooter(data.checked)}
          />
        </div>

        <div className={classes.settingRow}>
          <Text className={classes.settingLabel}>Sticky header</Text>
          <Switch
            checked={stickyHeader}
            onChange={(_ev, data) => setStickyHeader(data.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default LayoutTab;
