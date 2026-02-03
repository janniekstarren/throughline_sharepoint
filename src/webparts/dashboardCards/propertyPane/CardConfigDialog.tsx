import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  Button,
  makeStyles,
  tokens,
  Text,
  Input,
  mergeClasses,
  Divider,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Edit20Regular,
  Checkmark20Regular,
  ChevronDown24Regular,
  ChevronRight24Regular,
  ReOrderDotsVertical24Regular,
  Add24Regular,
  Delete24Regular,
  Eye24Regular,
  EyeOff24Regular,
  TextT24Regular,
  Grid24Regular as GridIcon,
  Search24Regular,
} from '@fluentui/react-icons';
import {
  Calendar24Regular,
  Mail24Regular,
  TaskListSquareLtr24Regular,
  Document24Regular,
  CalendarLtr24Regular,
  Flag24Regular,
  People24Regular,
  Share24Regular,
  Link24Regular,
  History24Regular,
  Grid24Regular,
  // Icons for icon picker
  Home24Regular,
  Star24Regular,
  Heart24Regular,
  Bookmark24Regular,
  Folder24Regular,
  FolderOpen24Regular,
  Archive24Regular,
  Box24Regular,
  Tag24Regular,
  Settings24Regular,
  Lightbulb24Regular,
  Sparkle24Regular,
  Trophy24Regular,
  Ribbon24Regular,
  Target24Regular,
  Rocket24Regular,
  Briefcase24Regular,
  Building24Regular,
  BuildingMultiple24Regular,
  Money24Regular,
  Wallet24Regular,
  Calculator24Regular,
  ChartMultiple24Regular,
  DataTrending24Regular,
  DataBarVertical24Regular,
  Board24Regular,
  ClipboardTask24Regular,
  CheckboxChecked24Regular,
  CheckmarkCircle24Regular,
  ClipboardTextLtr24Regular,
  Notebook24Regular,
  Book24Regular,
  BookOpen24Regular,
  News24Regular,
  Chat24Regular,
  ChatMultiple24Regular,
  Comment24Regular,
  CommentMultiple24Regular,
  Call24Regular,
  Video24Regular,
  Camera24Regular,
  Image24Regular,
  ImageMultiple24Regular,
  MusicNote124Regular,
  Play24Regular,
  Globe24Regular,
  Map24Regular,
  Location24Regular,
  CompassNorthwest24Regular,
  VehicleCar24Regular,
  Airplane24Regular,
  WeatherSunny24Regular,
  Cloud24Regular,
  LeafOne24Regular,
  Food24Regular,
  DrinkCoffee24Regular,
  Gift24Regular,
  ShoppingBag24Regular,
  Cart24Regular,
  Person24Regular,
  PersonCircle24Regular,
  PeopleTeam24Regular,
  PersonAdd24Regular,
  Organization24Regular,
  Shield24Regular,
  LockClosed24Regular,
  Key24Regular,
  Bug24Regular,
  Code24Regular,
  Beaker24Regular,
  PuzzlePiece24Regular,
  Games24Regular,
  Sport24Regular,
  HeartPulse24Regular,
  Stethoscope24Regular,
  Pill24Regular,
  HatGraduation24Regular,
  Wrench24Regular,
  Toolbox24Regular,
  DesignIdeas24Regular,
  PaintBrush24Regular,
  Ruler24Regular,
  Pen24Regular,
  Attach24Regular,
  Send24Regular,
  Save24Regular,
  Print24Regular,
  Clock24Regular,
  Timer24Regular,
  Hourglass24Regular,
  Alert24Regular,
  Info24Regular,
  Question24Regular,
  Flash24Regular,
  Fingerprint24Regular,
} from '@fluentui/react-icons';
import { MiniCard } from './MiniCard';
import { CardSettingsDrawer } from './CardSettingsDrawer';

export interface ICategoryConfig {
  id: string;
  visible: boolean;
  showTitle: boolean;
}

export interface ICardConfig {
  cardOrder: string[];
  cardVisibility: Record<string, boolean>;
  cardTitles: Record<string, string>;
  categoryNames: Record<string, string>;
  categoryOrder: string[];
  categoryConfig: Record<string, ICategoryConfig>;
  cardCategoryAssignment: Record<string, string>;
  categoryIcons?: Record<string, string>;
}

export interface ICardConfigDialogProps {
  open: boolean;
  onClose: () => void;
  cardOrder: string[];
  cardVisibility: Record<string, boolean>;
  cardTitles: Record<string, string>;
  categoryNames: Record<string, string>;
  categoryOrder?: string[];
  categoryConfig?: Record<string, ICategoryConfig>;
  cardCategoryAssignment?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  onSave: (config: ICardConfig) => void;
}

export type CategoryId = 'calendar' | 'email' | 'tasks' | 'files' | 'people' | 'navigation' | 'available' | string;

interface ICategoryDefinition {
  defaultName: string;
  icon: React.ReactElement;
  cards: string[];
  isSystem?: boolean;
}

export const CATEGORIES: Record<string, ICategoryDefinition> = {
  calendar: {
    defaultName: 'Calendar',
    icon: <Calendar24Regular />,
    cards: ['todaysAgenda', 'upcomingWeek'],
    isSystem: true,
  },
  email: {
    defaultName: 'Email',
    icon: <Mail24Regular />,
    cards: ['unreadInbox', 'flaggedEmails'],
    isSystem: true,
  },
  tasks: {
    defaultName: 'Tasks',
    icon: <TaskListSquareLtr24Regular />,
    cards: ['myTasks'],
    isSystem: true,
  },
  files: {
    defaultName: 'Files',
    icon: <Document24Regular />,
    cards: ['recentFiles', 'sharedWithMe'],
    isSystem: true,
  },
  people: {
    defaultName: 'People & Activity',
    icon: <People24Regular />,
    cards: ['myTeam', 'siteActivity'],
    isSystem: true,
  },
  navigation: {
    defaultName: 'Navigation',
    icon: <Link24Regular />,
    cards: ['quickLinks'],
    isSystem: true,
  },
  available: {
    defaultName: 'Available Cards',
    icon: <Grid24Regular />,
    cards: [],
    isSystem: true,
  },
};

export const DEFAULT_CATEGORY_ORDER: string[] = ['calendar', 'email', 'tasks', 'files', 'people', 'navigation'];

// Available icons for custom categories
interface IIconDefinition {
  id: string;
  name: string;
  icon: React.ReactElement;
  category: string;
}

export const AVAILABLE_ICONS: IIconDefinition[] = [
  // General
  { id: 'grid', name: 'Grid', icon: <Grid24Regular />, category: 'General' },
  { id: 'home', name: 'Home', icon: <Home24Regular />, category: 'General' },
  { id: 'star', name: 'Star', icon: <Star24Regular />, category: 'General' },
  { id: 'heart', name: 'Heart', icon: <Heart24Regular />, category: 'General' },
  { id: 'bookmark', name: 'Bookmark', icon: <Bookmark24Regular />, category: 'General' },
  { id: 'tag', name: 'Tag', icon: <Tag24Regular />, category: 'General' },
  { id: 'sparkle', name: 'Sparkle', icon: <Sparkle24Regular />, category: 'General' },
  { id: 'lightbulb', name: 'Lightbulb', icon: <Lightbulb24Regular />, category: 'General' },
  { id: 'trophy', name: 'Trophy', icon: <Trophy24Regular />, category: 'General' },
  { id: 'ribbon', name: 'Ribbon', icon: <Ribbon24Regular />, category: 'General' },
  { id: 'target', name: 'Target', icon: <Target24Regular />, category: 'General' },
  { id: 'rocket', name: 'Rocket', icon: <Rocket24Regular />, category: 'General' },
  { id: 'gift', name: 'Gift', icon: <Gift24Regular />, category: 'General' },
  { id: 'flash', name: 'Flash', icon: <Flash24Regular />, category: 'General' },
  // Files & Folders
  { id: 'folder', name: 'Folder', icon: <Folder24Regular />, category: 'Files' },
  { id: 'folderOpen', name: 'Folder Open', icon: <FolderOpen24Regular />, category: 'Files' },
  { id: 'document', name: 'Document', icon: <Document24Regular />, category: 'Files' },
  { id: 'archive', name: 'Archive', icon: <Archive24Regular />, category: 'Files' },
  { id: 'box', name: 'Box', icon: <Box24Regular />, category: 'Files' },
  { id: 'attach', name: 'Attach', icon: <Attach24Regular />, category: 'Files' },
  { id: 'save', name: 'Save', icon: <Save24Regular />, category: 'Files' },
  { id: 'print', name: 'Print', icon: <Print24Regular />, category: 'Files' },
  // Business
  { id: 'briefcase', name: 'Briefcase', icon: <Briefcase24Regular />, category: 'Business' },
  { id: 'building', name: 'Building', icon: <Building24Regular />, category: 'Business' },
  { id: 'buildingMultiple', name: 'Buildings', icon: <BuildingMultiple24Regular />, category: 'Business' },
  { id: 'money', name: 'Money', icon: <Money24Regular />, category: 'Business' },
  { id: 'wallet', name: 'Wallet', icon: <Wallet24Regular />, category: 'Business' },
  { id: 'calculator', name: 'Calculator', icon: <Calculator24Regular />, category: 'Business' },
  { id: 'chart', name: 'Chart', icon: <ChartMultiple24Regular />, category: 'Business' },
  { id: 'trending', name: 'Trending', icon: <DataTrending24Regular />, category: 'Business' },
  { id: 'barChart', name: 'Bar Chart', icon: <DataBarVertical24Regular />, category: 'Business' },
  { id: 'organization', name: 'Organization', icon: <Organization24Regular />, category: 'Business' },
  // Tasks & Productivity
  { id: 'calendar', name: 'Calendar', icon: <Calendar24Regular />, category: 'Tasks' },
  { id: 'calendarLtr', name: 'Calendar Week', icon: <CalendarLtr24Regular />, category: 'Tasks' },
  { id: 'tasks', name: 'Tasks', icon: <TaskListSquareLtr24Regular />, category: 'Tasks' },
  { id: 'board', name: 'Board', icon: <Board24Regular />, category: 'Tasks' },
  { id: 'clipboardTask', name: 'Clipboard Task', icon: <ClipboardTask24Regular />, category: 'Tasks' },
  { id: 'checkboxChecked', name: 'Checkbox', icon: <CheckboxChecked24Regular />, category: 'Tasks' },
  { id: 'checkmarkCircle', name: 'Checkmark', icon: <CheckmarkCircle24Regular />, category: 'Tasks' },
  { id: 'clipboardList', name: 'Clipboard List', icon: <ClipboardTextLtr24Regular />, category: 'Tasks' },
  { id: 'clock', name: 'Clock', icon: <Clock24Regular />, category: 'Tasks' },
  { id: 'timer', name: 'Timer', icon: <Timer24Regular />, category: 'Tasks' },
  { id: 'hourglass', name: 'Hourglass', icon: <Hourglass24Regular />, category: 'Tasks' },
  // Communication
  { id: 'mail', name: 'Mail', icon: <Mail24Regular />, category: 'Communication' },
  { id: 'flag', name: 'Flag', icon: <Flag24Regular />, category: 'Communication' },
  { id: 'chat', name: 'Chat', icon: <Chat24Regular />, category: 'Communication' },
  { id: 'chatMultiple', name: 'Chat Multiple', icon: <ChatMultiple24Regular />, category: 'Communication' },
  { id: 'comment', name: 'Comment', icon: <Comment24Regular />, category: 'Communication' },
  { id: 'commentMultiple', name: 'Comments', icon: <CommentMultiple24Regular />, category: 'Communication' },
  { id: 'call', name: 'Call', icon: <Call24Regular />, category: 'Communication' },
  { id: 'video', name: 'Video', icon: <Video24Regular />, category: 'Communication' },
  { id: 'send', name: 'Send', icon: <Send24Regular />, category: 'Communication' },
  // People
  { id: 'people', name: 'People', icon: <People24Regular />, category: 'People' },
  { id: 'person', name: 'Person', icon: <Person24Regular />, category: 'People' },
  { id: 'personCircle', name: 'Person Circle', icon: <PersonCircle24Regular />, category: 'People' },
  { id: 'peopleTeam', name: 'Team', icon: <PeopleTeam24Regular />, category: 'People' },
  { id: 'personAdd', name: 'Add Person', icon: <PersonAdd24Regular />, category: 'People' },
  { id: 'share', name: 'Share', icon: <Share24Regular />, category: 'People' },
  // Media
  { id: 'camera', name: 'Camera', icon: <Camera24Regular />, category: 'Media' },
  { id: 'image', name: 'Image', icon: <Image24Regular />, category: 'Media' },
  { id: 'imageMultiple', name: 'Images', icon: <ImageMultiple24Regular />, category: 'Media' },
  { id: 'music', name: 'Music', icon: <MusicNote124Regular />, category: 'Media' },
  { id: 'play', name: 'Play', icon: <Play24Regular />, category: 'Media' },
  // Learning & Reading
  { id: 'notebook', name: 'Notebook', icon: <Notebook24Regular />, category: 'Learning' },
  { id: 'book', name: 'Book', icon: <Book24Regular />, category: 'Learning' },
  { id: 'bookOpen', name: 'Book Open', icon: <BookOpen24Regular />, category: 'Learning' },
  { id: 'news', name: 'News', icon: <News24Regular />, category: 'Learning' },
  { id: 'graduationCap', name: 'Graduation', icon: <HatGraduation24Regular />, category: 'Learning' },
  // Navigation & Location
  { id: 'link', name: 'Link', icon: <Link24Regular />, category: 'Navigation' },
  { id: 'globe', name: 'Globe', icon: <Globe24Regular />, category: 'Navigation' },
  { id: 'map', name: 'Map', icon: <Map24Regular />, category: 'Navigation' },
  { id: 'location', name: 'Location', icon: <Location24Regular />, category: 'Navigation' },
  { id: 'compass', name: 'Compass', icon: <CompassNorthwest24Regular />, category: 'Navigation' },
  { id: 'history', name: 'History', icon: <History24Regular />, category: 'Navigation' },
  // Development & Tools
  { id: 'settings', name: 'Settings', icon: <Settings24Regular />, category: 'Tools' },
  { id: 'wrench', name: 'Wrench', icon: <Wrench24Regular />, category: 'Tools' },
  { id: 'hammer', name: 'Toolbox', icon: <Toolbox24Regular />, category: 'Tools' },
  { id: 'code', name: 'Code', icon: <Code24Regular />, category: 'Tools' },
  { id: 'bug', name: 'Bug', icon: <Bug24Regular />, category: 'Tools' },
  { id: 'beaker', name: 'Beaker', icon: <Beaker24Regular />, category: 'Tools' },
  { id: 'puzzle', name: 'Puzzle', icon: <PuzzlePiece24Regular />, category: 'Tools' },
  // Design
  { id: 'designIdeas', name: 'Design', icon: <DesignIdeas24Regular />, category: 'Design' },
  { id: 'paintBrush', name: 'Paint Brush', icon: <PaintBrush24Regular />, category: 'Design' },
  { id: 'ruler', name: 'Ruler', icon: <Ruler24Regular />, category: 'Design' },
  { id: 'pen', name: 'Pen', icon: <Pen24Regular />, category: 'Design' },
  // Security
  { id: 'shield', name: 'Shield', icon: <Shield24Regular />, category: 'Security' },
  { id: 'lock', name: 'Lock', icon: <LockClosed24Regular />, category: 'Security' },
  { id: 'key', name: 'Key', icon: <Key24Regular />, category: 'Security' },
  { id: 'fingerprint', name: 'Fingerprint', icon: <Fingerprint24Regular />, category: 'Security' },
  // Status
  { id: 'alert', name: 'Alert', icon: <Alert24Regular />, category: 'Status' },
  { id: 'info', name: 'Info', icon: <Info24Regular />, category: 'Status' },
  { id: 'question', name: 'Question', icon: <Question24Regular />, category: 'Status' },
  // Lifestyle
  { id: 'food', name: 'Food', icon: <Food24Regular />, category: 'Lifestyle' },
  { id: 'coffee', name: 'Coffee', icon: <DrinkCoffee24Regular />, category: 'Lifestyle' },
  { id: 'shoppingBag', name: 'Shopping Bag', icon: <ShoppingBag24Regular />, category: 'Lifestyle' },
  { id: 'cart', name: 'Cart', icon: <Cart24Regular />, category: 'Lifestyle' },
  { id: 'games', name: 'Games', icon: <Games24Regular />, category: 'Lifestyle' },
  { id: 'sport', name: 'Sport', icon: <Sport24Regular />, category: 'Lifestyle' },
  // Health
  { id: 'heartPulse', name: 'Health', icon: <HeartPulse24Regular />, category: 'Health' },
  { id: 'stethoscope', name: 'Stethoscope', icon: <Stethoscope24Regular />, category: 'Health' },
  { id: 'pill', name: 'Pill', icon: <Pill24Regular />, category: 'Health' },
  // Travel & Weather
  { id: 'car', name: 'Car', icon: <VehicleCar24Regular />, category: 'Travel' },
  { id: 'airplane', name: 'Airplane', icon: <Airplane24Regular />, category: 'Travel' },
  { id: 'sunny', name: 'Sunny', icon: <WeatherSunny24Regular />, category: 'Travel' },
  { id: 'cloud', name: 'Cloud', icon: <Cloud24Regular />, category: 'Travel' },
  { id: 'leaf', name: 'Leaf', icon: <LeafOne24Regular />, category: 'Travel' },
];

// Helper to get icon by ID
export const getIconById = (iconId: string): React.ReactElement => {
  const iconDef = AVAILABLE_ICONS.find(i => i.id === iconId);
  return iconDef?.icon || <Grid24Regular />;
};

const CARD_DEFINITIONS: Record<string, { icon: React.ReactElement; defaultTitle: string; defaultCategory: string }> = {
  todaysAgenda: { icon: <Calendar24Regular />, defaultTitle: "Today's Agenda", defaultCategory: 'calendar' },
  unreadInbox: { icon: <Mail24Regular />, defaultTitle: 'Unread Inbox', defaultCategory: 'email' },
  myTasks: { icon: <TaskListSquareLtr24Regular />, defaultTitle: 'My Tasks', defaultCategory: 'tasks' },
  recentFiles: { icon: <Document24Regular />, defaultTitle: 'Recent Files', defaultCategory: 'files' },
  upcomingWeek: { icon: <CalendarLtr24Regular />, defaultTitle: 'Upcoming Week', defaultCategory: 'calendar' },
  flaggedEmails: { icon: <Flag24Regular />, defaultTitle: 'Flagged Emails', defaultCategory: 'email' },
  myTeam: { icon: <People24Regular />, defaultTitle: 'My Team', defaultCategory: 'people' },
  sharedWithMe: { icon: <Share24Regular />, defaultTitle: 'Shared With Me', defaultCategory: 'files' },
  quickLinks: { icon: <Link24Regular />, defaultTitle: 'Quick Links', defaultCategory: 'navigation' },
  siteActivity: { icon: <History24Regular />, defaultTitle: 'Site Activity', defaultCategory: 'people' },
};

const ALL_CARD_IDS = Object.keys(CARD_DEFINITIONS);

// Consolidated drag state interface
interface IDragState {
  draggedCard: string | null;
  draggedCategory: string | null;
  dropTarget: { categoryId: string; insertIndex: number } | null;
  categoryDropTarget: string | null; // Target category when dragging a category
}

const INITIAL_DRAG_STATE: IDragState = {
  draggedCard: null,
  draggedCategory: null,
  dropTarget: null,
  categoryDropTarget: null,
};

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '1000px',
    width: '95vw',
    height: '90vh',
    minHeight: '500px',
    padding: 0,
    zIndex: 1000001,
  },
  dialogBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '500px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  toolbarDivider: {
    height: '24px',
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  gridContainer: {
    flex: 1,
    padding: tokens.spacingVerticalL,
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  categorySection: {
    marginBottom: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: 'hidden',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  categorySectionHidden: {
    opacity: 0.6,
  },
  categorySectionDragging: {
    boxShadow: tokens.shadow16,
    opacity: 0.9,
  },
  categorySectionDragOver: {
    border: `2px solid ${tokens.colorBrandStroke1}`,
  },
  categorySectionCategoryDragOver: {
    border: `2px dashed ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  categoryHeaderCollapsed: {
    borderBottom: 'none',
  },
  categoryIcon: {
    color: tokens.colorBrandForeground1,
    display: 'flex',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    flex: 1,
  },
  categoryTitleInput: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    minWidth: '150px',
    maxWidth: '250px',
    flex: 1,
  },
  headerButton: {
    minWidth: '28px',
    height: '28px',
    padding: '4px',
  },
  collapseIcon: {
    color: tokens.colorNeutralForeground3,
    transition: 'transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  dragHandle: {
    color: tokens.colorNeutralForeground4,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    ':hover': {
      color: tokens.colorNeutralForeground2,
    },
  },
  categoryContent: {
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    minHeight: '140px',
    transition: 'background-color 0.15s ease',
  },
  categoryContentDragOver: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  categoryContentCollapsed: {
    display: 'none',
  },
  cardWrapper: {
    position: 'relative',
    transition: 'opacity 0.15s ease',
  },
  cardPlaceholder: {
    width: '140px',
    height: '120px',
    border: `2px dashed ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategory: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase200,
    fontStyle: 'italic',
    minHeight: '100px',
  },
  availableCategory: {
    backgroundColor: tokens.colorNeutralBackground4,
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
  },
  availableCategoryEmpty: {
    opacity: 0.5,
    backgroundColor: tokens.colorNeutralBackground5,
  },
  deletePopover: {
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxWidth: '250px',
  },
  deletePopoverText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
  },
  deletePopoverWarning: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteRedForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  deletePopoverActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
  },
  instructions: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  // Icon picker dialog styles
  iconPickerDialogSurface: {
    maxWidth: '600px',
    width: '90vw',
    height: '70vh',
    minHeight: '400px',
    padding: 0,
    zIndex: 1000002, // Above the main config dialog
  },
  iconPickerDialogBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '400px',
    overflow: 'hidden',
  },
  iconPickerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  iconPickerTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  iconPickerSearchContainer: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  iconPickerSearchInput: {
    width: '100%',
  },
  iconPickerNoResults: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
  iconPickerContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '200px',
  },
  iconPickerCategory: {
    marginBottom: tokens.spacingVerticalL,
  },
  iconPickerCategoryTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalXS,
  },
  iconPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
    gap: tokens.spacingHorizontalS,
  },
  iconPickerButton: {
    width: '56px',
    height: '56px',
    minWidth: '56px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  iconPickerButtonSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    border: `2px solid ${tokens.colorBrandStroke1}`,
  },
  iconPickerButtonIcon: {
    color: tokens.colorNeutralForeground1,
  },
  iconPickerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  categoryIconButton: {
    minWidth: '28px',
    height: '28px',
    padding: '4px',
    color: tokens.colorBrandForeground1,
  },
});

export const CardConfigDialog: React.FC<ICardConfigDialogProps> = ({
  open,
  onClose,
  cardOrder: initialCardOrder,
  cardVisibility: initialCardVisibility,
  cardTitles: initialCardTitles,
  categoryNames: initialCategoryNames,
  categoryOrder: initialCategoryOrder,
  categoryConfig: initialCategoryConfig,
  cardCategoryAssignment: initialCardCategoryAssignment,
  categoryIcons: initialCategoryIcons,
  onSave,
}) => {
  const styles = useStyles();

  // Local state for editing
  const [cardOrder, setCardOrder] = React.useState<string[]>([...initialCardOrder]);
  const [cardVisibility, setCardVisibility] = React.useState<Record<string, boolean>>({ ...initialCardVisibility });
  const [cardTitles, setCardTitles] = React.useState<Record<string, string>>({ ...initialCardTitles });
  const [categoryNames, setCategoryNames] = React.useState<Record<string, string>>({ ...initialCategoryNames });
  const [categoryOrder, setCategoryOrder] = React.useState<string[]>(
    initialCategoryOrder && initialCategoryOrder.length > 0 ? [...initialCategoryOrder] : [...DEFAULT_CATEGORY_ORDER]
  );
  const [categoryConfig, setCategoryConfig] = React.useState<Record<string, ICategoryConfig>>(() => {
    const config: Record<string, ICategoryConfig> = {};
    [...DEFAULT_CATEGORY_ORDER, 'available'].forEach(catId => {
      config[catId] = initialCategoryConfig?.[catId] || { id: catId, visible: true, showTitle: true };
    });
    return config;
  });
  const [cardCategoryAssignment, setCardCategoryAssignment] = React.useState<Record<string, string>>(() => {
    const assignment: Record<string, string> = {};
    ALL_CARD_IDS.forEach(cardId => {
      assignment[cardId] = initialCardCategoryAssignment?.[cardId] || CARD_DEFINITIONS[cardId]?.defaultCategory || 'available';
    });
    return assignment;
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);

  // Category editing state
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = React.useState('');

  // Collapsed categories state
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());

  // Show/hide available cards section
  const [showAvailableCards, setShowAvailableCards] = React.useState(true);

  // Consolidated drag state - single source of truth
  const [dragState, setDragState] = React.useState<IDragState>(INITIAL_DRAG_STATE);

  // New category counter
  const [newCategoryCounter, setNewCategoryCounter] = React.useState(1);

  // Track categories that were altered (name changed or cards moved to/from)
  const [alteredCategories, setAlteredCategories] = React.useState<Set<string>>(new Set());

  // Track which category delete popover is open
  const [deleteCategoryPopoverOpen, setDeleteCategoryPopoverOpen] = React.useState<string | null>(null);

  // Track custom category icons
  const [categoryIcons, setCategoryIcons] = React.useState<Record<string, string>>({ ...(initialCategoryIcons || {}) });

  // Icon picker dialog state
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  const [iconPickerCategory, setIconPickerCategory] = React.useState<string | null>(null);
  const [selectedIconId, setSelectedIconId] = React.useState<string>('grid');
  const [iconSearchQuery, setIconSearchQuery] = React.useState<string>('');

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setCardOrder([...initialCardOrder]);
      setCardVisibility({ ...initialCardVisibility });
      setCardTitles({ ...initialCardTitles });
      setCategoryNames({ ...(initialCategoryNames || {}) });
      setCategoryOrder(
        initialCategoryOrder && initialCategoryOrder.length > 0
          ? [...initialCategoryOrder]
          : [...DEFAULT_CATEGORY_ORDER]
      );

      const config: Record<string, ICategoryConfig> = {};
      [...DEFAULT_CATEGORY_ORDER, 'available'].forEach(catId => {
        config[catId] = initialCategoryConfig?.[catId] || { id: catId, visible: true, showTitle: true };
      });
      setCategoryConfig(config);

      const assignment: Record<string, string> = {};
      ALL_CARD_IDS.forEach(cardId => {
        assignment[cardId] = initialCardCategoryAssignment?.[cardId] || CARD_DEFINITIONS[cardId]?.defaultCategory || 'available';
      });
      setCardCategoryAssignment(assignment);

      setDrawerOpen(false);
      setSelectedCard(null);
      setEditingCategory(null);
      setCollapsedCategories(new Set());
      setShowAvailableCards(true);
      setDragState(INITIAL_DRAG_STATE);
      setAlteredCategories(new Set());
      setCategoryIcons({ ...(initialCategoryIcons || {}) });
      setIconPickerOpen(false);
      setIconPickerCategory(null);
    }
  }, [open, initialCardOrder, initialCardVisibility, initialCardTitles, initialCategoryNames, initialCategoryOrder, initialCategoryConfig, initialCardCategoryAssignment, initialCategoryIcons]);

  // Get cards in a category based on assignment
  const getCardsInCategory = React.useCallback((categoryId: string): string[] => {
    return cardOrder.filter(cardId => cardCategoryAssignment[cardId] === categoryId);
  }, [cardOrder, cardCategoryAssignment]);

  // Auto-hide empty categories (except Available, and only if not altered)
  React.useEffect(() => {
    let hasChanges = false;
    const newConfig = { ...categoryConfig };

    categoryOrder.forEach(categoryId => {
      const cardsInCategory = cardOrder.filter(cardId => cardCategoryAssignment[cardId] === categoryId);
      const isCustomCategory = !CATEGORIES[categoryId]?.isSystem;

      // Only auto-hide custom categories that are empty and unaltered
      if (isCustomCategory && cardsInCategory.length === 0 && !alteredCategories.has(categoryId)) {
        if (newConfig[categoryId]?.visible !== false) {
          newConfig[categoryId] = { ...newConfig[categoryId], id: categoryId, visible: false };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setCategoryConfig(newConfig);
    }
  }, [cardCategoryAssignment, categoryOrder, alteredCategories, cardOrder, categoryConfig]);

  // Card drag handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string): void => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `card:${cardId}`);

    // Set drag image to be centered on cursor
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    e.dataTransfer.setDragImage(target, rect.width / 2, rect.height / 2);

    // Use setTimeout to avoid state update during event
    setTimeout(() => {
      setDragState(prev => ({ ...prev, draggedCard: cardId }));
    }, 0);
  };

  const handleCardDragEnd = (): void => {
    setDragState(INITIAL_DRAG_STATE);
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string): void => {
    e.preventDefault();
    e.stopPropagation();

    // Handle category dragging - track the drop target for visual feedback
    if (dragState.draggedCategory) {
      e.dataTransfer.dropEffect = 'move';
      // Only update if target changed to reduce re-renders
      if (dragState.categoryDropTarget !== categoryId && dragState.draggedCategory !== categoryId) {
        setDragState(prev => ({ ...prev, categoryDropTarget: categoryId }));
      }
      return;
    }

    // Handle card dragging
    if (!dragState.draggedCard) return;

    // Only update if target changed to reduce re-renders
    if (dragState.dropTarget?.categoryId !== categoryId) {
      const cardsInCategory = getCardsInCategory(categoryId);
      setDragState(prev => ({
        ...prev,
        dropTarget: { categoryId, insertIndex: cardsInCategory.length },
      }));
    }
  };

  const handleCardDragOverIndex = (e: React.DragEvent, categoryId: string, index: number): void => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.draggedCard) return;

    // Only update if target changed
    if (dragState.dropTarget?.categoryId !== categoryId || dragState.dropTarget?.insertIndex !== index) {
      setDragState(prev => ({
        ...prev,
        dropTarget: { categoryId, insertIndex: index },
      }));
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetCategoryId: string, targetIndex?: number): void => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData('text/plain');
    if (!data.startsWith('card:')) {
      setDragState(INITIAL_DRAG_STATE);
      return;
    }

    const cardId = data.replace('card:', '');
    const effectiveIndex = targetIndex ?? dragState.dropTarget?.insertIndex ?? 0;
    const sourceCategory = cardCategoryAssignment[cardId];

    // Mark both source and target categories as altered if card moved between categories
    if (sourceCategory !== targetCategoryId) {
      setAlteredCategories(prev => {
        const newSet = new Set(prev);
        newSet.add(sourceCategory);
        newSet.add(targetCategoryId);
        return newSet;
      });
    }

    // Build new order with card removed
    const newOrder = cardOrder.filter(id => id !== cardId);

    // Build new assignment (needed for insertion calculation)
    const newAssignment = { ...cardCategoryAssignment, [cardId]: targetCategoryId };

    // Find cards in target category using NEW assignment (excluding the dragged card)
    const cardsInTargetCategory = newOrder.filter(id => newAssignment[id] === targetCategoryId);

    // Calculate global insertion point
    let globalInsertIndex = newOrder.length;
    if (cardsInTargetCategory.length > 0) {
      if (effectiveIndex < cardsInTargetCategory.length) {
        const cardAtIndex = cardsInTargetCategory[effectiveIndex];
        globalInsertIndex = newOrder.indexOf(cardAtIndex);
      } else {
        const lastCard = cardsInTargetCategory[cardsInTargetCategory.length - 1];
        globalInsertIndex = newOrder.indexOf(lastCard) + 1;
      }
    } else {
      // Empty category - find where to insert based on category order
      const catIndex = categoryOrder.indexOf(targetCategoryId);
      if (catIndex >= 0) {
        // Find the last card of any previous category
        for (let i = catIndex - 1; i >= 0; i--) {
          const prevCatCards = newOrder.filter(id => newAssignment[id] === categoryOrder[i]);
          if (prevCatCards.length > 0) {
            const lastPrevCard = prevCatCards[prevCatCards.length - 1];
            globalInsertIndex = newOrder.indexOf(lastPrevCard) + 1;
            break;
          }
        }
      }
    }

    newOrder.splice(globalInsertIndex, 0, cardId);

    setCardOrder(newOrder);
    setCardCategoryAssignment(newAssignment);
    setDragState(INITIAL_DRAG_STATE);
  };

  // Category drag handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string): void => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `category:${categoryId}`);

    setTimeout(() => {
      setDragState(prev => ({ ...prev, draggedCategory: categoryId }));
    }, 0);
  };

  const handleCategoryDragEnd = (): void => {
    setDragState(INITIAL_DRAG_STATE);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string): void => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData('text/plain');

    // Handle card drop on category
    if (data.startsWith('card:')) {
      handleCardDrop(e, targetCategoryId);
      return;
    }

    // Handle category reorder
    if (data.startsWith('category:')) {
      const sourceCategoryId = data.replace('category:', '');
      const sourceIndex = categoryOrder.indexOf(sourceCategoryId);
      const targetIndex = categoryOrder.indexOf(targetCategoryId);

      if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
        const newOrder = [...categoryOrder];
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceCategoryId);
        setCategoryOrder(newOrder);
      }
    }

    setDragState(INITIAL_DRAG_STATE);
  };

  const handleSettingsClick = (cardId: string): void => {
    setSelectedCard(cardId);
    setDrawerOpen(true);
  };

  const handleVisibilityToggle = (cardId: string): void => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: prev[cardId] === false ? true : false,
    }));
  };

  const handleTitleChange = (cardId: string, title: string): void => {
    setCardTitles(prev => ({
      ...prev,
      [cardId]: title,
    }));
  };

  const handleReset = (cardId: string): void => {
    const defaultTitle = CARD_DEFINITIONS[cardId]?.defaultTitle || cardId;
    setCardTitles(prev => ({
      ...prev,
      [cardId]: defaultTitle,
    }));
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: true,
    }));
  };

  const handleSave = (): void => {
    // Filter out empty, unaltered custom categories
    const filteredCategoryOrder = categoryOrder.filter(categoryId => {
      const isCustomCategory = !CATEGORIES[categoryId]?.isSystem;
      if (!isCustomCategory) return true; // Keep all system categories

      const cardsInCategory = cardOrder.filter(id => cardCategoryAssignment[id] === categoryId);
      const wasAltered = alteredCategories.has(categoryId);

      // Keep if has cards OR was altered (name changed, cards moved to/from)
      return cardsInCategory.length > 0 || wasAltered;
    });

    // Also filter categoryConfig, categoryNames, and categoryIcons for removed categories
    const filteredCategoryConfig: Record<string, ICategoryConfig> = {};
    const filteredCategoryNames: Record<string, string> = {};
    const filteredCategoryIcons: Record<string, string> = {};

    // Include all categories in the filtered order
    filteredCategoryOrder.forEach(categoryId => {
      if (categoryConfig[categoryId]) {
        filteredCategoryConfig[categoryId] = categoryConfig[categoryId];
      }
      if (categoryNames[categoryId]) {
        filteredCategoryNames[categoryId] = categoryNames[categoryId];
      }
      if (categoryIcons[categoryId]) {
        filteredCategoryIcons[categoryId] = categoryIcons[categoryId];
      }
    });

    // Also include system categories in config and icons (they might not be in filteredCategoryOrder)
    ['calendar', 'email', 'tasks', 'files', 'people', 'navigation', 'available'].forEach(sysId => {
      if (categoryConfig[sysId]) {
        filteredCategoryConfig[sysId] = categoryConfig[sysId];
      }
      if (categoryIcons[sysId]) {
        filteredCategoryIcons[sysId] = categoryIcons[sysId];
      }
    });

    onSave({
      cardOrder,
      cardVisibility,
      cardTitles,
      categoryNames: filteredCategoryNames,
      categoryOrder: filteredCategoryOrder,
      categoryConfig: filteredCategoryConfig,
      cardCategoryAssignment,
      categoryIcons: filteredCategoryIcons,
    });
    onClose();
  };

  const handleCancel = (): void => {
    onClose();
  };

  const getCardTitle = (cardId: string): string => {
    return cardTitles[cardId] || CARD_DEFINITIONS[cardId]?.defaultTitle || cardId;
  };

  const getCardIcon = (cardId: string): React.ReactElement => {
    return CARD_DEFINITIONS[cardId]?.icon || <Document24Regular />;
  };

  const getCategoryName = (categoryId: string): string => {
    return categoryNames[categoryId] || CATEGORIES[categoryId]?.defaultName || categoryId;
  };

  const getCategoryIcon = (categoryId: string): React.ReactElement => {
    // Check for custom icon first
    if (categoryIcons[categoryId]) {
      return getIconById(categoryIcons[categoryId]);
    }
    return CATEGORIES[categoryId]?.icon || <Grid24Regular />;
  };

  // Open icon picker for a category
  const openIconPicker = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setIconPickerCategory(categoryId);
    setSelectedIconId(categoryIcons[categoryId] || 'grid');
    setIconPickerOpen(true);
  };

  // Save selected icon for category
  const handleIconSelect = (): void => {
    if (iconPickerCategory && selectedIconId) {
      setCategoryIcons(prev => ({
        ...prev,
        [iconPickerCategory]: selectedIconId,
      }));
      // Mark category as altered
      setAlteredCategories(prev => new Set(prev).add(iconPickerCategory));
    }
    setIconPickerOpen(false);
    setIconPickerCategory(null);
    setIconSearchQuery('');
  };

  // Close icon picker without saving
  const closeIconPicker = (): void => {
    setIconPickerOpen(false);
    setIconPickerCategory(null);
    setIconSearchQuery('');
  };

  const handleCategoryEditStart = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingCategory(categoryId);
    setEditingCategoryName(getCategoryName(categoryId));
  };

  const handleCategoryEditSave = (): void => {
    if (editingCategory) {
      setCategoryNames(prev => ({
        ...prev,
        [editingCategory]: editingCategoryName,
      }));
      // Mark category as altered (name changed)
      setAlteredCategories(prev => new Set(prev).add(editingCategory));
      setEditingCategory(null);
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleCategoryEditSave();
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
    }
  };

  const toggleCategoryCollapsed = (categoryId: string): void => {
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

  const toggleCategoryVisibility = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setCategoryConfig(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        visible: !prev[categoryId]?.visible,
      },
    }));
  };

  const toggleCategoryTitleVisibility = (categoryId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setCategoryConfig(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        showTitle: !prev[categoryId]?.showTitle,
      },
    }));
  };

  const addNewCategory = (): void => {
    const newId = `custom-${newCategoryCounter}`;
    setNewCategoryCounter(prev => prev + 1);
    // Insert new category at TOP of the list
    setCategoryOrder(prev => [newId, ...prev]);
    setCategoryNames(prev => ({
      ...prev,
      [newId]: `New Category ${newCategoryCounter}`,
    }));
    setCategoryConfig(prev => ({
      ...prev,
      [newId]: { id: newId, visible: true, showTitle: true },
    }));
    if (!CATEGORIES[newId]) {
      CATEGORIES[newId] = {
        defaultName: `New Category ${newCategoryCounter}`,
        icon: <Grid24Regular />,
        cards: [],
        isSystem: false,
      };
    }
  };

  // Move a card to Available Cards (remove from its current category)
  const moveCardToAvailable = (cardId: string): void => {
    const sourceCategory = cardCategoryAssignment[cardId];
    if (sourceCategory === 'available') return; // Already in available

    // Mark source category as altered
    setAlteredCategories(prev => {
      const newSet = new Set(prev);
      newSet.add(sourceCategory);
      return newSet;
    });

    setCardCategoryAssignment(prev => ({
      ...prev,
      [cardId]: 'available',
    }));
  };

  const confirmDeleteCategory = (categoryId: string): void => {
    if (CATEGORIES[categoryId]?.isSystem) return;

    const cardsInCategory = getCardsInCategory(categoryId);
    setCardCategoryAssignment(prev => {
      const newAssignment = { ...prev };
      cardsInCategory.forEach(cardId => {
        newAssignment[cardId] = 'available';
      });
      return newAssignment;
    });

    setCategoryOrder(prev => prev.filter(id => id !== categoryId));
    setCategoryConfig(prev => {
      const newConfig = { ...prev };
      delete newConfig[categoryId];
      return newConfig;
    });
    setCategoryNames(prev => {
      const newNames = { ...prev };
      delete newNames[categoryId];
      return newNames;
    });

    setDeleteCategoryPopoverOpen(null);
  };

  const selectedCardDef = selectedCard ? CARD_DEFINITIONS[selectedCard] : null;

  // Calculate available cards count
  const availableCardsCount = getCardsInCategory('available').length;
  const hasAvailableCards = availableCardsCount > 0;

  // Render category order - conditionally include 'available'
  const allCategories = showAvailableCards ? [...categoryOrder, 'available'] : categoryOrder;

  return (
    <>
    <Dialog open={open} modalType="modal" onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody className={styles.dialogBody}>
          <div className={styles.header}>
            <Text className={styles.title}>Configure Dashboard Cards</Text>
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onClose}
              title="Close"
            />
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <Button
              appearance="secondary"
              icon={<Add24Regular />}
              onClick={addNewCategory}
            >
              Add Category
            </Button>

            <Divider vertical className={styles.toolbarDivider} />

            <Tooltip
              content={
                !hasAvailableCards
                  ? "No cards in Available Cards - all cards are assigned to categories"
                  : showAvailableCards
                    ? "Hide Available Cards section"
                    : "Show Available Cards section"
              }
              relationship="label"
            >
              <Button
                appearance="subtle"
                icon={showAvailableCards ? <GridIcon /> : <EyeOff24Regular />}
                onClick={() => setShowAvailableCards(!showAvailableCards)}
                disabled={!hasAvailableCards && !showAvailableCards}
                style={{ opacity: !hasAvailableCards ? 0.5 : 1 }}
              >
                Available Cards ({availableCardsCount})
              </Button>
            </Tooltip>
          </div>

          <div className={styles.content}>
            <div className={styles.gridContainer}>
              {allCategories.map((categoryId) => {
                const cardsInCategory = getCardsInCategory(categoryId);
                const isCollapsed = collapsedCategories.has(categoryId);
                const isAvailable = categoryId === 'available';
                const isEmptyAvailable = isAvailable && cardsInCategory.length === 0;
                const catConfig = categoryConfig[categoryId] || { id: categoryId, visible: true, showTitle: true };
                const isCustomCategory = !CATEGORIES[categoryId]?.isSystem;
                const isDragTarget = dragState.dropTarget?.categoryId === categoryId && dragState.draggedCard !== null;
                const isCategoryDragging = dragState.draggedCategory === categoryId;
                const isCategoryDragTarget = dragState.categoryDropTarget === categoryId && dragState.draggedCategory !== null;

                return (
                  <div
                    key={categoryId}
                    className={mergeClasses(
                      styles.categorySection,
                      isAvailable && styles.availableCategory,
                      isEmptyAvailable && styles.availableCategoryEmpty,
                      !catConfig.visible && styles.categorySectionHidden,
                      isCategoryDragging && styles.categorySectionDragging,
                      isDragTarget && styles.categorySectionDragOver,
                      isCategoryDragTarget && styles.categorySectionCategoryDragOver
                    )}
                    onDragOver={(e) => handleCategoryDragOver(e, categoryId)}
                    onDrop={(e) => handleCategoryDrop(e, categoryId)}
                  >
                    <div
                      className={`${styles.categoryHeader} ${isCollapsed ? styles.categoryHeaderCollapsed : ''}`}
                      onClick={() => !editingCategory && toggleCategoryCollapsed(categoryId)}
                    >
                      <span className={styles.collapseIcon}>
                        {isCollapsed ? <ChevronRight24Regular /> : <ChevronDown24Regular />}
                      </span>
                      {!isAvailable ? (
                        <Tooltip content="Change icon" relationship="label">
                          <Button
                            appearance="subtle"
                            className={styles.categoryIconButton}
                            icon={getCategoryIcon(categoryId)}
                            onClick={(e) => openIconPicker(categoryId, e)}
                            title="Change category icon"
                          />
                        </Tooltip>
                      ) : (
                        <span className={styles.categoryIcon}>
                          {getCategoryIcon(categoryId)}
                        </span>
                      )}
                      {editingCategory === categoryId ? (
                        <>
                          <Input
                            className={styles.categoryTitleInput}
                            value={editingCategoryName}
                            onChange={(_, data) => setEditingCategoryName(data.value)}
                            onKeyDown={handleCategoryKeyDown}
                            onBlur={handleCategoryEditSave}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <Button
                            appearance="subtle"
                            icon={<Checkmark20Regular />}
                            className={styles.headerButton}
                            onClick={(e) => { e.stopPropagation(); handleCategoryEditSave(); }}
                            title="Save"
                          />
                        </>
                      ) : (
                        <>
                          <Text className={styles.categoryTitle}>{getCategoryName(categoryId)}</Text>
                          {!isAvailable && (
                            <>
                              <Button
                                appearance="subtle"
                                icon={<Edit20Regular />}
                                className={styles.headerButton}
                                onClick={(e) => handleCategoryEditStart(categoryId, e)}
                                title="Edit category name"
                              />
                              <Button
                                appearance="subtle"
                                icon={catConfig.showTitle ? <TextT24Regular /> : <TextT24Regular style={{ opacity: 0.4 }} />}
                                className={styles.headerButton}
                                onClick={(e) => toggleCategoryTitleVisibility(categoryId, e)}
                                title={catConfig.showTitle ? "Hide category title" : "Show category title"}
                              />
                              <Button
                                appearance="subtle"
                                icon={catConfig.visible ? <Eye24Regular /> : <EyeOff24Regular />}
                                className={styles.headerButton}
                                onClick={(e) => toggleCategoryVisibility(categoryId, e)}
                                title={catConfig.visible ? "Hide category" : "Show category"}
                              />
                              {isCustomCategory && (
                                <Popover
                                  open={deleteCategoryPopoverOpen === categoryId}
                                  onOpenChange={(_, data) => {
                                    if (!data.open) {
                                      setDeleteCategoryPopoverOpen(null);
                                    }
                                  }}
                                  positioning="below"
                                >
                                  <PopoverTrigger disableButtonEnhancement>
                                    <Button
                                      appearance="subtle"
                                      icon={<Delete24Regular />}
                                      className={styles.headerButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteCategoryPopoverOpen(categoryId);
                                      }}
                                      title="Delete category"
                                    />
                                  </PopoverTrigger>
                                  <PopoverSurface onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.deletePopover}>
                                      <Text className={styles.deletePopoverWarning}>
                                        Delete this category?
                                      </Text>
                                      <Text className={styles.deletePopoverText}>
                                        Cards in this category will be moved to Available Cards.
                                      </Text>
                                      <div className={styles.deletePopoverActions}>
                                        <Button
                                          appearance="secondary"
                                          size="small"
                                          onClick={() => setDeleteCategoryPopoverOpen(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          appearance="primary"
                                          size="small"
                                          onClick={() => confirmDeleteCategory(categoryId)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </PopoverSurface>
                                </Popover>
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
                        isCollapsed && styles.categoryContentCollapsed,
                        isDragTarget && styles.categoryContentDragOver
                      )}
                    >
                      {cardsInCategory.length === 0 && !isDragTarget && (
                        <div className={styles.emptyCategory}>
                          {isAvailable ? 'No available cards' : 'Drag cards here'}
                        </div>
                      )}
                      {isDragTarget && cardsInCategory.length === 0 && (
                        <div className={styles.cardPlaceholder}>
                          <Text>Drop here</Text>
                        </div>
                      )}
                      {cardsInCategory.map((cardId, index) => {
                        const isDragging = dragState.draggedCard === cardId;
                        const isDropTargetBefore = isDragTarget &&
                          dragState.dropTarget?.insertIndex === index &&
                          dragState.draggedCard !== cardId;

                        return (
                          <React.Fragment key={cardId}>
                            {isDropTargetBefore && (
                              <div className={styles.cardPlaceholder} />
                            )}
                            <div
                              className={styles.cardWrapper}
                              draggable
                              onDragStart={(e) => handleCardDragStart(e, cardId)}
                              onDragEnd={handleCardDragEnd}
                              onDragOver={(e) => handleCardDragOverIndex(e, categoryId, index)}
                              onDrop={(e) => handleCardDrop(e, categoryId, index)}
                              style={{ opacity: isDragging ? 0.4 : 1 }}
                            >
                              <MiniCard
                                cardId={cardId}
                                title={getCardTitle(cardId)}
                                icon={getCardIcon(cardId)}
                                visible={isAvailable ? false : cardVisibility[cardId] !== false}
                                onSettingsClick={() => handleSettingsClick(cardId)}
                                onVisibilityToggle={() => !isAvailable && handleVisibilityToggle(cardId)}
                                onDelete={() => moveCardToAvailable(cardId)}
                                showDelete={!isAvailable}
                                isDragging={isDragging}
                              />
                            </div>
                          </React.Fragment>
                        );
                      })}
                      {isDragTarget && cardsInCategory.length > 0 && dragState.dropTarget?.insertIndex === cardsInCategory.length && (
                        <div className={styles.cardPlaceholder}>
                          <Text>Drop here</Text>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCard && selectedCardDef && (
              <CardSettingsDrawer
                open={drawerOpen}
                cardId={selectedCard}
                title={getCardTitle(selectedCard)}
                defaultTitle={selectedCardDef.defaultTitle}
                visible={cardVisibility[selectedCard] !== false}
                icon={selectedCardDef.icon}
                onClose={() => setDrawerOpen(false)}
                onTitleChange={(title) => handleTitleChange(selectedCard, title)}
                onVisibilityChange={(visible) => setCardVisibility(prev => ({ ...prev, [selectedCard]: visible }))}
                onReset={() => handleReset(selectedCard)}
              />
            )}
          </div>

          <div className={styles.instructions}>
            Drag cards to reorder or move between categories. Drag the ⋮⋮ handle to reorder categories. Cards in Available Cards category will not display on the dashboard.
          </div>

          <div className={styles.footer}>
            <Button appearance="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>

    {/* Icon Picker Dialog - wrapped in FluentProvider for portal theming */}
    <FluentProvider theme={webLightTheme}>
      <Dialog open={iconPickerOpen} modalType="modal" onOpenChange={(_, data) => !data.open && closeIconPicker()}>
        <DialogSurface className={styles.iconPickerDialogSurface}>
          <DialogBody className={styles.iconPickerDialogBody}>
            <div className={styles.iconPickerHeader}>
              <Text className={styles.iconPickerTitle}>Choose an Icon</Text>
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={closeIconPicker}
                title="Close"
              />
            </div>

            {/* Search Input */}
            <div className={styles.iconPickerSearchContainer}>
              <Input
                className={styles.iconPickerSearchInput}
                placeholder="Search icons..."
                value={iconSearchQuery}
                onChange={(_, data) => setIconSearchQuery(data.value)}
                contentBefore={<Search24Regular />}
              />
            </div>

            <div className={styles.iconPickerContent}>
              {/* Filter icons based on search query */}
              {(() => {
                const query = iconSearchQuery.toLowerCase().trim();
                const filteredIcons = query
                  ? AVAILABLE_ICONS.filter(i =>
                      i.name.toLowerCase().includes(query) ||
                      i.category.toLowerCase().includes(query) ||
                      i.id.toLowerCase().includes(query)
                    )
                  : AVAILABLE_ICONS;

                if (filteredIcons.length === 0) {
                  return (
                    <div className={styles.iconPickerNoResults}>
                      <Text>No icons found matching &quot;{iconSearchQuery}&quot;</Text>
                    </div>
                  );
                }

                // Group filtered icons by category
                const categories = Array.from(new Set(filteredIcons.map(i => i.category)));

                return categories.map(category => (
                  <div key={category} className={styles.iconPickerCategory}>
                    <Text className={styles.iconPickerCategoryTitle}>{category}</Text>
                    <div className={styles.iconPickerGrid}>
                      {filteredIcons.filter(i => i.category === category).map(iconDef => (
                        <Tooltip key={iconDef.id} content={iconDef.name} relationship="label">
                          <button
                            className={mergeClasses(
                              styles.iconPickerButton,
                              selectedIconId === iconDef.id && styles.iconPickerButtonSelected
                            )}
                            onClick={() => setSelectedIconId(iconDef.id)}
                            title={iconDef.name}
                          >
                            <span className={styles.iconPickerButtonIcon}>
                              {iconDef.icon}
                            </span>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className={styles.iconPickerFooter}>
              <Button appearance="secondary" onClick={closeIconPicker}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleIconSelect}>
                Select Icon
              </Button>
            </div>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </FluentProvider>
    </>
  );
};

export default CardConfigDialog;
