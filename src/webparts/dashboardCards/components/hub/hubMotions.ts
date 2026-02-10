/**
 * hubMotions.ts - Centralized animation definitions for the Intelligence Hub
 *
 * All motion components for the Hub are defined here and imported by name
 * in individual components. Uses @fluentui/react-motion createPresenceComponent.
 */

import { createPresenceComponent, motionTokens } from '@fluentui/react-motion';

// ============================================
// Greeting Motions
// ============================================

/** Greeting text fade-in + slight slide up */
export const GreetingEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-4px)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Sub-line text fade-in, slightly delayed */
export const SublineEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// Query Box Motions
// ============================================

/** Query box entrance with scale + fade */
export const QueryBoxEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.98)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Suggestion chip entrance - staggered fade-in */
export const SuggestionChipEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(4px) scale(0.95)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// Insights Motions
// ============================================

/** Insights panel entrance */
export const InsightsEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateX(16px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(8px)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Individual insight card presence */
export const InsightCardPresence = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Insights summary bar count-up */
export const SummaryBarEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'scaleX(0.3)' },
      { opacity: 1, transform: 'scaleX(1)' },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// Results Motions
// ============================================

/** Results container entrance */
export const ResultsPresence = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-8px)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Individual result card presence */
export const ResultCardPresence = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Source card reference entrance */
export const SourceCardEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.9)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Follow-up chip entrance */
export const FollowUpEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(4px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// Thinking Animation Motions
// ============================================

/** Thinking shimmer loop */
export const ThinkingShimmer = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0.4 },
      { opacity: 1 },
      { opacity: 0.4 },
    ],
    duration: motionTokens.durationUltraSlow,
    iterations: Infinity,
    easing: motionTokens.curveEasyEase,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Thinking brain pulse */
export const ThinkingPulse = createPresenceComponent({
  enter: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.15)' },
      { transform: 'scale(1)' },
    ],
    duration: 1000,
    iterations: Infinity,
    easing: motionTokens.curveEasyEase,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Staggered source name appearance */
export const ThinkingSourceName = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateX(-8px)' },
      { opacity: 0.7, transform: 'translateX(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 0.7 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFaster,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// Hub Container Motions
// ============================================

/** Hub content area entrance */
export const HubContentEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

// ============================================
// New Phase 3 Motions — Metric Tiles & Insights Grid
// ============================================

/** Metric tile staggered entrance (fade + slight scale) */
export const MetricTileEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px) scale(0.96)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.96)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Insights grid expand/collapse animation */
export const InsightsGridExpand = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, maxHeight: '0px' },
      { opacity: 1, maxHeight: '2000px' },
    ],
    duration: motionTokens.durationSlow,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, maxHeight: '2000px' },
      { opacity: 0, maxHeight: '0px' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveAccelerateMax,
  },
});

/** Floating AI Chat dialog entrance */
export const FloatingChatEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(16px) scale(0.95)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMax,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMax,
  },
});
