import * as React from 'react';
import {
  makeStyles,
  tokens,
  Body1Strong,
  Caption1,
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

export interface IQuickLinksCardProps {
  links: IQuickLink[];
  title?: string;
}

// Fluent UI 9 styles using makeStyles and design tokens
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
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
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  const styles = useStyles();
  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Link24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Quick Links'}</Body1Strong>
      </div>
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.linkGrid}>
            {displayLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkItem}
              >
                <div className={styles.linkIcon}>
                  <QuickLinkIcon iconName={link.icon} />
                </div>
                <Caption1 className={styles.linkTitle}>{link.title}</Caption1>
              </a>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default QuickLinksCard;
