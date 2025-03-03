import { FilteredGraphWrapper, GraphComponent, IEdge, IGraph, INode } from '@yfiles/yfiles'
import { type ExportSettings, type PrintSettings } from '@yworks/react-yfiles-core'
import {
  FoldingConnection,
  SupplyChainConnection,
  SupplyChainItem,
  SupplyChainItemId
} from './SupplyChain.tsx'
import { LayoutSupport } from './core/LayoutSupport.ts'

/**
 * The SupplyChainModel provides common functionality to interact with the {@link SupplyChain} component.
 */
export interface SupplyChainModel {
  /**
   * The [yFiles GraphComponent]{@link http://docs.yworks.com/yfileshtml/#/api/GraphComponent} used
   * by the {@link SupplyChain} component to display the graph.
   *
   * This property is intended for advanced users who have a familiarity with the
   * [yFiles for HTML]{@link https://www.yworks.com/products/yfiles-for-html} library.
   */
  graphComponent: GraphComponent

  /**
   * Whether the item can have children.
   */
  isGroupItem(item: SupplyChainItem): boolean

  /**
   * Whether the item is a connection.
   */
  isConnection(item: any): item is SupplyChainConnection | FoldingConnection

  /**
   * Whether a connection groups multiple "simple" connections.
   * See {@link FoldingConnection}.
   */
  isFoldingConnection(item: any): item is FoldingConnection

  /**
   * Whether an item can be collapsed.
   * An item can be collapsed when it is a grouping item,
   * and it is in the expanded state.
   */
  canCollapseItem(item: SupplyChainItem): boolean

  /**
   * Collapses an item and all it's children recursively.
   */
  collapseItem(item: SupplyChainItem): void

  /**
   * Whether an item can be expanded.
   * An item can be expanded when it is a grouping item,
   * and it is in the collapsed state.
   */
  canExpandItem(item: SupplyChainItem): boolean

  /**
   * Expands an item and all it's children recursively.
   */
  expandItem(item: SupplyChainItem): void

  /**
   * Highlights an item and all other items connected to it.
   * Two items are connected when there exists an edge path
   * between them, even if there are several hops (items)
   * on the path.
   */
  highlightConnectedItems(item: SupplyChainItem): void

  /**
   * Whether there is currently a connected items
   * highlight visualized in the graph that can be cleared.
   */
  canClearConnectedItemsHighlight(): boolean

  /**
   * Clears the connected items highlight visualization.
   */
  clearConnectedItemsHighlight(): void

  /**
   * Shows all items in the supply chain.
   */
  showAll(): void
  /**
   * Whether there are any hidden items to show.
   */
  canShowAll(): boolean
  /**
   * Refreshes the supply chain layout.
   * If the incremental parameter is set to true, the layout considers certain
   * items as fixed and arranges only the items contained in the incrementalItems array.
   */
  applyLayout(
    incremental?: boolean,
    incrementalItems?: SupplyChainItem[],
    fixedItem?: SupplyChainItem,
    fitViewport?: boolean
  ): Promise<void>

  /**
   * Pans the viewport to the center of the given items.
   */
  zoomTo(items: (SupplyChainItem | SupplyChainConnection | FoldingConnection)[]): void
  /**
   * Retrieves the items that match the search currently.
   */
  getSearchHits: () => SupplyChainItem[]
  /**
   * Expands/collapses the graph to the given level. The top level is 1.
   */
  showLevel(level: number): void
  /**
   * Increases the zoom level.
   */
  zoomIn(): void
  /**
   * Decreases the zoom level.
   */
  zoomOut(): void
  /**
   * Fits the chart inside the viewport.
   */
  fitContent(insets?: number): void
  /**
   * Resets the zoom level to 1.
   */
  zoomToOriginal(): void

  /**
   * Exports the supply chain chart to an SVG file.
   * @throws Exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToSvg(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports the supply chain chart to a PNG Image.
   * @throws Exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToPng(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports and prints the supply chain chart.
   */
  print(printSettings?: PrintSettings): Promise<void>

  /**
   * Triggers a re-rendering of the chart.
   * This may become useful if properties in the data change and the
   * visualization should update accordingly.
   */
  refresh(): void

  /**
   * Toggles the expansion state of a grouping item.
   */
  toggleExpansionState(item: SupplyChainItem): void

  /**
   * Returns all children of an item recursively.
   */
  getChildren(item: SupplyChainItem): SupplyChainItem[]

  /**
   * Filters the graph for all items that are connected to
   * the given item.
   * Connections can be over multiple hops.
   */
  showGenealogy(item: SupplyChainItem): void

  /**
   * Filters the graph for all items that are connected to
   * the given item.
   * In contrast to {@link SupplyChainModel.showGenealogy}, this method does
   * not clear the filtering state before calculating the
   * genealogy and thus allows for a drill-down in the currently
   * displayed filtered state.
   */
  filterForConnectedItems(item: SupplyChainItem): void
}

export interface SupplyChainModelInternal<TSupplyChainItem extends SupplyChainItem>
  extends SupplyChainModel {
  layoutSupport: LayoutSupport<TSupplyChainItem> | undefined
  onRendered: () => void
}

export function getEdge(item: SupplyChainConnection, graph: IGraph): IEdge | null {
  const srcId = item.sourceId
  const tgtId = item.targetId
  return item ? getEdgeFromIds(srcId, tgtId, graph) : null
}

export function getEdgeFromIds(
  sourceId: SupplyChainItemId,
  targetId: SupplyChainItemId,
  graph: IGraph
): IEdge | null {
  return graph.edges.find(e => e.tag.sourceId === sourceId && e.tag.targetId === targetId)
}

export function getNode(item: SupplyChainItem | null, graph: IGraph): INode | null {
  return item ? getNodeFromId(item.id, graph) : null
}

export function getNodeFromId(id: SupplyChainItemId, graph: IGraph): INode | null {
  return graph.nodes.find(node => node.tag.id === id)
}

/**
 * Returns the fully expanded, unfiltered graph.
 */
export function getFullGraph(graphComponent: GraphComponent): IGraph {
  return getFilteredGraphWrapper(graphComponent).wrappedGraph!
}

export function getFilteredGraphWrapper(graphComponent: GraphComponent): FilteredGraphWrapper {
  return graphComponent.graph.foldingView!.manager.masterGraph as FilteredGraphWrapper
}
