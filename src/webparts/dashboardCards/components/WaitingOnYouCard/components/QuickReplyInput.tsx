// src/webparts/dashboardCards/components/WaitingOnYouCard/components/QuickReplyInput.tsx

import * as React from 'react';
import { useState } from 'react';
import {
  Input,
  Button,
  Spinner,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { SendRegular, CheckmarkRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  input: {
    flex: 1,
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorPaletteGreenForeground1,
    padding: `${tokens.spacingVerticalS} 0`,
  },
});

interface QuickReplyInputProps {
  onSend: (message: string) => Promise<boolean>;
  placeholder?: string;
}

export const QuickReplyInput: React.FC<QuickReplyInputProps> = ({
  onSend,
  placeholder = 'Quick reply...'
}) => {
  const styles = useStyles();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const success = await onSend(message.trim());
    setIsSending(false);

    if (success) {
      setSent(true);
      setMessage('');
      // Reset success state after 3 seconds
      setTimeout(() => setSent(false), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (sent) {
    return (
      <div className={styles.success}>
        <CheckmarkRegular />
        <span>Sent!</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Input
        className={styles.input}
        placeholder={placeholder}
        value={message}
        onChange={(_, data) => setMessage(data.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending}
        size="small"
      />
      <Button
        appearance="primary"
        size="small"
        icon={isSending ? <Spinner size="tiny" /> : <SendRegular />}
        onClick={handleSend}
        disabled={!message.trim() || isSending}
      />
    </div>
  );
};
