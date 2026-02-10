/**
 * Greeting - Time-aware greeting (relocated above Intelligence Hub)
 *
 * Shows "Good morning/afternoon/evening, {firstName}" with a sub-line
 * briefing date, and an eye toggle to show/hide the Intelligence Hub.
 * The greeting itself always remains visible.
 */

import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { Eye20Regular, EyeOff20Regular } from '@fluentui/react-icons';
import { useGreetingStyles } from './hubStyles';
import { GreetingEnter, SublineEnter } from './hubMotions';

export interface IGreetingProps {
  /** User display name */
  userName: string;
  /** Whether the Intelligence Hub is currently visible */
  isHubVisible: boolean;
  /** Toggle Hub visibility */
  onToggleHubVisibility: () => void;
}

function getGreetingText(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getSublineText(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `Here's your intelligence briefing for ${weekday}, ${date}.`;
}

export const Greeting: React.FC<IGreetingProps> = ({
  userName,
  isHubVisible,
  onToggleHubVisibility,
}) => {
  const styles = useGreetingStyles();

  const firstName = React.useMemo(() => {
    if (!userName) return '';
    return userName.split(' ')[0];
  }, [userName]);

  const hour = React.useMemo(() => new Date().getHours(), []);
  const greeting = getGreetingText(hour);
  const subline = getSublineText();

  return (
    <div className={styles.root}>
      <div className={styles.greetingRow}>
        <GreetingEnter visible>
          <h2 className={styles.greetingText}>
            {greeting}, {firstName}
          </h2>
        </GreetingEnter>
        <Tooltip
          content={isHubVisible ? 'Hide Intelligence Hub' : 'Show Intelligence Hub'}
          relationship="label"
        >
          <Button
            className={styles.collapseButton}
            appearance="subtle"
            icon={isHubVisible ? <Eye20Regular /> : <EyeOff20Regular />}
            onClick={onToggleHubVisibility}
            aria-label={isHubVisible ? 'Hide Intelligence Hub' : 'Show Intelligence Hub'}
          />
        </Tooltip>
      </div>
      <SublineEnter visible>
        <p className={styles.subline}>{subline}</p>
      </SublineEnter>
    </div>
  );
};
