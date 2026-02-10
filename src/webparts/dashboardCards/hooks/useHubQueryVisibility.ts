/**
 * useHubQueryVisibility - IntersectionObserver hook for floating AI icon visibility
 *
 * Watches a queryBoxRef element. When the query box scrolls out of view,
 * isQueryBoxVisible becomes false → the floating AI icon should appear.
 */

import * as React from 'react';

export interface IUseHubQueryVisibilityResult {
  /** Ref to attach to the query box container element */
  queryBoxRef: React.RefObject<HTMLDivElement>;
  /** Whether the query box is currently visible in the viewport */
  isQueryBoxVisible: boolean;
}

export function useHubQueryVisibility(): IUseHubQueryVisibilityResult {
  const queryBoxRef = React.useRef<HTMLDivElement>(null);
  const [isQueryBoxVisible, setIsQueryBoxVisible] = React.useState(true);

  React.useEffect(() => {
    const element = queryBoxRef.current;
    if (!element) {
      // If no element to observe, assume not visible (show trigger)
      setIsQueryBoxVisible(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Entry isIntersecting === true means it's visible
        const entry = entries[0];
        if (entry) {
          setIsQueryBoxVisible(entry.isIntersecting);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible/hidden
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    queryBoxRef,
    isQueryBoxVisible,
  };
}
