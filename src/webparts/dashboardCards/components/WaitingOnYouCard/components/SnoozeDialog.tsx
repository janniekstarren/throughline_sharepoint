// src/webparts/dashboardCards/components/WaitingOnYouCard/components/SnoozeDialog.tsx

import * as React from 'react';
import { useState, useCallback } from 'react';
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
import { DatePicker } from '@fluentui/react-datepicker-compat';
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
  datePicker: {
    width: '200px',
  },
});

interface SnoozeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSnooze: (until: Date, reason?: string) => void;
  conversationSubject: string;
  /** Current snooze date if editing an existing snooze */
  currentSnoozeDate?: Date;
  /** Mode for the dialog */
  mode?: 'snooze' | 'edit';
}

export const SnoozeDialog: React.FC<SnoozeDialogProps> = ({
  open,
  onOpenChange,
  onSnooze,
  conversationSubject,
  currentSnoozeDate,
  mode = 'snooze'
}) => {
  const styles = useStyles();
  const { getSnoozeDate, getSnoozeOptionLabel } = useSnooze();

  const [option, setOption] = useState<SnoozeOption>(currentSnoozeDate ? 'custom' : 'tomorrow');
  const [customDate, setCustomDate] = useState<Date | null | undefined>(currentSnoozeDate || null);
  const [reason, setReason] = useState('');

  // Reset state when dialog opens with new currentSnoozeDate
  React.useEffect(() => {
    if (open) {
      if (currentSnoozeDate) {
        setOption('custom');
        setCustomDate(currentSnoozeDate);
      } else {
        setOption('tomorrow');
        setCustomDate(null);
      }
      setReason('');
    }
  }, [open, currentSnoozeDate]);

  const handleSnooze = useCallback(() => {
    let until: Date;
    if (option === 'custom' && customDate) {
      until = customDate;
    } else {
      until = getSnoozeDate(option, customDate?.toISOString().split('T')[0] || '');
    }
    onSnooze(until, reason || undefined);
    onOpenChange(false);
    // Reset state
    setOption('tomorrow');
    setCustomDate(null);
    setReason('');
  }, [option, customDate, reason, getSnoozeDate, onSnooze, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset state
    setOption('tomorrow');
    setCustomDate(null);
    setReason('');
  }, [onOpenChange]);

  // Get minimum date for custom picker (tomorrow)
  const getMinDate = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const handleDateSelect = useCallback((date: Date | null | undefined) => {
    setCustomDate(date);
  }, []);

  const isSnoozeDisabled = option === 'custom' && !customDate;

  return (
    <Dialog open={open} onOpenChange={(_, data) => data.open ? undefined : handleClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <div className={styles.titleContainer}>
              <ClockRegular />
              {mode === 'edit' ? 'Change snooze time' : 'Snooze until...'}
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
                  <DatePicker
                    className={styles.datePicker}
                    placeholder="Select a date"
                    value={customDate}
                    onSelectDate={handleDateSelect}
                    minDate={getMinDate()}
                    formatDate={(date) => date ? date.toLocaleDateString() : ''}
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
              disabled={isSnoozeDisabled}
            >
              {mode === 'edit' ? 'Update Snooze' : 'Snooze'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
