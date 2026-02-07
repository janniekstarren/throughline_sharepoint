// ============================================
// PortalService - Manages portal container for Fluent UI popovers
// Creates a fixed container at document.body level to escape SharePoint's stacking contexts
// ============================================

let portalContainer: HTMLDivElement | null = null;

/**
 * Get or create the portal container for Fluent UI popovers.
 * The container is positioned fixed at z-index 99999 to ensure it renders
 * above SharePoint's navigation and chrome (typically z-index 1001-3000).
 *
 * pointer-events: none allows clicks to pass through the container itself,
 * while Fluent UI handles pointer-events on the actual popup content.
 */
export function getPortalContainer(): HTMLDivElement {
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'throughline-fui-portal';
    portalContainer.style.cssText = 'position: fixed; z-index: 99999; top: 0; left: 0; pointer-events: none;';
    document.body.appendChild(portalContainer);
  }
  return portalContainer;
}

/**
 * Clean up the portal container when the webpart is disposed.
 * This prevents memory leaks and orphaned DOM elements.
 */
export function cleanupPortalContainer(): void {
  if (portalContainer && portalContainer.parentNode) {
    portalContainer.parentNode.removeChild(portalContainer);
    portalContainer = null;
  }
}
