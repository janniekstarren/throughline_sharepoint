import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Input,
  Switch,
  Button,
  Label,
} from '@fluentui/react-components';
import { Dismiss20Regular, ArrowReset20Regular } from '@fluentui/react-icons';

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
}

const useStyles = makeStyles({
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '300px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: 'none',
    boxShadow: '-6px 0 24px rgba(0,0,0,0.06), -2px 0 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transform: 'translateX(100%)',
    transitionProperty: 'transform',
    transitionDuration: '0.25s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
  },
  drawerOpen: {
    transform: 'translateX(0)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: 'none',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, rgba(0, 102, 204, 0.08) 100%)`,
    color: tokens.colorBrandForeground1,
    fontSize: '18px',
  },
  headerText: {
    fontWeight: '600',
    fontSize: '16px',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
  },
  closeButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: '8px',
    transitionProperty: 'background-color',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  body: {
    flex: 1,
    padding: '20px',
    paddingTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
    },
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '500',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  input: {
    width: '100%',
    '& input': {
      borderRadius: '8px',
    },
    '& .fui-Input': {
      borderRadius: '8px',
    },
    '& .fui-Input__input': {
      borderRadius: '8px',
    },
  },
  switchField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    marginTop: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '10px',
    border: 'none',
  },
  hint: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    lineHeight: '1.4',
  },
  footer: {
    padding: '16px 20px',
    borderTop: 'none',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  resetButton: {
    width: '100%',
    justifyContent: 'center',
    height: '36px',
    borderRadius: '8px',
    fontWeight: '500',
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
          <Text className={styles.headerText}>Settings</Text>
        </div>
        <Button
          appearance="subtle"
          icon={<Dismiss20Regular />}
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
            size="small"
          />
          <Text className={styles.hint}>
            Default: {defaultTitle}
          </Text>
        </div>

        <div className={styles.switchField}>
          <div className={styles.field}>
            <Label className={styles.label}>Visible</Label>
            <Text className={styles.hint}>
              {visible ? 'Shown on dashboard' : 'Hidden'}
            </Text>
          </div>
          <Switch
            checked={visible}
            onChange={(_, data) => onVisibilityChange(data.checked)}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          appearance="subtle"
          size="small"
          icon={<ArrowReset20Regular />}
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
