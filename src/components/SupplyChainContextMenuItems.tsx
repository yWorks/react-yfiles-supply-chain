import { FoldingConnection, SupplyChainConnection, SupplyChainItem } from '../SupplyChain.tsx'
import { ContextMenuItem } from '@yworks/react-yfiles-core'
import { useSupplyChainContext } from '../SupplyChainProvider.tsx'

/**
 * Default [context menu items]{@link ContextMenuProps.menuItems} for the context menu component that include the
 * standard supply chain actions.
 *
 * ```tsx
 * function SupplyChain() {
 *   return (
 *     <SupplyChain data={data} contextMenuItems={SupplyChainContextMenuItems}></SupplyChain>
 *   )
 * }
 * ```
 *
 * @param item - The item to provide the items for.
 * @returns an array of [context menu items]{@link ContextMenuProps.menuItems}.
 */
export function SupplyChainContextMenuItems(
  item: SupplyChainItem | SupplyChainConnection | FoldingConnection | null
): ContextMenuItem<SupplyChainItem | SupplyChainConnection | FoldingConnection>[] {
  const {
    isConnection,
    canCollapseItem,
    collapseItem,
    canExpandItem,
    expandItem,
    highlightConnectedItems,
    isGroupItem,
    filterForConnectedItems,
    showGenealogy,
    canClearConnectedItemsHighlight,
    clearConnectedItemsHighlight,
    canShowAll,
    showAll
  } = useSupplyChainContext()

  const menuItems: ContextMenuItem<SupplyChainItem | SupplyChainConnection | FoldingConnection>[] =
    []
  if (item) {
    const isEdge = isConnection(item)

    if (!isEdge) {
      if (canCollapseItem(item)) {
        menuItems.push({
          title: 'Collapse All Children',
          action: () => {
            collapseItem(item)
          }
        })
      }
      if (canExpandItem(item)) {
        menuItems.push({
          title: 'Expand All Children',
          action: () => {
            expandItem(item)
          }
        })
      }
      menuItems.push({
        title: 'Highlight Connected Items',
        action: () => {
          highlightConnectedItems(item)
        }
      })

      if (!isGroupItem(item)) {
        menuItems.push({
          title: 'Filter For Connected Items',
          action: () => {
            filterForConnectedItems(item)
          }
        })

        menuItems.push({
          title: 'Show Item Genealogy',
          action: () => {
            showGenealogy(item)
          }
        })
      }
    }
  } else {
    // empty canvas context menu
    if (canClearConnectedItemsHighlight()) {
      menuItems.push({
        title: 'Clear Neighborhood Highlight',
        action: () => {
          clearConnectedItemsHighlight()
        }
      })
    }
    if (canShowAll()) {
      menuItems.push({
        title: 'Show Entire Diagram',
        action: () => {
          showAll()
        }
      })
    }
  }

  return menuItems
}
