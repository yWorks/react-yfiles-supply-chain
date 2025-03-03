import {
  type GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IEdge,
  INode,
  InputModeItemEventArgs,
  ItemHoverInputMode,
  NavigationInputMode,
  NodeAlignmentPolicy
} from '@yfiles/yfiles'
import { getSupplyChainItem } from './data-loading'
import { SupplyChainModel } from '../SupplyChainModel'
import { SupplyChainBaseItem, SupplyChainItem } from '../SupplyChain.tsx'
import { configureIndicatorStyling } from './configure-highlight-indicators.ts'
import { getNeighborhoodIndicatorManager } from './NeighborhoodIndicatorManager.ts'

/**
 * Set up the graph viewer input mode to and enables interactivity to expand and collapse subtrees.
 */
export function initializeInputMode(
  graphComponent: GraphComponent,
  SupplyChain: SupplyChainModel
): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NONE,
    contextMenuItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.EDGE, GraphItemTypes.NODE]
  })
  graphViewerInputMode.navigationInputMode.allowExpandGroup = true
  graphViewerInputMode.navigationInputMode.allowCollapseGroup = true
  graphViewerInputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
    NodeAlignmentPolicy.TOP_LEFT

  graphViewerInputMode.addEventListener('item-double-clicked', evt => {
    const item = evt.item
    if (item instanceof INode) {
      SupplyChain.zoomTo([getSupplyChainItem(item) as SupplyChainItem])
      evt.handled = true
    }
  })

  initializeHighlights(graphComponent)
  configureIndicatorStyling(graphComponent, graphViewerInputMode)

  configureExpandCollapse(graphViewerInputMode.navigationInputMode, SupplyChain)

  graphComponent.inputMode = graphViewerInputMode
}

export function configureExpandCollapse(
  navigationInputMode: NavigationInputMode,
  SupplyChain: SupplyChainModel
) {
  const expandCollapsingListener = (
    _: InputModeItemEventArgs<INode>,
    sender: NavigationInputMode
  ) => {
    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(sender.graphComponent!)
    neighborhoodHighlightManager.deactivateHighlights()
  }
  const expandCollapsedListener = (
    evt: InputModeItemEventArgs<INode>,
    sender: NavigationInputMode
  ) => {
    const incrementalItems = SupplyChain.getChildren(evt.item.tag).concat([evt.item.tag])
    SupplyChain.applyLayout(true, incrementalItems, evt.item.tag).then(() => {
      const graphComponent = SupplyChain.graphComponent
      graphComponent.viewportLimiter.bounds = graphComponent.contentBounds
    })

    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(sender.graphComponent!)
    neighborhoodHighlightManager.activateHighlights()
  }

  navigationInputMode.addEventListener('group-collapsing', expandCollapsingListener)
  navigationInputMode.addEventListener('group-expanding', expandCollapsingListener)

  navigationInputMode.addEventListener('group-collapsed', expandCollapsedListener)
  navigationInputMode.addEventListener('group-expanded', expandCollapsedListener)
}

export function initializeHover<TSupplyChainItem extends SupplyChainBaseItem>(
  onHover: ((item: TSupplyChainItem | null, oldItem?: TSupplyChainItem | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  const hoverItemChangedListener: (
    evt: HoveredItemChangedEventArgs,
    sender: ItemHoverInputMode
  ) => void = ({ item, oldItem }): void => {
    if (onHover) {
      onHover(item?.tag, oldItem?.tag)
    }
  }

  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', hoverItemChangedListener)
  return hoverItemChangedListener
}

/**
 * Adds and returns the listener when the currentItem changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeFocus<TSupplyChainItem extends SupplyChainBaseItem>(
  onFocus: ((item: TSupplyChainItem | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  let currentItemChangedListener = () => {}
  if (onFocus) {
    // display information about the current item
    currentItemChangedListener = () => {
      const currentItem = graphComponent.currentItem
      if (currentItem instanceof INode) {
        onFocus(getSupplyChainItem<TSupplyChainItem>(currentItem))
      } else {
        onFocus(null)
      }
    }
  }
  graphComponent.addEventListener('current-item-changed', currentItemChangedListener)
  return currentItemChangedListener
}

/**
 * Adds and returns the listener when the selected item changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeSelection<TSupplyChainItem extends SupplyChainBaseItem>(
  onSelect: ((selectedItems: TSupplyChainItem[]) => void) | undefined,
  graphComponent: GraphComponent
) {
  let itemSelectionChangedListener = () => {}
  if (onSelect) {
    // display information about the current item
    itemSelectionChangedListener = () => {
      onSelect(
        graphComponent.selection
          .filter(element => element instanceof IEdge || element instanceof INode)
          .map(element => getSupplyChainItem<TSupplyChainItem>(element as INode | IEdge))
          .toArray()
      )
    }
  }
  graphComponent.selection.addEventListener('item-added', itemSelectionChangedListener)
  graphComponent.selection.addEventListener('item-removed', itemSelectionChangedListener)
  return itemSelectionChangedListener
}

/**
 * Initializes the highlights for selected or focused elements.
 */
function initializeHighlights(graphComponent: GraphComponent): void {
  // Hide the default selection/focus highlight in favor of the CSS highlighting from the template styles
  graphComponent.graph.decorator.nodes.selectionRenderer.hide()
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
  graphComponent.focusIndicatorManager.showFocusPolicy = 'always'
}
