import {
  FoldingConnection,
  SupplyChainConnection,
  SupplyChainItem,
  SupplyChainItemId
} from './SupplyChain.tsx'

import {
  getFilteredGraphWrapper,
  getNode,
  getNodeFromId,
  SupplyChainModelInternal
} from './SupplyChainModel.ts'

import {
  GraphComponent,
  GroupingSupport,
  Command,
  IEdge,
  INode,
  Insets,
  MutableRectangle,
  Neighborhood,
  TraversalDirection
} from '@yfiles/yfiles'

import {
  exportImageAndSave,
  type ExportSettings,
  exportSvgAndSave,
  printDiagram,
  type PrintSettings
} from '@yworks/react-yfiles-core'

import { getNeighborhoodIndicatorManager } from './core/NeighborhoodIndicatorManager.ts'

import { LayoutSupport } from './core/LayoutSupport.ts'
import {
  componentBackgroundColor,
  defaultExportMargins,
  defaultGraphFitInsets
} from './core/defaults.ts'

export function createSupplyChainModel<TSupplyChainItem extends SupplyChainItem>(
  graphComponent: GraphComponent,
  hiddenItems: Set<INode | IEdge>,
  layoutSupport: LayoutSupport<TSupplyChainItem>
): SupplyChainModelInternal<TSupplyChainItem> {
  let onRenderedCallback: null | (() => void) = null

  // this is a hack, so we have something like `await nextTick()`
  // that we can use instead of `setTimeout()`
  const setRenderedCallback = (cb: () => void) => {
    onRenderedCallback = cb
  }

  const onRendered = () => {
    onRenderedCallback?.()
    onRenderedCallback = null
  }

  function showGenealogy(item: SupplyChainItem, showOnlyConnected: boolean = false) {
    const viewGraph = graphComponent.graph
    const foldingView = viewGraph.foldingView!
    const masterGraph = foldingView.manager.masterGraph
    const filteredGraphWrapper = getFilteredGraphWrapper(graphComponent)

    if (!showOnlyConnected) {
      hiddenItems.clear()
      filteredGraphWrapper.nodePredicateChanged()
      filteredGraphWrapper.edgePredicateChanged()
    }

    const viewNode = getNode(item, viewGraph)
    if (!viewNode) {
      return
    }

    const masterNode = foldingView.getMasterItem(viewNode)
    if (!masterNode) {
      return
    }

    const neighborhood = new Neighborhood({
      startNodes: [masterNode],
      traversalDirection: TraversalDirection.BOTH
    })
    const result = neighborhood.run(masterGraph)
    const resultNodes = new Set(result.neighbors.toArray())
    resultNodes.add(masterNode)

    // include the parent nodes in the genealogy
    const masterGraphGroupingSupport = masterGraph.groupingSupport
    const genealogy = new Set<INode>()
    resultNodes.forEach(node => {
      genealogy.add(node)
      masterGraphGroupingSupport.getAncestors(node).forEach(parent => genealogy.add(parent))
    })

    // hide any node that is not part of the genealogy
    masterGraph.nodes.forEach(node => {
      if (!genealogy.has(node)) {
        hiddenItems.add(node)
        if (masterGraph.isGroupNode(node)) {
          // also hide all children
          masterGraphGroupingSupport.getDescendants(node).forEach(child => {
            hiddenItems.add(child)
          })
        }
      }
    })

    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodHighlightManager.deactivateHighlights()

    filteredGraphWrapper.nodePredicateChanged()
    filteredGraphWrapper.edgePredicateChanged()

    layoutSupport!.runLayout(false).then(() => {
      neighborhoodHighlightManager.activateHighlights()
      void graphComponent.fitGraphBounds(defaultGraphFitInsets, true)
    })
  }

  function canCollapseItem(item: SupplyChainItem) {
    const viewGraph = graphComponent.graph
    const foldingView = viewGraph.foldingView!
    const masterGraph = foldingView.manager.masterGraph

    const node = getNode(item, viewGraph)
    if (!node) {
      // node is currently not visible in the view graph
      return false
    }
    const masterNode = foldingView.getMasterItem(node)
    const isGroupNode = masterGraph.isGroupNode(masterNode)
    return isGroupNode && foldingView.isExpanded(node)
  }

  function canExpandItem(item: SupplyChainItem) {
    const viewGraph = graphComponent.graph
    const foldingView = viewGraph.foldingView!
    const masterGraph = foldingView.manager.masterGraph

    const node = getNode(item, viewGraph)
    if (!node) {
      // node is currently not visible in the view graph
      return false
    }
    const masterNode = foldingView.getMasterItem(node)
    const isGroupNode = masterGraph.isGroupNode(masterNode)
    return isGroupNode && !foldingView.isExpanded(node)
  }

  function isFoldingConnection(item: any): item is FoldingConnection {
    return 'connections' in item
  }

  function isConnection(item: any): item is SupplyChainConnection | FoldingConnection {
    return 'sourceId' in item || 'connections' in item
  }

  function applyLayout(
    incremental?: boolean,
    incrementalItems?: SupplyChainItem[],
    fixedItem: SupplyChainItem | null = null,
    fitViewport = false
  ) {
    if (!layoutSupport) {
      return Promise.resolve()
    }

    const incrementalNodes: INode[] = []
    incrementalItems?.forEach(item => {
      const graph = graphComponent.graph
      const node = getNode(item, graph)
      if (node) {
        incrementalNodes.push(node)
      }
    })

    const fixedNode = getNode(fixedItem, graphComponent.graph)

    return layoutSupport.runLayout(incremental ?? false, incrementalNodes, fixedNode, fitViewport)
  }

 async function collapseItem(item: SupplyChainItem) {
    const viewGraph = graphComponent.graph
    const foldingView = viewGraph.foldingView!
    const masterGraph = foldingView.manager.masterGraph

    const node = getNode(item, viewGraph)
    if (!node) {
      // node is currently not visible in the view graph
      return
    }
    const masterNode = foldingView.getMasterItem(node)

    const groupingSupport = masterGraph.groupingSupport

    if (canCollapseItem(item)) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.deactivateHighlights()

      foldingView.collapse(node)
      // collapse all children of the node
      const descendants = groupingSupport.getDescendants(masterNode)
      for (const descendant of descendants) {
        if (masterGraph.isGroupNode(descendant)) {
          const viewDescendant = foldingView.getViewItem(descendant)!
          if (foldingView.isExpanded(viewDescendant)) {
            foldingView.collapse(viewDescendant)
          }
        }
      }

      void applyLayout(true, [item], item)

      neighborhoodHighlightManager.activateHighlights()
    }
  }

  function expandItem(item: SupplyChainItem) {
    const viewGraph = graphComponent.graph
    const foldingView = viewGraph.foldingView!
    const masterGraph = foldingView.manager.masterGraph

    const node = getNode(item, viewGraph)
    if (!node) {
      // node is currently not visible in the view graph
      return
    }

    const masterNode = foldingView.getMasterItem(node)

    const groupingSupport = masterGraph.groupingSupport

    if (canExpandItem(item)) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.deactivateHighlights()

      const originalLayoutRect = node.layout.toRect()
      foldingView.expand(node)
      viewGraph.setNodeLayout(node, originalLayoutRect)

      // expand all children of the node
      const descendants = groupingSupport.getDescendants(masterNode)
      for (const descendant of descendants) {
        const viewDescendant = foldingView.getViewItem(descendant)!
        if (masterGraph.isGroupNode(descendant)) {
          if (!foldingView.isExpanded(viewDescendant)) {
            foldingView.expand(viewDescendant)
          }
        }
        viewGraph.setNodeCenter(viewDescendant, originalLayoutRect.center)
      }

      const incrementalItems = getChildren(item).concat([item])
      void applyLayout(true, incrementalItems, item)

      neighborhoodHighlightManager.activateHighlights()
    }
  }

  function highlightConnectedItems(item: SupplyChainItem) {
    const startNode = getNode(item, graphComponent.graph)!
    if (!startNode) {
      // node is currently not visible in the view graph
      return
    }

    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodIndicatorManager.highlightNeighborhood(startNode)
  }

  function canClearConnectedItemsHighlight() {
    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    return neighborhoodIndicatorManager.items.size > 0
  }

  function clearConnectedItemsHighlight() {
    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodIndicatorManager.clearHighlights()
  }

  function showAll(): void {
    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodHighlightManager.deactivateHighlights()

    hiddenItems.clear()
    const filteredGraphWrapper = getFilteredGraphWrapper(graphComponent)
    filteredGraphWrapper.nodePredicateChanged()
    filteredGraphWrapper.edgePredicateChanged()

    layoutSupport!.runLayout(false, graphComponent.graph.nodes.toArray()).then(() => {
      neighborhoodHighlightManager.activateHighlights()
      void graphComponent.fitGraphBounds(defaultGraphFitInsets, true)
    })
  }

  function canShowAll(): boolean {
    return hiddenItems.size > 0
  }

  function showLevel(level: number): void {
    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodHighlightManager.deactivateHighlights()

    const graph = graphComponent.graph
    const foldingView = graph.foldingView!
    const masterGraph = foldingView.manager.masterGraph
    const groupingSupport = new GroupingSupport(masterGraph)

    // collapse all levels
    groupingSupport.getDescendantsBottomUp(null).forEach(node => {
      if (masterGraph.isGroupNode(node) && groupingSupport.getAncestors(node).size >= level) {
        foldingView.collapse(node)
      }
    })

    const expandedNodes: INode[] = []

    // expand to provided level
    groupingSupport.getDescendants(null).forEach(node => {
      if (masterGraph.isGroupNode(node) && groupingSupport.getAncestors(node).size < level) {
        const viewNode = foldingView.getViewItem(node)
        if (viewNode) {
          expandedNodes.push(viewNode)
          graph.getChildren(viewNode).forEach(childNode => expandedNodes.push(childNode))
        }
        foldingView.expand(node)
      }
    })

    // Do a full layout
    void layoutSupport!.runLayout(false, expandedNodes, null, true)
    neighborhoodHighlightManager.activateHighlights()
  }

  function zoomIn() {
    graphComponent.executeCommand(Command.INCREASE_ZOOM,null)
  }

  function zoomOut() {
    graphComponent.executeCommand(Command.DECREASE_ZOOM,null)
  }

  function fitContent(insets: number = 0) {
    void graphComponent.fitGraphBounds(new Insets(insets), true)
  }

  function zoomToOriginal() {
    graphComponent.executeCommand(Command.ZOOM,1.0)
  }

  async function exportToSvg(exportSettings: ExportSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: graphComponent.zoom,
        margins: defaultExportMargins,
        inlineImages: true,
        background: componentBackgroundColor
      } as ExportSettings,
      exportSettings
    )
    await exportSvgAndSave(settings, graphComponent, setRenderedCallback)
  }

  async function exportToPng(exportSettings: ExportSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: graphComponent.zoom,
        margins: defaultExportMargins,
        inlineImages: true,
        background: componentBackgroundColor
      } as ExportSettings,
      exportSettings
    )
    await exportImageAndSave(settings, graphComponent, setRenderedCallback)
  }

  async function print(printSettings: PrintSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: 1.0,
        margins: defaultExportMargins
      } as PrintSettings,
      printSettings
    )
    await printDiagram(settings, graphComponent)
  }

  function refresh() {
    graphComponent.invalidate()
  }

  function toggleExpansionState(item: SupplyChainItem) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      graphComponent.executeCommand(Command.TOGGLE_EXPANSION_STATE, node)
    }
  }

  function getChildren(item: SupplyChainItem): SupplyChainItem[] {
    const node = getNode(item, graphComponent.graph)
    const masterGraph = graphComponent.graph.foldingView!.manager.masterGraph
    const groupingSupport = masterGraph.groupingSupport
    if (node) {
      const masterNode = graphComponent.graph.foldingView!.getMasterItem(node)
      return groupingSupport
        .getDescendants(masterNode)
        .map(child => child.tag)
        .toArray()
    }

    return []
  }

  function filterForConnectedItems(item: SupplyChainItem) {
    showGenealogy(item, true)
  }

  function isGroupItem(item: SupplyChainItem) {
    const graph = graphComponent.graph
    const node = getNode(item, graph)
    if (!node) {
      return false
    }
    const masterItem = graph.foldingView!.getMasterItem(node)
    return graph.foldingView!.manager.masterGraph.isGroupNode(masterItem)
  }

  function zoomTo(items: (SupplyChainItem | SupplyChainConnection | FoldingConnection)[]): void {
    if (items.length === 0) {
      return
    }

    const graph = graphComponent.graph

    const targetBounds = new MutableRectangle()

    items.forEach(item => {
      if (isConnection(item)) {
        if (isFoldingConnection(item)) {
          const foldingView = graphComponent.graph.foldingView!
          const masterGraph = foldingView.manager.masterGraph
          const mergedConnections = item.connections
          // find view-edge in graph
          const firstConnection = mergedConnections.at(0)!
          const masterSrcNode = masterGraph.nodes.find(
            node => node.tag.id === firstConnection.sourceId
          )!
          const masterTgtNode = masterGraph.nodes.find(
            node => node.tag.id === firstConnection.targetId
          )!
          const masterEdge = masterGraph.edges.find(
            e => e.sourceNode === masterSrcNode && e.targetNode === masterTgtNode
          )!

          const viewEdge = foldingView.getViewItem(masterEdge)!

          targetBounds.add(viewEdge.sourceNode!.layout)
          targetBounds.add(viewEdge.targetNode!.layout)
        } else {
          const source = getNodeFromId(item.sourceId as SupplyChainItemId, graph)!
          const target = getNodeFromId(item.targetId as SupplyChainItemId, graph)!
          targetBounds.add(source.layout)
          targetBounds.add(target.layout)
        }
      } else {
        const node = getNode(item as SupplyChainItem, graph)!
        targetBounds.add(node.layout)
      }
    })

    const enlargedTargetBounds = targetBounds.toRect().getEnlarged(200)

    // never decrease zoom on "zoom to item"
    const gcSize = graphComponent.size
    const newZoom = Math.min(
      gcSize.width / enlargedTargetBounds.width,
      gcSize.height / enlargedTargetBounds.height
    )
    void graphComponent.zoomToAnimated(Math.max(newZoom, graphComponent.zoom), enlargedTargetBounds.center)
  }

  return {
    graphComponent,

    layoutSupport,
    applyLayout,

    canClearConnectedItemsHighlight,
    clearConnectedItemsHighlight,
    highlightConnectedItems,
    filterForConnectedItems,
    showGenealogy,

    canCollapseItem,
    collapseItem,

    canExpandItem,
    expandItem,

    toggleExpansionState,

    showLevel,
    canShowAll,
    showAll,

    exportToPng,
    exportToSvg,
    print,

    getChildren,

    isConnection,
    isFoldingConnection,
    isGroupItem,

    fitContent,
    zoomIn,
    zoomOut,
    zoomTo,
    zoomToOriginal,

    getSearchHits: () => [], // will be replaced during initialization

    onRendered,
    refresh
  }
}
