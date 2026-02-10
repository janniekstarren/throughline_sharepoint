/**
 * HubSummaryStatement - Greeting + summary as one inline sentence
 *
 * Renders: "Привет, Janniek — 17 items need your attention, 8 signals to watch."
 * Uses Subtitle2 size. Greeting word rotates (worldHello) or is time-based.
 * Centre-aligned.
 */

import * as React from 'react';
import { Subtitle2, makeStyles, tokens } from '@fluentui/react-components';
import { InsightsSummary } from '../../models/InsightRollup';

// "Hello" in various languages
const worldHellos = [
  { word: 'Hello', language: 'English' },
  { word: 'Hola', language: 'Spanish' },
  { word: 'Bonjour', language: 'French' },
  { word: 'Hallo', language: 'German' },
  { word: 'Ciao', language: 'Italian' },
  { word: 'Olá', language: 'Portuguese' },
  { word: 'Привет', language: 'Russian' },
  { word: '你好', language: 'Chinese' },
  { word: 'こんにちは', language: 'Japanese' },
  { word: '안녕하세요', language: 'Korean' },
  { word: 'مرحبا', language: 'Arabic' },
  { word: 'नमस्ते', language: 'Hindi' },
  { word: 'Γειά σου', language: 'Greek' },
  { word: 'Merhaba', language: 'Turkish' },
  { word: 'Xin chào', language: 'Vietnamese' },
  { word: 'Hej', language: 'Swedish' },
  { word: 'Hei', language: 'Norwegian' },
  { word: 'Sawubona', language: 'Zulu' },
  { word: 'Aloha', language: 'Hawaiian' },
  { word: 'Shalom', language: 'Hebrew' },
];

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function getFirstName(displayName?: string): string {
  if (!displayName) return '';
  return displayName.trim().split(' ')[0] || '';
}

const useStyles = makeStyles({
  root: {
    textAlign: 'center' as const,
  },
  greeting: {
    color: tokens.colorNeutralForeground1,
  },
  languageHint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
  },
  fadeIn: {
    animationName: {
      from: { opacity: 0, transform: 'translateY(-4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.4s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
  fadeOut: {
    animationName: {
      from: { opacity: 1, transform: 'translateY(0)' },
      to: { opacity: 0, transform: 'translateY(4px)' },
    },
    animationDuration: '0.25s',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
  },
  helloWord: {
    display: 'inline-block',
  },
});

export interface IHubSummaryStatementProps {
  summary: InsightsSummary;
  /** User display name */
  userName?: string;
  /** Salutation type: 'worldHello' | 'timeBased' | 'none' */
  salutationType?: string;
}

export const HubSummaryStatement: React.FC<IHubSummaryStatementProps> = ({
  summary,
  userName,
  salutationType = 'worldHello',
}) => {
  const styles = useStyles();

  // World hello rotation
  const [currentHelloIndex, setCurrentHelloIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (salutationType !== 'worldHello') return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentHelloIndex(prev => (prev + 1) % worldHellos.length);
        setIsAnimating(false);
      }, 250);
    }, 5000);
    return () => clearInterval(interval);
  }, [salutationType]);

  const firstName = getFirstName(userName);

  // Build greeting prefix
  let greetingNode: React.ReactNode = null;
  if (salutationType === 'worldHello') {
    const hello = worldHellos[currentHelloIndex];
    greetingNode = (
      <>
        <span className={`${styles.helloWord} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}>
          {hello.word}
        </span>
        {firstName && `, ${firstName}`}
        {' '}
        <span className={styles.languageHint}>({hello.language})</span>
      </>
    );
  } else if (salutationType === 'timeBased') {
    greetingNode = (
      <>
        {getTimeBasedGreeting()}{firstName && `, ${firstName}`}
      </>
    );
  } else if (salutationType !== 'none' && firstName) {
    greetingNode = <>{firstName}</>;
  }

  // Build summary suffix
  const attentionCount = summary.criticalCount + summary.warningCount;
  const signalCount = summary.infoCount + summary.positiveCount;

  let summaryText = '';
  if (summary.totalCount === 0) {
    summaryText = 'everything looks good right now.';
  } else {
    const parts: string[] = [];
    if (attentionCount > 0) {
      parts.push(`${attentionCount} item${attentionCount !== 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} your attention`);
    }
    if (signalCount > 0) {
      parts.push(`${signalCount} signal${signalCount !== 1 ? 's' : ''} to watch`);
    }
    summaryText = parts.join(', ') + '.';
  }

  return (
    <div className={styles.root}>
      <Subtitle2 className={styles.greeting}>
        {greetingNode && (
          <>
            {greetingNode}
            {' — '}
          </>
        )}
        {summaryText}
      </Subtitle2>
    </div>
  );
};
