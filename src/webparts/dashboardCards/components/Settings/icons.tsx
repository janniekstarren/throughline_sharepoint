// ============================================
// Pure SVG Icons for Settings Panel
// ============================================
// These icons are used instead of @fluentui/react-icons to avoid
// React context conflicts (Error #310) in SharePoint.
// The Fluent icons use internal context hooks that conflict with
// SharePoint's React instance when mounted conditionally.

import * as React from 'react';

interface IIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Settings/Gear icon (24x24)
 * Based on Fluent UI Settings24Regular
 */
export const SettingsIcon: React.FC<IIconProps> = ({ className, style }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M12.012 2.25c.734.008 1.465.093 2.182.253a.75.75 0 0 1 .582.649l.17 1.527a1.384 1.384 0 0 0 1.927 1.116l1.401-.615a.75.75 0 0 1 .85.174 9.792 9.792 0 0 1 2.204 3.792.75.75 0 0 1-.271.825l-1.242.916a1.381 1.381 0 0 0 0 2.226l1.243.915a.75.75 0 0 1 .272.826 9.797 9.797 0 0 1-2.204 3.792.75.75 0 0 1-.848.175l-1.407-.617a1.38 1.38 0 0 0-1.926 1.114l-.169 1.526a.75.75 0 0 1-.572.647 9.518 9.518 0 0 1-4.406 0 .75.75 0 0 1-.572-.647l-.168-1.524a1.382 1.382 0 0 0-1.926-1.11l-1.406.616a.75.75 0 0 1-.849-.175 9.798 9.798 0 0 1-2.204-3.796.75.75 0 0 1 .272-.826l1.243-.916a1.38 1.38 0 0 0 0-2.226l-1.243-.914a.75.75 0 0 1-.271-.826 9.793 9.793 0 0 1 2.204-3.792.75.75 0 0 1 .85-.174l1.4.615a1.387 1.387 0 0 0 1.93-1.118l.17-1.526a.75.75 0 0 1 .583-.65c.717-.159 1.45-.243 2.201-.252ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

/**
 * Dismiss/Close icon (24x24)
 * Based on Fluent UI Dismiss24Regular
 */
export const DismissIcon: React.FC<IIconProps> = ({ className, style }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="m4.21 4.387.083-.094a1 1 0 0 1 1.32-.083l.094.083L12 10.585l6.293-6.292a1 1 0 1 1 1.414 1.414L13.415 12l6.292 6.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083L12 13.415l-6.293 6.292a1 1 0 0 1-1.414-1.414L10.585 12 4.293 5.707a1 1 0 0 1-.083-1.32l.083-.094-.083.094Z" />
  </svg>
);

/**
 * ChevronDown icon (16x16)
 * Based on Fluent UI ChevronDown16Regular
 */
export const ChevronDownIcon: React.FC<IIconProps> = ({ className, style }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M3.146 5.146a.5.5 0 0 1 .708 0L8 9.293l4.146-4.147a.5.5 0 0 1 .708.708l-4.5 4.5a.5.5 0 0 1-.708 0l-4.5-4.5a.5.5 0 0 1 0-.708Z" />
  </svg>
);

/**
 * ChevronRight icon (16x16)
 * Based on Fluent UI ChevronRight16Regular
 */
export const ChevronRightIcon: React.FC<IIconProps> = ({ className, style }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <path d="M5.146 3.146a.5.5 0 0 1 .708 0l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L9.293 8 5.146 3.854a.5.5 0 0 1 0-.708Z" />
  </svg>
);

export default {
  SettingsIcon,
  DismissIcon,
  ChevronDownIcon,
  ChevronRightIcon,
};
