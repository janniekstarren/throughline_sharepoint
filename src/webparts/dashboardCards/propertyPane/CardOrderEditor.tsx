import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Switch,
  Divider,
  mergeClasses,
  Input,
} from '@fluentui/react-components';
import {
  ArrowUp24Regular,
  ArrowDown24Regular,
  ReOrderDotsVertical24Regular,
  Calendar24Regular,
  Mail24Regular,
  TaskListSquareLtr24Regular,
  Document24Regular,
  People24Regular,
  Link24Regular,
  Edit20Regular,
  Checkmark20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Eye20Regular,
  EyeOff20Regular,
  TextT20Regular,
  Add20Regular,
  Delete20Regular,
  Grid24Regular,
} from '@fluentui/react-icons';
import { ICategoryConfig, DEFAULT_CATEGORY_ORDER, CATEGORIES } from './CardConfigDialog';

// Waiting On You card settings
export interface IWaitingOnYouSettings {
  staleDays: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannels: boolean;
  showChart: boolean;
}

export interface ICardOrderEditorProps {
  label: string;
  cardOrder: string[];
  cardVisibility: Record<string, boolean>;
  categoryNames: Record<string, string>;
  categoryOrder: string[];
  categoryConfig: Record<string, ICategoryConfig>;
  cardCategoryAssignment: Record<string, string>;
  onOrderChanged: (newOrder: string[]) => void;
  onVisibilityChanged: (cardId: string, visible: boolean) => void;
  onCategoryNameChanged: (categoryId: string, name: string) => void;
  onCategoryOrderChanged: (newOrder: string[]) => void;
  onCategoryConfigChanged: (categoryId: string, config: Partial<ICategoryConfig>) => void;
  onCardCategoryChanged: (cardId: string, categoryId: string) => void;
  onCategoryAdded: (categoryId: string, name: string) => void;
  onCategoryDeleted: (categoryId: string) => void;
  // Waiting On You settings
  waitingOnYouSettings?: IWaitingOnYouSettings;
  onWaitingOnYouSettingsChanged?: (settings: IWaitingOnYouSettings) => void;
}

// Card display names mapping
const cardDisplayNames: Record<string, string> = {
  todaysAgenda: "Today's Agenda",
  unreadInbox: 'Unread Inbox',
  myTasks: 'My Tasks',
  recentFiles: 'Recent Files',
  upcomingWeek: 'Upcoming Week',
  flaggedEmails: 'Flagged Emails',
  myTeam: 'My Team',
  sharedWithMe: 'Shared With Me',
  quickLinks: 'Quick Links',
  siteActivity: 'Site Activity',
  waitingOnYou: 'Waiting On You',
};

// Category icons
const categoryIcons: Record<string, React.ReactElement> = {
  calendar: <Calendar24Regular />,
  email: <Mail24Regular />,
  tasks: <TaskListSquareLtr24Regular />,
  files: <Document24Regular />,
  people: <People24Regular />,
  navigation: <Link24Regular />,
  available: <Grid24Regular />,
};

// Default card order
export const DEFAULT_CARD_ORDER: string[] = [
  'todaysAgenda',
  'unreadInbox',
  'myTasks',
  'recentFiles',
  'upcomingWeek',
  'flaggedEmails',
  'myTeam',
  'sharedWithMe',
  'quickLinks',
  'siteActivity',
  'waitingOnYou',
  'waitingOnOthers',
];

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
    letterSpacing: '-0.01em',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  categorySection: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '10px',
    border: 'none',
    overflow: 'hidden',
    boxShadow: tokens.shadow4,
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  categorySectionHidden: {
    opacity: 0.6,
  },
  categorySectionDragging: {
    boxShadow: tokens.shadow16,
    opacity: 0.9,
    transform: 'scale(1.02)',
  },
  categorySectionDragOver: {
    boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
  },
  availableCategory: {
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: 'none',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    userSelect: 'none',
    transitionProperty: 'background-color',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  categoryHeaderCollapsed: {
    borderBottom: 'none',
  },
  collapseIcon: {
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: '0.15s',
  },
  categoryIcon: {
    color: tokens.colorBrandForeground1,
    display: 'flex',
    alignItems: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: tokens.colorBrandBackground2,
    justifyContent: 'center',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  categoryLabel: {
    flex: 1,
    fontSize: '13px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
  },
  categoryLabelInput: {
    flex: 1,
    minWidth: '80px',
    maxWidth: '120px',
    '& input': {
      borderRadius: '6px',
      fontSize: '13px',
    },
    '& .fui-Input': {
      borderRadius: '6px',
    },
    '& .fui-Input__input': {
      borderRadius: '6px',
    },
  },
  headerButton: {
    minWidth: '24px',
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '6px',
    color: tokens.colorNeutralForeground3,
    transitionProperty: 'background-color, color',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },
  dragHandle: {
    color: tokens.colorNeutralForeground4,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '4px',
    transitionProperty: 'color, background-color',
    transitionDuration: '0.15s',
    ':hover': {
      color: tokens.colorNeutralForeground3,
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  categoryContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryContentCollapsed: {
    display: 'none',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '8px 12px',
    cursor: 'grab',
    transitionProperty: 'background-color, transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease-out',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  cardItemDragging: {
    opacity: 0.5,
    backgroundColor: tokens.colorBrandBackground2,
  },
  cardItemDragOver: {
    backgroundColor: tokens.colorBrandBackground2,
    boxShadow: `inset 0 0 0 1px ${tokens.colorBrandStroke2}`,
  },
  cardDragHandle: {
    color: tokens.colorNeutralForeground4,
    display: 'flex',
    alignItems: 'center',
    cursor: 'grab',
    flexShrink: 0,
    transitionProperty: 'color',
    transitionDuration: '0.15s',
    ':hover': {
      color: tokens.colorNeutralForeground3,
    },
  },
  cardName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: '500',
    color: tokens.colorNeutralForeground1,
  },
  cardNameDisabled: {
    color: tokens.colorNeutralForeground4,
  },
  toggle: {
    flexShrink: 0,
    '& .fui-Switch__indicator': {
      borderRadius: '10px',
    },
    '& .fui-Switch__input': {
      borderRadius: '10px',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '2px',
    flexShrink: 0,
  },
  moveButton: {
    minWidth: '24px',
    width: '24px',
    height: '24px',
    padding: 0,
    borderRadius: '6px',
    color: tokens.colorNeutralForeground3,
    transitionProperty: 'background-color, color',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
    ':disabled': {
      color: tokens.colorNeutralForegroundDisabled,
    },
  },
  divider: {
    margin: 0,
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  emptyCategory: {
    padding: '16px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground4,
    fontSize: '12px',
    fontStyle: 'italic',
  },
  addCategoryButton: {
    marginTop: '10px',
    borderRadius: '8px',
    fontWeight: '500',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: '0.15s',
    ':hover': {
      boxShadow: tokens.shadow4,
    },
  },
});

export const CardOrderEditor: React.FC<ICardOrderEditorProps> = ({
  label,
  cardOrder,
  cardVisibility,
  categoryNames,
  categoryOrder,
  categoryConfig,
  cardCategoryAssignment,
  onOrderChanged,
  onVisibilityChanged,
  onCategoryNameChanged,
  onCategoryOrderChanged,
  onCategoryConfigChanged,
  onCardCategoryChanged,
  onCategoryAdded,
  onCategoryDeleted,
  // Note: waitingOnYouSettings are configured in the CardConfigDialog, not here
}) => {
  const styles = useStyles();

  // Local state
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = React.useState('');
  const [draggedCard, setDraggedCard] = React.useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = React.useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = React.useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = React.useState<string | null>(null);
  const [newCategoryCounter, setNewCategoryCounter] = React.useState(1);

  // Ensure we have valid data - include any missing cards from DEFAULT_CARD_ORDER
  const baseOrder = cardOrder && cardOrder.length > 0 ? cardOrder : DEFAULT_CARD_ORDER;
  const missingCards = DEFAULT_CARD_ORDER.filter(cardId => !baseOrder.includes(cardId));
  const currentOrder = missingCards.length > 0 ? [...baseOrder, ...missingCards] : baseOrder;
  const currentCategoryOrder = categoryOrder && categoryOrder.length > 0 ? categoryOrder : [...DEFAULT_CATEGORY_ORDER];

  // Default category assignments for cards
  const defaultCategoryMap: Record<string, string> = {
    todaysAgenda: 'calendar',
    unreadInbox: 'email',
    myTasks: 'tasks',
    recentFiles: 'files',
    upcomingWeek: 'calendar',
    flaggedEmails: 'email',
    myTeam: 'people',
    sharedWithMe: 'files',
    quickLinks: 'navigation',
    siteActivity: 'people',
    waitingOnYou: 'email',
  };

  // Ensure all cards have category assignments
  const effectiveCategoryAssignment = React.useMemo(() => {
    const result = { ...cardCategoryAssignment };
    DEFAULT_CARD_ORDER.forEach(cardId => {
      if (!result[cardId]) {
        result[cardId] = defaultCategoryMap[cardId] || 'available';
      }
    });
    return result;
  }, [cardCategoryAssignment]);

  // Get cards in a category
  const getCardsInCategory = (categoryId: string): string[] => {
    return currentOrder.filter(cardId => effectiveCategoryAssignment[cardId] === categoryId);
  };

  // Get category config
  const getCategoryConfig = (categoryId: string): ICategoryConfig => {
    return categoryConfig[categoryId] || { id: categoryId, visible: true, showTitle: true };
  };

  // Get category label
  const getCategoryLabel = (categoryId: string): string => {
    return categoryNames[categoryId] || CATEGORIES[categoryId]?.defaultName || categoryId;
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string): React.ReactElement => {
    return categoryIcons[categoryId] || <Grid24Regular />;
  };

  // Toggle category collapsed
  const toggleCollapsed = (categoryId: string): void => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Category name editing
  const handleCategoryEditStart = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingCategory(categoryId);
    setEditingCategoryName(getCategoryLabel(categoryId));
  };

  const handleCategoryEditSave = (): void => {
    if (editingCategory && editingCategoryName.trim()) {
      onCategoryNameChanged(editingCategory, editingCategoryName.trim());
    }
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleCategoryEditSave();
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
      setEditingCategoryName('');
    }
  };

  // Category drag handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string): void => {
    e.stopPropagation();
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `category:${categoryId}`);
  };

  const handleCategoryDragEnd = (): void => {
    setDraggedCategory(null);
    setDragOverCategoryId(null);
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string): void => {
    e.preventDefault();
    if (draggedCategory && draggedCategory !== categoryId) {
      setDragOverCategoryId(categoryId);
    }
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string): void => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');

    if (data.startsWith('category:')) {
      const sourceCategoryId = data.replace('category:', '');
      const sourceIndex = currentCategoryOrder.indexOf(sourceCategoryId);
      const targetIndex = currentCategoryOrder.indexOf(targetCategoryId);

      if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
        const newOrder = [...currentCategoryOrder];
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceCategoryId);
        onCategoryOrderChanged(newOrder);
      }
    } else if (data.startsWith('card:')) {
      // Card dropped on category
      const cardId = data.replace('card:', '');
      onCardCategoryChanged(cardId, targetCategoryId);
    }

    setDraggedCategory(null);
    setDragOverCategoryId(null);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  // Card drag handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string): void => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `card:${cardId}`);
  };

  const handleCardDragEnd = (): void => {
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string): void => {
    e.preventDefault();
    if (draggedCard && draggedCard !== cardId) {
      setDragOverCard(cardId);
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetCardId: string, targetCategoryId: string): void => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData('text/plain');
    if (data.startsWith('card:')) {
      const sourceCardId = data.replace('card:', '');
      const sourceIndex = currentOrder.indexOf(sourceCardId);
      const targetIndex = currentOrder.indexOf(targetCardId);

      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        const newOrder = [...currentOrder];
        newOrder.splice(sourceIndex, 1);
        const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newOrder.splice(adjustedIndex, 0, sourceCardId);
        onOrderChanged(newOrder);

        // Update category assignment if moving to different category
        const sourceCategoryId = effectiveCategoryAssignment[sourceCardId];
        if (sourceCategoryId !== targetCategoryId) {
          onCardCategoryChanged(sourceCardId, targetCategoryId);
        }
      }
    }

    setDraggedCard(null);
    setDragOverCard(null);
  };

  // Move card up/down
  const moveCard = (cardId: string, direction: number): void => {
    const index = currentOrder.indexOf(cardId);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, cardId);
    onOrderChanged(newOrder);
  };

  // Add new category
  const handleAddCategory = (): void => {
    const newId = `custom-${Date.now()}`;
    const name = `New Category ${newCategoryCounter}`;
    setNewCategoryCounter(prev => prev + 1);
    onCategoryAdded(newId, name);
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    if (CATEGORIES[categoryId]?.isSystem) return;
    onCategoryDeleted(categoryId);
  };

  // All categories including 'available' at the end
  const allCategories = [...currentCategoryOrder, 'available'];

  return (
    <div className={styles.container}>
      <Text className={styles.label}>{label}</Text>
      <div className={styles.categoryList}>
        {allCategories.map((categoryId) => {
          const cardsInCategory = getCardsInCategory(categoryId);
          const isCollapsed = collapsedCategories.has(categoryId);
          const catConfig = getCategoryConfig(categoryId);
          const isAvailable = categoryId === 'available';
          const isCustomCategory = !CATEGORIES[categoryId]?.isSystem;
          const isDraggingOver = dragOverCategoryId === categoryId;

          return (
            <div
              key={categoryId}
              className={mergeClasses(
                styles.categorySection,
                isAvailable && styles.availableCategory,
                !catConfig.visible && styles.categorySectionHidden,
                draggedCategory === categoryId && styles.categorySectionDragging,
                isDraggingOver && styles.categorySectionDragOver
              )}
              onDragOver={(e) => handleCategoryDragOver(e, categoryId)}
              onDrop={(e) => handleCategoryDrop(e, categoryId)}
            >
              <div
                className={mergeClasses(
                  styles.categoryHeader,
                  isCollapsed && styles.categoryHeaderCollapsed
                )}
                onClick={() => !editingCategory && toggleCollapsed(categoryId)}
              >
                <span className={styles.collapseIcon}>
                  {isCollapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
                </span>
                <span className={styles.categoryIcon}>
                  {getCategoryIcon(categoryId)}
                </span>

                {editingCategory === categoryId ? (
                  <>
                    <Input
                      className={styles.categoryLabelInput}
                      value={editingCategoryName}
                      onChange={(_, data) => setEditingCategoryName(data.value)}
                      onKeyDown={handleCategoryKeyDown}
                      onBlur={handleCategoryEditSave}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      autoFocus
                    />
                    <Button
                      appearance="subtle"
                      icon={<Checkmark20Regular />}
                      className={styles.headerButton}
                      onClick={(e) => { e.stopPropagation(); handleCategoryEditSave(); }}
                      title="Save"
                      size="small"
                    />
                  </>
                ) : (
                  <>
                    <span className={styles.categoryLabel}>{getCategoryLabel(categoryId)}</span>
                    {!isAvailable && (
                      <>
                        <Button
                          appearance="subtle"
                          icon={<Edit20Regular />}
                          className={styles.headerButton}
                          onClick={(e) => handleCategoryEditStart(categoryId, e)}
                          title="Edit name"
                          size="small"
                        />
                        <Button
                          appearance="subtle"
                          icon={catConfig.showTitle ? <TextT20Regular /> : <TextT20Regular style={{ opacity: 0.4 }} />}
                          className={styles.headerButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryConfigChanged(categoryId, { showTitle: !catConfig.showTitle });
                          }}
                          title={catConfig.showTitle ? "Hide title" : "Show title"}
                          size="small"
                        />
                        <Button
                          appearance="subtle"
                          icon={catConfig.visible ? <Eye20Regular /> : <EyeOff20Regular />}
                          className={styles.headerButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryConfigChanged(categoryId, { visible: !catConfig.visible });
                          }}
                          title={catConfig.visible ? "Hide category" : "Show category"}
                          size="small"
                        />
                        {isCustomCategory && (
                          <Button
                            appearance="subtle"
                            icon={<Delete20Regular />}
                            className={styles.headerButton}
                            onClick={(e) => handleDeleteCategory(categoryId, e)}
                            title="Delete category"
                            size="small"
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {!isAvailable && (
                  <div
                    className={styles.dragHandle}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, categoryId)}
                    onDragEnd={handleCategoryDragEnd}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ReOrderDotsVertical24Regular />
                  </div>
                )}
              </div>

              <div
                className={mergeClasses(
                  styles.categoryContent,
                  isCollapsed && styles.categoryContentCollapsed
                )}
              >
                {cardsInCategory.length === 0 ? (
                  <div className={styles.emptyCategory}>
                    {isAvailable ? 'No available cards' : 'Drag cards here'}
                  </div>
                ) : (
                  <div className={styles.cardList}>
                    {cardsInCategory.map((cardId, idx) => {
                      const isVisible = isAvailable ? false : cardVisibility[cardId] !== false;
                      const isDragging = draggedCard === cardId;
                      const isDragOver = dragOverCard === cardId;

                      return (
                        <React.Fragment key={cardId}>
                          <div
                            className={mergeClasses(
                              styles.cardItem,
                              isDragging && styles.cardItemDragging,
                              isDragOver && styles.cardItemDragOver
                            )}
                            draggable
                            onDragStart={(e) => handleCardDragStart(e, cardId)}
                            onDragEnd={handleCardDragEnd}
                            onDragOver={(e) => handleCardDragOver(e, cardId)}
                            onDrop={(e) => handleCardDrop(e, cardId, categoryId)}
                          >
                            <span className={styles.cardDragHandle}>
                              <ReOrderDotsVertical24Regular />
                            </span>
                            <Text className={mergeClasses(
                              styles.cardName,
                              !isVisible && styles.cardNameDisabled
                            )}>
                              {cardDisplayNames[cardId] || cardId}
                            </Text>
                            {!isAvailable && (
                              <Switch
                                className={styles.toggle}
                                checked={isVisible}
                                onChange={(_, data) => onVisibilityChanged(cardId, data.checked)}
                              />
                            )}
                            <div className={styles.buttonGroup}>
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<ArrowUp24Regular />}
                                className={styles.moveButton}
                                disabled={idx === 0}
                                onClick={() => moveCard(cardId, -1)}
                                title="Move up"
                              />
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<ArrowDown24Regular />}
                                className={styles.moveButton}
                                disabled={idx === cardsInCategory.length - 1}
                                onClick={() => moveCard(cardId, 1)}
                                title="Move down"
                              />
                            </div>
                          </div>
                          {idx < cardsInCategory.length - 1 && <Divider className={styles.divider} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        appearance="secondary"
        icon={<Add20Regular />}
        className={styles.addCategoryButton}
        onClick={handleAddCategory}
        size="small"
      >
        Add Category
      </Button>
    </div>
  );
};

export default CardOrderEditor;
