// src/webparts/dashboardCards/components/WaitingOnYouCard/components/SnoozeDialog.tsx

import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  RadioGroup,
  Radio,
  Field,
  Input,
  Text,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { ClockRegular } from '@fluentui/react-icons';
import { SnoozeOption, useSnooze } from '../../../hooks/useSnooze';

const useStyles = makeStyles({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  subject: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalS,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalM,
  },
  customDate: {
    marginTop: tokens.spacingVerticalS,
    marginLeft: tokens.spacingHorizontalL,
  },
  reasonField: {
    marginTop: tokens.spacingVerticalM,
  },
});

interface SnoozeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSnooze: (until: Date, reason?: string) => void;
  conversationSubject: string;
}

export const SnoozeDialog: React.FC<SnoozeDialogProps> = ({
  open,
  onOpenChange,
  onSnooze,
  conversationSubject
}) => {
  const styles = useStyles();
  const { getSnoozeDate, getSnoozeOptionLabel } = useSnooze();

  const [option, setOption] = useState<SnoozeOption>('tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSnooze = () => {
    const until = getSnoozeDate(option, customDate);
    onSnooze(until, reason || undefined);
    onOpenChange(false);
    // Reset state
    setOption('tomorrow');
    setCustomDate('');
    setReason('');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setOption('tomorrow');
    setCustomDate('');
    setReason('');
  };

  // Get minimum date for custom picker (tomorrow)
  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => data.open ? undefined : handleClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <div className={styles.titleContainer}>
              <ClockRegular />
              Snooze until...
            </div>
          </DialogTitle>
          <DialogContent>
            <Text size={200} className={styles.subject}>
              {conversationSubject}
            </Text>

            <div className={styles.options}>
              <RadioGroup
                value={option}
                onChange={(_, data) => setOption(data.value as SnoozeOption)}
              >
                <Radio value="tomorrow" label={getSnoozeOptionLabel('tomorrow')} />
                <Radio value="monday" label={getSnoozeOptionLabel('monday')} />
                <Radio value="nextWeek" label={getSnoozeOptionLabel('nextWeek')} />
                <Radio value="custom" label={getSnoozeOptionLabel('custom')} />
              </RadioGroup>

              {option === 'custom' && (
                <div className={styles.customDate}>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(_, data) => setCustomDate(data.value)}
                    min={getMinDate()}
                  />
                </div>
              )}

              <Field label="Reason (optional)" size="small" className={styles.reasonField}>
                <Input
                  placeholder="e.g., Waiting on info from Alex"
                  value={reason}
                  onChange={(_, data) => setReason(data.value)}
                />
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleSnooze}
              disabled={option === 'custom' && !customDate}
            >
              Snooze
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
