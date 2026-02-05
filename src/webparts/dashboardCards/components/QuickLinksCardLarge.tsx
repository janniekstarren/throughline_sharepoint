// ============================================
// QuickLinksCardLarge - Full-width quick links display
// Horizontal layout spanning all columns
// ============================================

import * as React from 'react';
import {
  tokens,
  Text,
  makeStyles,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  Link24Regular,
  Mail24Regular,
  PeopleTeam24Regular,
  Cloud24Regular,
  ShareAndroid24Regular,
  CalendarLtr24Regular,
  Notebook24Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { IQuickLink } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { BaseCard, CardHeader } from './shared';
import { useCardStyles } from './cardStyles';

export interface IQuickLinksCardLargeProps {
  links: IQuickLink[];
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

// QuickLinksLarge-specific styles - horizontal full-width layout
const useQuickLinksLargeStyles = makeStyles({
  // Full-width container
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  // Horizontal scrollable link container
  linkContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'thin',
    '::-webkit-scrollbar': {
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: tokens.colorNeutralBackground2,
      borderRadius: tokens.borderRadiusSmall,
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralStroke1,
      borderRadius: tokens.borderRadiusSmall,
    },
  },
  // Individual link item - larger for full-width card
  linkItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    transitionProperty: 'background-color, transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    flexShrink: 0,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  // Larger icon container
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorBrandForeground1,
    fontSize: '28px',
  },
  // Link title
  linkTitle: {
    textAlign: 'center' as const,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100px',
  },
  // Link description (optional)
  linkDescription: {
    textAlign: 'center' as const,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100px',
  },
});

// Dynamic icon component that maps icon names to Fluent UI 9 icons
const QuickLinkIcon: React.FC<{ iconName?: string }> = ({ iconName }) => {
  switch (iconName) {
    case 'Mail':
      return <Mail24Regular />;
    case 'TeamsLogo':
      return <PeopleTeam24Regular />;
    case 'OneDrive':
      return <Cloud24Regular />;
    case 'SharepointLogo':
      return <ShareAndroid24Regular />;
    case 'PlannerLogo':
      return <CalendarLtr24Regular />;
    case 'OneNoteLogo':
      return <Notebook24Regular />;
    case 'Link':
    default:
      return <Link24Regular />;
  }
};

// Default quick links when none are configured
const defaultLinks: IQuickLink[] = [
  { id: '1', title: 'Outlook', url: 'https://outlook.office.com', icon: 'Mail' },
  { id: '2', title: 'Teams', url: 'https://teams.microsoft.com', icon: 'TeamsLogo' },
  { id: '3', title: 'OneDrive', url: 'https://onedrive.com', icon: 'OneDrive' },
  { id: '4', title: 'SharePoint', url: 'https://sharepoint.com', icon: 'SharepointLogo' },
  { id: '5', title: 'Planner', url: 'https://tasks.office.com', icon: 'PlannerLogo' },
  { id: '6', title: 'OneNote', url: 'https://onenote.com', icon: 'OneNoteLogo' },
];

export const QuickLinksCardLarge: React.FC<IQuickLinksCardLargeProps> = ({
  links,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();
  const quickLinksStyles = useQuickLinksLargeStyles();
  const displayLinks = links.length > 0 ? links : defaultLinks;
  const linkRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

  // Keyboard navigation handler for horizontal layout
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent, currentIndex: number): void => {
    const totalLinks = displayLinks.length;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % totalLinks;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + totalLinks) % totalLinks;
        event.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        nextIndex = totalLinks - 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    linkRefs.current[nextIndex]?.focus();
  }, [displayLinks.length]);

  // Collapse button for switching to medium card view
  const collapseButton = onToggleSize ? (
    <Tooltip content="Collapse to compact view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ContractDownLeft20Regular />}
        onClick={onToggleSize}
        aria-label="Collapse card"
      />
    </Tooltip>
  ) : undefined;

  return (
    <BaseCard testId="quick-links-card-large">
      <CardHeader
        icon={<Link24Regular />}
        title={title || 'Quick Links'}
        cardId="quickLinks"
        actions={collapseButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div
            className={quickLinksStyles.linkContainer}
            role="toolbar"
            aria-label="Quick links"
          >
            {displayLinks.map((link, index) => (
              <a
                key={link.id}
                ref={(el) => { linkRefs.current[index] = el; }}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={quickLinksStyles.linkItem}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="link"
                aria-label={`${link.title} - opens in new tab`}
              >
                <div className={quickLinksStyles.linkIcon}>
                  <QuickLinkIcon iconName={link.icon} />
                </div>
                <Text className={quickLinksStyles.linkTitle}>{link.title}</Text>
              </a>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default QuickLinksCardLarge;
