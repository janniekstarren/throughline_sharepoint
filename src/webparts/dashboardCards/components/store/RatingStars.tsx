// ============================================
// RatingStars — Star rating display (1–5, half stars)
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  stars: {
    display: 'inline-flex',
    gap: '1px',
    fontSize: '12px',
    lineHeight: '1',
  },
  star: {
    color: '#F5A623',
  },
  starEmpty: {
    color: tokens.colorNeutralStroke2,
  },
  count: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props
// ============================================

interface RatingStarsProps {
  rating: number; // 0–5
  count?: number; // number of ratings
  showCount?: boolean;
}

// ============================================
// Component
// ============================================

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  showCount = true,
}) => {
  const classes = useStyles();
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundedUp = rating - fullStars >= 0.75;

  const stars: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars || (i === fullStars && roundedUp)) {
      stars.push('★');
    } else if (i === fullStars && hasHalf) {
      stars.push('⯪');
    } else {
      stars.push('☆');
    }
  }

  return (
    <span className={classes.container}>
      <span className={classes.stars}>
        {stars.map((star, i) => (
          <span
            key={i}
            className={star === '☆' ? classes.starEmpty : classes.star}
          >
            {star === '⯪' ? '★' : star}
          </span>
        ))}
      </span>
      {showCount && count !== undefined && (
        <Text className={classes.count}>({count.toLocaleString()})</Text>
      )}
    </span>
  );
};
