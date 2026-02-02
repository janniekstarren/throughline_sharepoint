import * as React from 'react';
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
import styles from './QuickLinksCard.module.scss';

export interface IQuickLinksCardProps {
  links: IQuickLink[];
  title?: string;
}

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
  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Link24Regular className={styles.cardIcon} />
        <span>{title || 'Quick Links'}</span>
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
                <span className={styles.linkTitle}>{link.title}</span>
              </a>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default QuickLinksCard;
