// ============================================
// QuickLinksCard - Displays quick access links
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  makeStyles,
} from '@fluentui/react-components';
import {
  Link24Regular,
  Mail24Regular,
  PeopleTeam24Regular,
  Cloud24Regular,
  ShareAndroid24Regular,
  CalendarLtr24Regular,
  Notebook24Regular,
} from '@fluentui/react-icons';
import { IQuickLink } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { BaseCard, CardHeader } from './shared';
import { useCardStyles } from './cardStyles';

export interface IQuickLinksCardProps {
  links: IQuickLink[];
  title?: string;
}

// QuickLinks-specific styles (grid layout is unique to this card)
const useQuickLinksStyles = makeStyles({
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  linkItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    transitionProperty: 'background-color, transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
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
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground2,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorBrandForeground1,
    fontSize: '24px',
  },
  linkTitle: {
    textAlign: 'center' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100%',
    color: tokens.colorNeutralForeground1,
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

export const QuickLinksCard: React.FC<IQuickLinksCardProps> = ({ links, title }) => {
  const styles = useCardStyles();
  const quickLinksStyles = useQuickLinksStyles();
  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <BaseCard testId="quick-links-card">
      <CardHeader
        icon={<Link24Regular />}
        title={title || 'Quick Links'}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={quickLinksStyles.linkGrid}>
            {displayLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={quickLinksStyles.linkItem}
              >
                <div className={quickLinksStyles.linkIcon}>
                  <QuickLinkIcon iconName={link.icon} />
                </div>
                <Caption1 className={quickLinksStyles.linkTitle}>{link.title}</Caption1>
              </a>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default QuickLinksCard;
