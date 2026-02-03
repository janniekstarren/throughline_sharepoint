import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Field,
  Input,
  Textarea,
  Dropdown,
  Option,
  Text,
  Spinner,
  Badge,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { SendRegular, PersonRegular } from '@fluentui/react-icons';
import { PendingResponse, ReminderTemplate, DEFAULT_REMINDER_TEMPLATES } from '../../../models/WaitingOnOthers';

const useStyles = makeStyles({
  recipient: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  recipientInfo: {
    flex: 1,
  },
  waitingTime: {
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
  },
  templateSelect: {
    marginBottom: tokens.spacingVerticalM,
  },
  customizedNote: {
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalS,
  },
  toneBadge: {
    marginLeft: tokens.spacingHorizontalS,
  },
});

interface ReminderComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingItem: PendingResponse;
  onSend: (subject: string, body: string, template: string) => Promise<boolean>;
}

export const ReminderComposer: React.FC<ReminderComposerProps> = ({
  open,
  onOpenChange,
  pendingItem,
  onSend
}) => {
  const styles = useStyles();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('gentle-nudge');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [customized, setCustomized] = useState(false);

  // Apply template
  const applyTemplate = (templateId: string): void => {
    const template = DEFAULT_REMINDER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const firstName = pendingItem.recipient.displayName.split(' ')[0];

    const newSubject = template.subject
      .replace('{originalSubject}', pendingItem.subject);

    const newBody = template.body
      .replace('{firstName}', firstName)
      .replace('{originalSubject}', pendingItem.subject);

    setSubject(newSubject);
    setBody(newBody);
    setSelectedTemplate(templateId);
    setCustomized(false);
  };

  // Initialize with default template
  React.useEffect(() => {
    if (open) {
      applyTemplate('gentle-nudge');
    }
  }, [open, pendingItem]);

  const currentTemplate = useMemo(() =>
    DEFAULT_REMINDER_TEMPLATES.find(t => t.id === selectedTemplate),
    [selectedTemplate]
  );

  const handleSend = async (): Promise<void> => {
    setIsSending(true);
    const success = await onSend(subject, body, selectedTemplate);
    setIsSending(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const getToneBadgeColor = (tone: string): 'success' | 'informative' | 'warning' => {
    switch (tone) {
      case 'gentle': return 'success';
      case 'neutral': return 'informative';
      case 'firm': return 'warning';
      default: return 'informative';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Send Reminder</DialogTitle>
          <DialogContent>
            {/* Recipient info */}
            <div className={styles.recipient}>
              <PersonRegular />
              <div className={styles.recipientInfo}>
                <Text weight="semibold">{pendingItem.recipient.displayName}</Text>
                <Text size={200} style={{ display: 'block', color: tokens.colorNeutralForeground3 }}>
                  {pendingItem.recipient.email}
                </Text>
              </div>
              <Text size={200} className={styles.waitingTime}>
                Waiting {Math.floor(pendingItem.waitingDuration / 24)} days
              </Text>
            </div>

            {/* Template selector */}
            <Field label="Template" className={styles.templateSelect}>
              <Dropdown
                value={currentTemplate?.name || ''}
                onOptionSelect={(_, data) => applyTemplate(data.optionValue as string)}
              >
                {DEFAULT_REMINDER_TEMPLATES.map((template: ReminderTemplate) => (
                  <Option key={template.id} value={template.id} text={template.name}>
                    {template.name}
                    <Badge
                      appearance="tint"
                      color={getToneBadgeColor(template.tone)}
                      size="small"
                      className={styles.toneBadge}
                    >
                      {template.tone}
                    </Badge>
                  </Option>
                ))}
              </Dropdown>
            </Field>

            {/* Subject */}
            <Field label="Subject">
              <Input
                value={subject}
                onChange={(_, data) => {
                  setSubject(data.value);
                  setCustomized(true);
                }}
              />
            </Field>

            {/* Body */}
            <Field label="Message">
              <Textarea
                value={body}
                onChange={(_, data) => {
                  setBody(data.value);
                  setCustomized(true);
                }}
                rows={6}
              />
            </Field>

            {customized && (
              <Text size={200} className={styles.customizedNote}>
                Message customized from template
              </Text>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              icon={isSending ? <Spinner size="tiny" /> : <SendRegular />}
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !body.trim()}
            >
              Send Reminder
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ReminderComposer;
