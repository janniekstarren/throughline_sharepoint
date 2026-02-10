// ============================================
// SpendAdvisor — Persistent store footer
// Shows: tier cost + add-on cost + total
// Suggests tier upgrade if it would save money
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Badge,
} from '@fluentui/react-components';
import {
  ArrowCircleUp20Regular,
} from '@fluentui/react-icons';
import { useEntitlements } from '../../hooks/useEntitlements';
import { useLicense } from '../../context/LicenseContext';
import { LicenseTierMeta } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexShrink: 0,
  },
  spending: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  spendItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  spendLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  spendValue: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  divider: {
    width: '1px',
    height: '32px',
    backgroundColor: tokens.colorNeutralStroke3,
  },
  total: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  upgrade: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  savingsText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
});

// ============================================
// Component
// ============================================

export const SpendAdvisor: React.FC = () => {
  const classes = useStyles();
  const { spendingSummary } = useEntitlements();
  const { currentTier } = useLicense();
  const tierMeta = LicenseTierMeta[currentTier];

  const {
    tierMonthlyPrice,
    addOnMonthlyTotal,
    totalMonthly,
    addOnCount,
    suggestedTierUpgrade,
  } = spendingSummary;

  return (
    <div className={classes.footer}>
      <div className={classes.spending}>
        {/* Tier cost */}
        <div className={classes.spendItem}>
          <Text className={classes.spendLabel}>{tierMeta.displayName} Tier</Text>
          <Text className={classes.spendValue}>
            ${tierMonthlyPrice.toFixed(2)}/mo
          </Text>
        </div>

        {addOnCount > 0 && (
          <>
            <div className={classes.divider} />
            <div className={classes.spendItem}>
              <Text className={classes.spendLabel}>{addOnCount} Add-on{addOnCount !== 1 ? 's' : ''}</Text>
              <Text className={classes.spendValue}>
                ${addOnMonthlyTotal.toFixed(2)}/mo
              </Text>
            </div>
          </>
        )}

        <div className={classes.divider} />
        <div className={classes.spendItem}>
          <Text className={classes.spendLabel}>Total</Text>
          <Text className={classes.total}>
            ${totalMonthly.toFixed(2)}/mo
          </Text>
        </div>
      </div>

      {/* Upgrade suggestion */}
      {suggestedTierUpgrade && (
        <div className={classes.upgrade}>
          <Badge
            appearance="filled"
            color="success"
            icon={<ArrowCircleUp20Regular />}
          >
            Save ${suggestedTierUpgrade.monthlySavings.toFixed(2)}/mo
          </Badge>
          <Text className={classes.savingsText}>
            Upgrade to {suggestedTierUpgrade.tier} — covers {suggestedTierUpgrade.wouldReplace} add-on{suggestedTierUpgrade.wouldReplace !== 1 ? 's' : ''}
          </Text>
          <Button appearance="outline" size="small">
            Learn more
          </Button>
        </div>
      )}
    </div>
  );
};
