import * as React from 'react';
import {
  Body1Strong,
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
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

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
  const styles = useCardStyles();
  const displayLinks = links.length > 0 ? links : defaultLinks;

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <Link24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'Quick Links'}</Body1Strong>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.gridLayout}>
            {displayLinks.map((link, index) => (
              <ListItemEnter key={link.id} visible={true}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gridItem}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={styles.gridItemIcon}>
                    <QuickLinkIcon iconName={link.icon} />
                  </div>
                  <span className={styles.gridItemLabel}>{link.title}</span>
                </a>
              </ListItemEnter>
            ))}
          </div>
        </div>
      </div>
    </CardEnter>
  );
};

export default QuickLinksCard;
