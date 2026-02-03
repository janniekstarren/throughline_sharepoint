import * as React from 'react';
import { Avatar, makeStyles, tokens } from '@fluentui/react-components';
import { PendingResponse } from '../../../models/WaitingOnOthers';
import { PendingConversationItem } from '../components/PendingConversationItem';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  itemContent: {
    flex: 1,
  },
});

interface ListViewProps {
  items: PendingResponse[];
  onSendReminder: (item: PendingResponse) => void;
  onResolve: (itemId: string, resolution: 'responded' | 'gave-up' | 'no-longer-needed') => void;
  onSnooze: (item: PendingResponse) => void;
  onUnsnooze: (itemId: string) => void;
  onItemClick: (webUrl: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  onSendReminder,
  onResolve,
  onSnooze,
  onUnsnooze,
  onItemClick
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {items.map(item => (
        <div key={item.id} className={styles.item}>
          <Avatar
            name={item.recipient.displayName}
            image={item.recipient.photoUrl ? { src: item.recipient.photoUrl } : undefined}
            size={24}
          />
          <div className={styles.itemContent}>
            <PendingConversationItem
              item={item}
              onSendReminder={() => onSendReminder(item)}
              onResolve={(resolution) => onResolve(item.id, resolution)}
              onSnooze={() => onSnooze(item)}
              onUnsnooze={() => onUnsnooze(item.id)}
              onClick={() => onItemClick(item.webUrl)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
