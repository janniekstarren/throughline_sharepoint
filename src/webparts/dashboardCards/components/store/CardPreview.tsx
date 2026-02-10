// ============================================
// CardPreview — Live card preview with size toggle (S/M/L)
// Renders a PlaceholderCard in a contained preview frame
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  ToggleButton,
} from '@fluentui/react-components';
import { CardRegistration } from '../../models/CardCatalog';
import { CardStoreListing } from '../../models/CardStore';
import { PlaceholderCard } from '../cards/PlaceholderCard/PlaceholderCard';
import { CardSize } from '../../types/CardSize';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sizeToggle: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  previewFrame: {
    borderRadius: tokens.borderRadiusLarge,
    borderTopWidth: tokens.strokeWidthThin,
    borderRightWidth: tokens.strokeWidthThin,
    borderBottomWidth: tokens.strokeWidthThin,
    borderLeftWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalL,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    transitionProperty: 'max-width',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '100%',
  },
});

// ============================================
// Props
// ============================================

interface CardPreviewProps {
  card: CardRegistration;
  listing: CardStoreListing;
}

// ============================================
// Component
// ============================================

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  listing,
}) => {
  const classes = useStyles();
  const [previewSize, setPreviewSize] = React.useState<CardSize>('medium');

  // Suppress unused - listing reserved for future accent color use
  void listing;

  // Frame width based on preview size
  const frameMaxWidth = previewSize === 'small' ? '280px' : previewSize === 'medium' ? '400px' : '100%';

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <Text className={classes.label}>Live Preview</Text>
        <div className={classes.sizeToggle}>
          <ToggleButton
            size="small"
            appearance={previewSize === 'small' ? 'primary' : 'subtle'}
            checked={previewSize === 'small'}
            onClick={() => setPreviewSize('small')}
          >
            S
          </ToggleButton>
          <ToggleButton
            size="small"
            appearance={previewSize === 'medium' ? 'primary' : 'subtle'}
            checked={previewSize === 'medium'}
            onClick={() => setPreviewSize('medium')}
          >
            M
          </ToggleButton>
          <ToggleButton
            size="small"
            appearance={previewSize === 'large' ? 'primary' : 'subtle'}
            checked={previewSize === 'large'}
            onClick={() => setPreviewSize('large')}
          >
            L
          </ToggleButton>
        </div>
      </div>

      <div className={classes.previewFrame} style={{ maxWidth: frameMaxWidth }}>
        <div className={classes.cardWrapper}>
          <PlaceholderCard
            card={card}
            size={previewSize}
          />
        </div>
      </div>
    </div>
  );
};
