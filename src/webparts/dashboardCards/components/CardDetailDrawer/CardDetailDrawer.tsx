// ============================================
// CardDetailDrawer - Expanded view drawer for cards
// Opens as a side panel showing full card content
// ============================================

import * as React from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  makeStyles,
  tokens,
  Button,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

export interface ICardDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactElement;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const useStyles = makeStyles({
  // Drawer sizes
  drawerSmall: {
    width: '400px',
    maxWidth: '100vw',
  },
  drawerMedium: {
    width: '520px',
    maxWidth: '100vw',
  },
  drawerLarge: {
    width: '640px',
    maxWidth: '100vw',
  },

  // Header styling - clean Fluent 2
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },

  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '18px',
    flexShrink: 0,
  },

  headerTitle: {
    flex: 1,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
  },

  closeButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },

  // Body styling
  body: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground2,
    height: '100%',
    overflowY: 'auto',
  },

  // Content wrapper
  content: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    padding: tokens.spacingVerticalL,
    boxShadow: tokens.shadow4,
    minHeight: '100%',
  },
});

export const CardDetailDrawer: React.FC<ICardDetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = 'medium',
}) => {
  const styles = useStyles();

  // Get drawer class based on size
  const getDrawerSizeClass = (): string => {
    switch (size) {
      case 'small':
        return styles.drawerSmall;
      case 'large':
        return styles.drawerLarge;
      default:
        return styles.drawerMedium;
    }
  };

  return (
    <Drawer
      type="overlay"
      position="end"
      open={isOpen}
      onOpenChange={(_, data) => !data.open && onClose()}
      className={getDrawerSizeClass()}
    >
      <DrawerHeader className={styles.header}>
        {icon && <div className={styles.headerIcon}>{icon}</div>}
        <DrawerHeaderTitle className={styles.headerTitle}>
          {title}
        </DrawerHeaderTitle>
        <Button
          appearance="subtle"
          icon={<Dismiss24Regular />}
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close drawer"
        />
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        <div className={styles.content}>
          {children}
        </div>
      </DrawerBody>
    </Drawer>
  );
};

export default CardDetailDrawer;
