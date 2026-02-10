// ============================================
// IntegrationStatusBadge — Status indicator for platforms
// ============================================

import * as React from 'react';
import { Badge, makeStyles, tokens } from '@fluentui/react-components';
import { ConnectionStatus, PlatformStatus } from '../../models/Integration';

const useStyles = makeStyles({
  badge: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
});

interface IntegrationStatusBadgeProps {
  connectionStatus?: ConnectionStatus;
  platformStatus: PlatformStatus;
}

export const IntegrationStatusBadge: React.FC<IntegrationStatusBadgeProps> = ({
  connectionStatus,
  platformStatus,
}) => {
  const classes = useStyles();

  if (connectionStatus === ConnectionStatus.Connected) {
    return (
      <Badge className={classes.badge} appearance="filled" color="success" size="small">
        Connected
      </Badge>
    );
  }

  if (connectionStatus === ConnectionStatus.Error) {
    return (
      <Badge className={classes.badge} appearance="filled" color="danger" size="small">
        Error
      </Badge>
    );
  }

  if (connectionStatus === ConnectionStatus.Expired) {
    return (
      <Badge className={classes.badge} appearance="filled" color="warning" size="small">
        Expired
      </Badge>
    );
  }

  if (connectionStatus === ConnectionStatus.Disabled) {
    return (
      <Badge className={classes.badge} appearance="tint" color="subtle" size="small">
        Disabled
      </Badge>
    );
  }

  // Not connected — show platform availability status
  switch (platformStatus) {
    case PlatformStatus.Available:
      return (
        <Badge className={classes.badge} appearance="tint" color="informative" size="small">
          Available
        </Badge>
      );
    case PlatformStatus.ComingSoon:
      return (
        <Badge className={classes.badge} appearance="tint" color="brand" size="small">
          Coming Soon
        </Badge>
      );
    case PlatformStatus.InDevelopment:
      return (
        <Badge className={classes.badge} appearance="tint" color="warning" size="small">
          In Development
        </Badge>
      );
    case PlatformStatus.Requested:
      return (
        <Badge className={classes.badge} appearance="tint" color="subtle" size="small">
          Requested
        </Badge>
      );
    default:
      return null;
  }
};
