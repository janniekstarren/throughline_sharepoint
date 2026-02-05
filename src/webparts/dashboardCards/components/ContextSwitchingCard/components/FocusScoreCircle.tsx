// ============================================
// Focus Score Circle Component
// Displays focus score as a circular progress indicator
// ============================================

import * as React from 'react';
import { Text, tokens } from '@fluentui/react-components';
import { useContextSwitchingStyles } from '../ContextSwitchingCard.styles';

interface FocusScoreCircleProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  description?: string;
}

export const FocusScoreCircle: React.FC<FocusScoreCircleProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  description
}) => {
  const styles = useContextSwitchingStyles();

  // Size configurations
  const sizeConfig = {
    small: { width: 60, strokeWidth: 6, fontSize: 'large' as const },
    medium: { width: 100, strokeWidth: 8, fontSize: 'hero700' as const },
    large: { width: 140, strokeWidth: 10, fontSize: 'hero900' as const }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color based on score
  const getScoreColor = (): string => {
    if (score >= 70) return tokens.colorPaletteGreenForeground1;
    if (score >= 40) return tokens.colorPaletteYellowForeground1;
    return tokens.colorPaletteRedForeground1;
  };

  // Description based on score
  const getScoreDescription = (): string => {
    if (description) return description;
    if (score >= 80) return 'Excellent focus! Keep it up.';
    if (score >= 60) return 'Good focus today.';
    if (score >= 40) return 'Some room for improvement.';
    return 'High context switching detected.';
  };

  return (
    <div className={styles.focusScoreContainer}>
      <div
        className={size === 'small' ? styles.miniFocusScore : styles.focusScoreCircle}
        style={{ width: config.width, height: config.width }}
      >
        <svg className={styles.focusScoreSvg} viewBox={`0 0 ${config.width} ${config.width}`}>
          {/* Background circle */}
          <circle
            className={styles.focusScoreBackground}
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            className={styles.focusScoreProgress}
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            stroke={getScoreColor()}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className={styles.focusScoreValue}>
          <Text
            className={styles.focusScoreNumber}
            style={{
              color: getScoreColor(),
              fontSize: size === 'small' ? tokens.fontSizeBase500 : undefined
            }}
          >
            {score}
          </Text>
          {showLabel && size !== 'small' && (
            <Text className={styles.focusScoreLabel}>Focus</Text>
          )}
        </div>
      </div>
      {showLabel && size !== 'small' && (
        <Text className={styles.focusScoreDescription}>
          {getScoreDescription()}
        </Text>
      )}
    </div>
  );
};

export default FocusScoreCircle;
