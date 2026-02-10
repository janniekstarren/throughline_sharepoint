/**
 * iconMapping - Maps emoji strings to Fluent UI v9 icon components
 *
 * InsightAggregator keeps emojis in data; this module converts
 * them to proper Fluent icons at the display layer. Keeps the
 * data layer emoji-based (simpler) while rendering real icons.
 */

import {
  AlertUrgent20Regular,
  Clock20Regular,
  Target20Regular,
  ArrowSync20Regular,
  Calendar20Regular,
  People20Regular,
  Chat20Regular,
  Mail20Regular,
  Flash20Regular,
  ChartMultiple20Regular,
  Shield20Regular,
  Checkmark20Regular,
  Warning20Regular,
  Document20Regular,
  WeatherMoon20Regular,
} from '@fluentui/react-icons';
import { FluentIconsProps } from '@fluentui/react-icons';

// ============================================
// Icon Mapping Table
// ============================================

type FluentIcon = React.FC<FluentIconsProps>;

/**
 * Map of emoji strings to their Fluent icon component equivalents.
 * Falls back to Target20Regular if an emoji is not found.
 */
export const INSIGHT_ICON_MAP: Record<string, FluentIcon> = {
  // Severity / Alert icons
  '\u{1F534}': AlertUrgent20Regular,   // 🔴
  '\u{26A0}\u{FE0F}': Warning20Regular, // ⚠️
  '\u{1F525}': Flash20Regular,          // 🔥
  '\u{26A1}': Flash20Regular,           // ⚡

  // Time / Clock icons
  '\u{23F0}': Clock20Regular,           // ⏰
  '\u{1F319}': WeatherMoon20Regular,    // 🌙
  '\u{1F4C6}': Calendar20Regular,       // 📆

  // Target / Focus icons
  '\u{1F3AF}': Target20Regular,         // 🎯
  '\u{1F9D8}': Shield20Regular,         // 🧘

  // Sync / Refresh
  '\u{1F504}': ArrowSync20Regular,      // 🔄

  // Calendar / Planning
  '\u{1F4C5}': Calendar20Regular,       // 📅
  '\u{1F4CB}': Calendar20Regular,       // 📋

  // People / Collaboration
  '\u{1F976}': People20Regular,         // 🥶
  '\u{1F465}': People20Regular,         // 👥
  '\u{1F4AC}': Chat20Regular,           // 💬

  // Communication
  '\u{1F4E2}': Mail20Regular,           // 📢
  '\u{1F4F5}': Mail20Regular,           // 📵

  // Status / Completion
  '\u{2705}': Checkmark20Regular,       // ✅

  // Charts / Data
  '\u{1F4CA}': ChartMultiple20Regular,  // 📊

  // Documents
  '\u{1F4C4}': Document20Regular,       // 📄

  // Security
  '\u{1F510}': Shield20Regular,         // 🔐

  // Colored circles (severity indicators)
  '\u{1F7E1}': Warning20Regular,        // 🟡
  '\u{1F535}': Target20Regular,         // 🔵
};

// ============================================
// Public API
// ============================================

/**
 * Resolve an emoji string to a Fluent icon component.
 * Falls back to Target20Regular if the emoji is not mapped.
 *
 * @param emoji - The emoji string from insight data
 * @returns A Fluent icon component (React.FC<FluentIconsProps>)
 */
export function resolveInsightIcon(emoji: string): FluentIcon {
  return INSIGHT_ICON_MAP[emoji] || Target20Regular;
}
