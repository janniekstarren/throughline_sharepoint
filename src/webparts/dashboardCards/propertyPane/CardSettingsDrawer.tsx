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
