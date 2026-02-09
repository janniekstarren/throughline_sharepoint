# Grid Architecture Audit Report

**Date:** 2026-02-07
**Branch:** `feature/grid-category-overhaul`
**Restore Point:** `restore/pre-grid-overhaul-20260207`

---

## Executive Summary

The current grid system is **functional but has significant limitations** that prevent it from meeting the requirements of a Pinterest-style masonry layout with live reflow animations. The system uses:

- **react-masonry-css** for medium cards only
- **react-beautiful-dnd** for drag-and-drop (deprecated library)
- Three separate layout strategies for small/medium/large cards
- User preferences stored in localStorage per-user
- Admin config stored in SharePoint webpart properties

**Key Issues:**
1. No true masonry with multi-size cards in same grid
2. Drag-drop only works for medium cards
3. No animated reflow when card sizes change
4. react-beautiful-dnd is deprecated/unmaintained
5. Layout flickers when switching between masonry/grid during drag

---

## 1. File Inventory

### Core Layout Files

| File | Purpose | Status | Action |
|------|---------|--------|--------|
| `components/DashboardCards.tsx` | Main orchestrator, DragDropContext | FUNCTIONAL | MODIFY - new grid integration |
| `components/CategorySection.tsx` | Layout engine, size separation | FUNCTIONAL | REWRITE - new masonry |
| `components/CategorySection.module.scss` | Grid/masonry/flex styles | FUNCTIONAL | REWRITE - new positioning |
| `components/shared/SmallCard.tsx` | Square chip cards | FUNCTIONAL | KEEP |
| `components/cardStyles.ts` | Card container styles | FUNCTIONAL | MODIFY |

### Configuration Files

| File | Purpose | Status | Action |
|------|---------|--------|--------|
| `types/CardSize.ts` | Size enum (small/medium/large) | FUNCTIONAL | MODIFY - add columnSpan |
| `services/UserPreferencesService.ts` | localStorage persistence | FUNCTIONAL | KEEP |
| `hooks/useUserPreferences.ts` | User pref React hook | FUNCTIONAL | MODIFY - add category support |
| `propertyPane/CardConfigDialog.tsx` | Admin config dialog | FUNCTIONAL | MODIFY - new category model |
| `propertyPane/CardOrderEditor.tsx` | Card ordering UI | FUNCTIONAL | REPLACE - CategoryManager |
| `DashboardCardsWebPart.ts` | Property pane config | FUNCTIONAL | MODIFY |

### Drag-Drop Files

| File | Purpose | Status | Action |
|------|---------|--------|--------|
| `DashboardCards.tsx` (handleDragEnd) | Drag handlers | PARTIAL | REWRITE - @dnd-kit |
| `CategorySection.tsx` (Draggable) | Drag components | PARTIAL | REWRITE - @dnd-kit |

---

## 2. Current Architecture

### Layout Strategy by Card Size

```
DashboardCards.tsx
└── CategorySection.tsx (per category)
    ├── smallCards → CSS Grid (4/3/2/1 columns, aspect-ratio: 1/1)
    ├── mediumCards → react-masonry-css OR CSS Grid (during drag)
    └── largeCards → CSS Grid (2/1 columns)
```

**Problem:** Cards are separated by size BEFORE rendering. A true masonry layout should pack ALL cards (small + large) in the same grid with no blank spaces.

### Responsive Breakpoints

| Breakpoint | Small | Medium | Large |
|------------|-------|--------|-------|
| > 1400px | 4 cols | 4 cols | 2 cols |
| 1024-1400px | 3 cols | 3 cols | 2 cols |
| 768-1024px | 2 cols | 2 cols | 2 cols |
| < 768px | 1 col | 1 col | 1 col |

### Current Drag-Drop

```typescript
// Library: react-beautiful-dnd (DEPRECATED)
// Only medium cards are draggable
// Layout switches during drag (flicker)
// No cross-category drag support
```

---

## 3. Configuration Hierarchy

### Admin Level (SharePoint WebPart Properties)

```typescript
// Stored in this.properties
cardOrder: string[]
cardVisibility: Record<string, boolean>
categoryOrder: string[]
categoryConfig: Record<string, ICategoryConfig>
cardCategoryAssignment: Record<string, string>
categoryNames: Record<string, string>
categoryIcons: Record<string, string>
```

### User Level (localStorage)

```typescript
// Key: throughline_dashboard_prefs_{userId}_{instanceId}
interface IUserPreferences {
  cardOrder?: string[];
  collapsedCardIds?: string[];
  cardSizes?: ICardSizeState;  // {cardId: 'small'|'medium'|'large'}
  lastUpdated?: string;
}
```

### Resolution Order

1. User localStorage (if exists)
2. Admin WebPart properties (default for new users)

**Missing:** Version-based merge when admin changes defaults

---

## 4. What Works

- ✅ Three card sizes render correctly
- ✅ User preferences persist in localStorage
- ✅ Admin can configure categories via property pane
- ✅ Masonry layout for medium cards (with react-masonry-css)
- ✅ Responsive column changes
- ✅ Small cards render as square chips
- ✅ Large cards render in 2-column grid

---

## 5. What's Broken / Missing

| Issue | Impact | Fix Required |
|-------|--------|--------------|
| No multi-size masonry | Small + large cards can't pack together | New MasonryLayoutEngine |
| Drag-drop medium only | Users can't reorder small/large cards | @dnd-kit for all sizes |
| No reflow animation | Size changes cause jarring jump | CSS transitions on transform |
| react-beautiful-dnd deprecated | Security/maintenance risk | Replace with @dnd-kit |
| Layout flicker during drag | Poor UX | Single layout strategy |
| No user settings modal | Users can't easily customize | New SettingsPanel |
| No cross-category drag | Cards locked to categories | @dnd-kit multi-container |
| No config version merge | Admin changes don't reach users | ConfigurationService |

---

## 6. Dead Code

None found. All layout code is actively used.

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing layouts | HIGH | HIGH | Comprehensive testing, restore point |
| Performance with 79 cards | MEDIUM | MEDIUM | Virtualization if needed |
| SharePoint CSS conflicts | MEDIUM | MEDIUM | CSS Modules, high z-index |
| localStorage data loss | LOW | LOW | Graceful fallback to defaults |

---

## 8. Recommended Implementation Order

### Phase 1: Foundation (Day 1)
1. Create `models/DashboardConfiguration.ts` with new interfaces
2. Create `services/ConfigurationService.ts` with merge logic
3. Create `hooks/useDashboardConfig.ts`
4. Update types to support new model
5. **Test:** Dashboard loads with default config

### Phase 2: Masonry Grid (Day 2-3)
1. Create `services/MasonryLayoutEngine.ts` with position calculation
2. Create `hooks/useCardHeights.ts` with ResizeObserver
3. Create `hooks/useContainerWidth.ts`
4. Create `components/Grid/MasonryGrid.tsx` and `MasonryGridItem.tsx`
5. Create `components/Grid/CategorySection.tsx` (new)
6. **Test:** Cards pack with no blank spaces

### Phase 3: Animation (Day 3)
1. Add CSS transitions for position changes
2. Add enter/exit animations
3. Add collapse/expand for categories
4. **Test:** Smooth animated reflow

### Phase 4: User Settings Modal (Day 4)
1. Install @dnd-kit packages
2. Create `components/Settings/CategoryManager.tsx`
3. Create `components/Settings/SettingsPanel.tsx`
4. Wire up save to localStorage
5. **Test:** Full user customization flow

### Phase 5: Admin Property Pane (Day 5)
1. Create `components/PropertyPane/CategoryManagerDialog.tsx`
2. Update `getPropertyPaneConfiguration`
3. Implement reset functions
4. **Test:** Admin → User config hierarchy

### Phase 6: Polish (Day 6)
1. Card settings sub-panel
2. Cross-category drag
3. Edge cases and error handling
4. Performance audit

---

## 9. Files to Delete

After migration:
- Remove react-beautiful-dnd imports from CategorySection.tsx
- Remove old masonry layout switching code
- Remove PropertyPaneCardOrder.ts (replaced by CategoryManager)

---

## 10. New Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm uninstall react-beautiful-dnd @types/react-beautiful-dnd  # After migration
```

---

## Appendix: Key Code Locations

### DashboardCards.tsx (Main Orchestrator)
- Lines 266-308: handleDragEnd (reorder logic)
- Lines 382-589: renderCardElement (card rendering)
- Lines 725-727: DragDropContext wrapper

### CategorySection.tsx (Layout Engine)
- Lines 31-38: masonryBreakpoints
- Lines 55-64: Size separation
- Lines 96-163: renderMediumCards with Droppable/Draggable

### UserPreferencesService.ts (Persistence)
- Lines 15-30: Storage key generation
- Lines 32-55: loadUserPreferences
- Lines 57-80: saveUserPreferences

### CardConfigDialog.tsx (Admin Config)
- Lines 202-247: CATEGORIES definition
- Lines 250-280: Default category order
