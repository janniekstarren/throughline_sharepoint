import * as React from 'react';
import {
  makeStyles,
  tokens,
  Title1,
  Title2,
  Title3,
  Subtitle1,
  Subtitle2,
} from '@fluentui/react-components';

export type SalutationType = 'timeBased' | 'worldHello' | 'claude' | 'none';
export type SalutationSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export interface ISalutationProps {
  type: SalutationType;
  size?: SalutationSize;
  userName?: string;
}

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

// Claude-style greetings - comprehensive collection of friendly, helpful greetings
const claudeGreetings = [
  // Classic Claude greetings
  "Hi there! How can I help you today?",
  "Hello! I'm ready to assist you.",
  "Hey! What would you like to work on?",
  "Good to see you! Let's get started.",
  "Hi! I'm here to help.",
  "Hello! What's on your agenda today?",
  "Hey there! How can I assist?",
  "Welcome back! What can I do for you?",
  // Warm and friendly
  "Hi! What can I help you with?",
  "Hello there! Ready when you are.",
  "Hi! Let's make today productive.",
  "Hello! Happy to help with whatever you need.",
  "Hey! What's on your mind?",
  "Hi there! What are we working on today?",
  "Hello! I'd love to help.",
  // Enthusiastic
  "Hi! Great to see you.",
  "Hello! Let's dive in.",
  "Hey there! What brings you here today?",
  "Hi! Excited to help you out.",
  "Hello! What can we accomplish together?",
  // Casual and approachable
  "Hey! How's it going?",
  "Hi! What's up?",
  "Hello! Hope you're having a great day.",
  "Hey there! Let me know how I can help.",
  "Hi! Ready to get things done?",
  // Professional yet warm
  "Hello! How may I assist you today?",
  "Hi there! What would you like to explore?",
  "Hello! Let me know what you need.",
  "Hi! Happy to tackle any questions you have.",
  "Hello! What challenges can we solve today?",
];

const useStyles = makeStyles({
  container: {
    marginBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalS,
  },
  greeting: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  fadeIn: {
    animationName: {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
  fadeOut: {
    animationName: {
      from: { opacity: 1, transform: 'translateY(0)' },
      to: { opacity: 0, transform: 'translateY(10px)' },
    },
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'forwards',
  },
  worldHelloContainer: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens.spacingHorizontalS,
  },
  helloWord: {
    display: 'inline-block',
    minWidth: '200px',
  },
  languageHint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
  },
});

/**
 * Get time-based greeting based on local timezone
 */
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good evening'; // Late night
  }
}

/**
 * Get a random Claude-style greeting
 */
function getClaudeGreeting(): string {
  const index = Math.floor(Math.random() * claudeGreetings.length);
  return claudeGreetings[index];
}

/**
 * Extract first name from full display name
 */
function getFirstName(displayName?: string): string {
  if (!displayName) return '';
  const parts = displayName.trim().split(' ');
  return parts[0] || '';
}

// Typography component mapping based on size
const TypographyComponents = {
  h1: Title1,
  h2: Title2,
  h3: Title3,
  h4: Subtitle1,
  h5: Subtitle2,
};

export const Salutation: React.FC<ISalutationProps> = ({ type, size = 'h4', userName }) => {
  const styles = useStyles();
  const [currentHelloIndex, setCurrentHelloIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [claudeGreeting] = React.useState(() => getClaudeGreeting());

  // Get the appropriate typography component based on size
  const TypographyComponent = TypographyComponents[size] || Title1;

  // Rotate through world hellos every 5 seconds
  React.useEffect(() => {
    if (type !== 'worldHello') return;

    const interval = setInterval(() => {
      setIsAnimating(true);

      // After fade out, change the word
      setTimeout(() => {
        setCurrentHelloIndex((prev) => (prev + 1) % worldHellos.length);
        setIsAnimating(false);
      }, 300); // Match fadeOut duration
    }, 5000);

    return () => clearInterval(interval);
  }, [type]);

  if (type === 'none') {
    return null;
  }

  const firstName = getFirstName(userName);

  if (type === 'timeBased') {
    const greeting = getTimeBasedGreeting();
    return (
      <div className={styles.container}>
        <TypographyComponent className={styles.greeting}>
          {greeting}{firstName ? `, ${firstName}` : ''}
        </TypographyComponent>
      </div>
    );
  }

  if (type === 'worldHello') {
    const currentHello = worldHellos[currentHelloIndex];
    return (
      <div className={styles.container}>
        <div className={styles.worldHelloContainer}>
          <TypographyComponent
            className={`${styles.greeting} ${styles.helloWord} ${isAnimating ? styles.fadeOut : styles.fadeIn}`}
          >
            {currentHello.word}{firstName ? `, ${firstName}` : ''}
          </TypographyComponent>
          <span className={styles.languageHint}>({currentHello.language})</span>
        </div>
      </div>
    );
  }

  if (type === 'claude') {
    return (
      <div className={styles.container}>
        <TypographyComponent className={`${styles.greeting} ${styles.fadeIn}`}>
          {claudeGreeting}
        </TypographyComponent>
      </div>
    );
  }

  return null;
};

export default Salutation;
