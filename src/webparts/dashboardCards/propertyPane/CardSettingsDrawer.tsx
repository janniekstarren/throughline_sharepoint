import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Input,
  Switch,
  Button,
  Label,
  Divider,
} from '@fluentui/react-components';
import { Dismiss24Regular, ArrowReset24Regular } from '@fluentui/react-icons';

export interface IWaitingOnYouSettings {
  staleDays: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannels: boolean;
  includeMentions: boolean;  // Include @mentions in Teams messages
  showChart: boolean;
}

export interface IWaitingOnOthersSettings {
  minWaitHours: number;        // default: 24
  includeEmail: boolean;       // default: true
  includeTeamsChats: boolean;  // default: true
  includeMentions: boolean;    // default: true - prioritize messages where you @mentioned someone
  showChart: boolean;          // default: true
}

export interface IContextSwitchingSettings {
  trackEmail: boolean;         // default: true
  trackTeamsChat: boolean;     // default: true
  trackTeamsChannel: boolean;  // default: true
  trackMeetings: boolean;      // default: true
  trackFiles: boolean;         // default: true
  focusGoal: number;           // default: 25 (minutes)
  showFocusScore: boolean;     // default: true
  showHourlyChart: boolean;    // default: true
  showDistribution: boolean;   // default: true
}

// Card IDs that support large/medium toggle
export const EXPANDABLE_CARD_IDS = [
  'todaysAgenda', 'unreadInbox', 'upcomingWeek', 'flaggedEmails',
  'myTasks', 'recentFiles', 'sharedWithMe', 'myTeam', 'siteActivity', 'quickLinks'
];

export interface ICardSettingsDrawerProps {
  open: boolean;
  cardId: string;
  title: string;
  defaultTitle: string;
  visible: boolean;
  icon: React.ReactElement;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onVisibilityChange: (visible: boolean) => void;
  onReset: () => void;
  // Waiting On You specific settings
  waitingOnYouSettings?: IWaitingOnYouSettings;
  onWaitingOnYouSettingsChanged?: (settings: IWaitingOnYouSettings) => void;
  // Waiting On Others specific settings
  waitingOnOthersSettings?: IWaitingOnOthersSettings;
  onWaitingOnOthersSettingsChanged?: (settings: IWaitingOnOthersSettings) => void;
  // Context Switching specific settings
  contextSwitchingSettings?: IContextSwitchingSettings;
  onContextSwitchingSettingsChanged?: (settings: IContextSwitchingSettings) => void;
  // Collapsed/expanded state for expandable cards (large cards shown as medium)
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const useStyles = makeStyles({
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '300px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow16,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
  },
  drawerOpen: {
    transform: 'translateX(0)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  headerIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
  },
  headerText: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  closeButton: {
    minWidth: '32px',
  },
  body: {
    flex: 1,
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    overflowY: 'auto',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
  },
  input: {
    width: '100%',
  },
  switchField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    padding: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  resetButton: {
    width: '100%',
  },
  hint: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

export const CardSettingsDrawer: React.FC<ICardSettingsDrawerProps> = ({
  open,
  cardId,
  title,
  defaultTitle,
  visible,
  icon,
  onClose,
  onTitleChange,
  onVisibilityChange,
  onReset,
  waitingOnYouSettings,
  onWaitingOnYouSettingsChanged,
  waitingOnOthersSettings,
  onWaitingOnOthersSettingsChanged,
  contextSwitchingSettings,
  onContextSwitchingSettingsChanged,
  isCollapsed,
  onCollapsedChange,
}) => {
  const styles = useStyles();
  const [localTitle, setLocalTitle] = React.useState(title);

  // Update local title when prop changes
  React.useEffect(() => {
    setLocalTitle(title);
  }, [title, cardId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = (): void => {
    onTitleChange(localTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      onTitleChange(localTitle);
    }
  };

  const handleReset = (): void => {
    setLocalTitle(defaultTitle);
    onReset();
  };

  const isCustomTitle = title !== defaultTitle;

  return (
    <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>{icon}</span>
          <Text className={styles.headerText}>Card Settings</Text>
        </div>
        <Button
          appearance="subtle"
          icon={<Dismiss24Regular />}
          className={styles.closeButton}
          onClick={onClose}
          title="Close"
        />
      </div>

      <div className={styles.body}>
        <div className={styles.field}>
          <Label className={styles.label} htmlFor={`title-${cardId}`}>
            Display Title
          </Label>
          <Input
            id={`title-${cardId}`}
            className={styles.input}
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            placeholder={defaultTitle}
          />
          <Text className={styles.hint}>
            Default: {defaultTitle}
          </Text>
        </div>

        <Divider />

        <div className={styles.switchField}>
          <div className={styles.field}>
            <Label className={styles.label}>Show Card</Label>
            <Text className={styles.hint}>
              {visible ? 'Card is visible on dashboard' : 'Card is hidden'}
            </Text>
          </div>
          <Switch
            checked={visible}
            onChange={(_, data) => onVisibilityChange(data.checked)}
          />
        </div>

        {/* Default View toggle for expandable cards (large/medium) */}
        {EXPANDABLE_CARD_IDS.includes(cardId) && onCollapsedChange && (
          <>
            <Divider />
            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Default View</Label>
                <Text className={styles.hint}>
                  {isCollapsed ? 'Card shows compact (medium) view' : 'Card shows detailed (large) view'}
                </Text>
              </div>
              <Switch
                checked={!isCollapsed}
                onChange={(_, data) => onCollapsedChange(!data.checked)}
              />
            </div>
          </>
        )}

        {/* Waiting On You specific settings */}
        {cardId === 'waitingOnYou' && waitingOnYouSettings && onWaitingOnYouSettingsChanged && (
          <>
            <Divider />
            <Text className={styles.label} style={{ marginBottom: '8px' }}>Card Settings</Text>

            <div className={styles.field}>
              <Label className={styles.label} htmlFor="staleDays">
                Stale after (days)
              </Label>
              <Input
                id="staleDays"
                className={styles.input}
                type="number"
                min={1}
                max={30}
                value={String(waitingOnYouSettings.staleDays)}
                onChange={(_, data) => {
                  const value = parseInt(data.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= 30) {
                    onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, staleDays: value });
                  }
                }}
              />
              <Text className={styles.hint}>
                Messages older than this many days are considered stale
              </Text>
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include Email</Label>
                <Text className={styles.hint}>
                  Show emails waiting for response
                </Text>
              </div>
              <Switch
                checked={waitingOnYouSettings.includeEmail}
                onChange={(_, data) => onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, includeEmail: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include Teams Chats</Label>
                <Text className={styles.hint}>
                  Show Teams chats waiting for response
                </Text>
              </div>
              <Switch
                checked={waitingOnYouSettings.includeTeamsChats}
                onChange={(_, data) => onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, includeTeamsChats: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include Channels</Label>
                <Text className={styles.hint}>
                  Show channel messages waiting for response
                </Text>
              </div>
              <Switch
                checked={waitingOnYouSettings.includeChannels}
                onChange={(_, data) => onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, includeChannels: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include @Mentions</Label>
                <Text className={styles.hint}>
                  Show messages where you were @mentioned
                </Text>
              </div>
              <Switch
                checked={waitingOnYouSettings.includeMentions}
                onChange={(_, data) => onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, includeMentions: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Show Chart</Label>
                <Text className={styles.hint}>
                  Display trend chart in card
                </Text>
              </div>
              <Switch
                checked={waitingOnYouSettings.showChart}
                onChange={(_, data) => onWaitingOnYouSettingsChanged({ ...waitingOnYouSettings, showChart: data.checked })}
              />
            </div>
          </>
        )}

        {/* Waiting On Others specific settings */}
        {cardId === 'waitingOnOthers' && waitingOnOthersSettings && onWaitingOnOthersSettingsChanged && (
          <>
            <Divider />
            <Text className={styles.label} style={{ marginBottom: '8px' }}>Card Settings</Text>

            <div className={styles.field}>
              <Label className={styles.label} htmlFor="minWaitHours">
                Minimum wait time (hours)
              </Label>
              <Input
                id="minWaitHours"
                className={styles.input}
                type="number"
                min={1}
                max={168}
                value={String(waitingOnOthersSettings.minWaitHours)}
                onChange={(_, data) => {
                  const value = parseInt(data.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= 168) {
                    onWaitingOnOthersSettingsChanged({ ...waitingOnOthersSettings, minWaitHours: value });
                  }
                }}
              />
              <Text className={styles.hint}>
                Only show items waiting longer than this
              </Text>
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include Email</Label>
                <Text className={styles.hint}>
                  Show sent emails awaiting reply
                </Text>
              </div>
              <Switch
                checked={waitingOnOthersSettings.includeEmail}
                onChange={(_, data) => onWaitingOnOthersSettingsChanged({ ...waitingOnOthersSettings, includeEmail: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include Teams Chats</Label>
                <Text className={styles.hint}>
                  Show Teams chats awaiting reply
                </Text>
              </div>
              <Switch
                checked={waitingOnOthersSettings.includeTeamsChats}
                onChange={(_, data) => onWaitingOnOthersSettingsChanged({ ...waitingOnOthersSettings, includeTeamsChats: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Include @Mentions</Label>
                <Text className={styles.hint}>
                  Prioritize messages where you @mentioned someone
                </Text>
              </div>
              <Switch
                checked={waitingOnOthersSettings.includeMentions}
                onChange={(_, data) => onWaitingOnOthersSettingsChanged({ ...waitingOnOthersSettings, includeMentions: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Show Chart</Label>
                <Text className={styles.hint}>
                  Display trend chart in card
                </Text>
              </div>
              <Switch
                checked={waitingOnOthersSettings.showChart}
                onChange={(_, data) => onWaitingOnOthersSettingsChanged({ ...waitingOnOthersSettings, showChart: data.checked })}
              />
            </div>
          </>
        )}

        {/* Context Switching specific settings */}
        {cardId === 'contextSwitching' && contextSwitchingSettings && onContextSwitchingSettingsChanged && (
          <>
            <Divider />
            <Text className={styles.label} style={{ marginBottom: '8px' }}>Card Settings</Text>

            <div className={styles.field}>
              <Label className={styles.label} htmlFor="focusGoal">
                Focus goal (minutes)
              </Label>
              <Input
                id="focusGoal"
                className={styles.input}
                type="number"
                min={5}
                max={120}
                value={String(contextSwitchingSettings.focusGoal)}
                onChange={(_, data) => {
                  const value = parseInt(data.value, 10);
                  if (!isNaN(value) && value >= 5 && value <= 120) {
                    onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, focusGoal: value });
                  }
                }}
              />
              <Text className={styles.hint}>
                Target minutes of uninterrupted focus
              </Text>
            </div>

            <Text className={styles.label} style={{ marginTop: '12px', marginBottom: '4px' }}>Track Activity From</Text>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Email</Label>
                <Text className={styles.hint}>
                  Track email context switches
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.trackEmail}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, trackEmail: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Teams Chats</Label>
                <Text className={styles.hint}>
                  Track Teams chat switches
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.trackTeamsChat}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, trackTeamsChat: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Teams Channels</Label>
                <Text className={styles.hint}>
                  Track channel message switches
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.trackTeamsChannel}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, trackTeamsChannel: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Meetings</Label>
                <Text className={styles.hint}>
                  Track meeting context switches
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.trackMeetings}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, trackMeetings: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Files</Label>
                <Text className={styles.hint}>
                  Track file access switches
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.trackFiles}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, trackFiles: data.checked })}
              />
            </div>

            <Divider style={{ marginTop: '8px' }} />
            <Text className={styles.label} style={{ marginTop: '8px', marginBottom: '4px' }}>Display Options</Text>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Show Focus Score</Label>
                <Text className={styles.hint}>
                  Display the focus score circle
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.showFocusScore}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, showFocusScore: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Show Hourly Chart</Label>
                <Text className={styles.hint}>
                  Display the hourly bar chart
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.showHourlyChart}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, showHourlyChart: data.checked })}
              />
            </div>

            <div className={styles.switchField}>
              <div className={styles.field}>
                <Label className={styles.label}>Show Distribution</Label>
                <Text className={styles.hint}>
                  Display context type breakdown
                </Text>
              </div>
              <Switch
                checked={contextSwitchingSettings.showDistribution}
                onChange={(_, data) => onContextSwitchingSettingsChanged({ ...contextSwitchingSettings, showDistribution: data.checked })}
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          appearance="secondary"
          icon={<ArrowReset24Regular />}
          className={styles.resetButton}
          onClick={handleReset}
          disabled={!isCustomTitle && visible}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default CardSettingsDrawer;
