// ============================================
// PortalContext - React context for portal container
// Provides access to the portal mount node for Fluent UI popovers
// ============================================

import * as React from 'react';
import { getPortalContainer } from '../services/PortalService';

/**
 * Context for the portal container element.
 * Used by Menu/Popover components to render outside SharePoint's stacking contexts.
 */
export const PortalContext = React.createContext<HTMLDivElement | null>(null);

/**
 * Provider component that initializes and provides the portal container.
 */
export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Get or create the portal container on mount
    setContainer(getPortalContainer());
  }, []);

  return (
    <PortalContext.Provider value={container}>
      {children}
    </PortalContext.Provider>
  );
};

/**
 * Hook to access the portal container for Menu/Popover mountNode prop.
 * Returns null until the container is created.
 */
export const usePortalContainer = (): HTMLDivElement | null => React.useContext(PortalContext);
