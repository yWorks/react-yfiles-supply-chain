import {
  AdjacencyTypes,
  Arrow,
  Class,
  GraphComponent,
  GraphHighlightIndicatorManager,
  IContextLookupChainLink,
  IEdge,
  ILookupDecorator,
  IModelItem,
  IndicatorEdgeStyleDecorator,
  IndicatorNodeStyleDecorator,
  INode,
  Neighborhood,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  TraversalDirection
} from 'yfiles'

const NEIGHBORHOOD_HIGHLIGHT_COLOR = '#2979FF'

export class NeighborhoodIndicatorManager extends GraphHighlightIndicatorManager {
  // remember the neighborhood's master items to restore the highlighting after collapse/expand
  private neighborhoodCollection: Set<IModelItem> = new Set<IModelItem>()

  constructor(private readonly graphComponent: GraphComponent) {
    super({
      canvasComponent: graphComponent
    })

    this.nodeStyle = new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        shape: 'round-rectangle',
        stroke: `3px ${NEIGHBORHOOD_HIGHLIGHT_COLOR}`,
        fill: 'none'
      }),
      // the padding from the actual node to its highlight visualization
      padding: 2
    })

    this.edgeStyle = new IndicatorEdgeStyleDecorator({
      wrapped: new PolylineEdgeStyle({
        targetArrow: new Arrow({
          type: 'triangle',
          stroke: `2px ${NEIGHBORHOOD_HIGHLIGHT_COLOR}`,
          fill: NEIGHBORHOOD_HIGHLIGHT_COLOR
        }),
        stroke: `3px ${NEIGHBORHOOD_HIGHLIGHT_COLOR}`
      })
    })
  }

  highlightNeighborhood(viewStartNode: INode): void {
    const graph = this.graphComponent.graph

    super.clearHighlights()

    this.addHighlight(viewStartNode)

    const neighborhood = new Neighborhood({
      startNodes: [viewStartNode],
      traversalDirection: TraversalDirection.BOTH
    })

    const result = neighborhood.run(graph)
    for (const node of result.neighbors) {
      const highlightItem = node
      if (highlightItem) {
        this.addHighlight(highlightItem)
      }

      for (const adjacentOutEdge of graph.edgesAt(node, AdjacencyTypes.OUTGOING)) {
        if (
          result.neighbors.includes(adjacentOutEdge.targetNode!) ||
          adjacentOutEdge.targetNode! === viewStartNode
        ) {
          const viewItem = adjacentOutEdge
          if (viewItem) {
            this.addHighlight(viewItem)
          }
        }
      }
      for (const adjacentInEdge of graph.edgesAt(node, AdjacencyTypes.INCOMING)) {
        if (
          result.neighbors.includes(adjacentInEdge.sourceNode!) ||
          adjacentInEdge.sourceNode === viewStartNode
        ) {
          const viewItem = adjacentInEdge
          if (viewItem) {
            this.addHighlight(viewItem)
          }
        }
      }
    }
  }

  addHighlight(viewItem: IModelItem) {
    super.addHighlight(viewItem)

    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    this.neighborhoodCollection.add(foldingView.getMasterItem(viewItem)!)
  }

  clearHighlights() {
    this.neighborhoodCollection.clear()
    super.clearHighlights()
  }

  deactivateHighlights(): void {
    // clear highlights while keeping the internal collections
    super.clearHighlights()
  }

  activateHighlights(): void {
    // find the visible nodes in the graph depending on the stored collection
    let visibleItem: IModelItem | null = null
    for (const masterItem of this.neighborhoodCollection) {
      if (masterItem instanceof INode) {
        visibleItem = this.getNextVisibleNode(masterItem)
      } else if (masterItem instanceof IEdge) {
        visibleItem = this.getNextVisibleEdge(masterItem)
      }
      if (visibleItem) {
        super.addHighlight(visibleItem)
      }
    }
  }

  private getNextVisibleEdge(masterEdge: IEdge): IEdge | null {
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    return foldingView.getViewItem(masterEdge)
  }

  private getNextVisibleNode(masterNode: INode): INode | null {
    const graph = this.graphComponent.graph
    const foldingView = graph.foldingView!
    const masterGraph = foldingView.manager.masterGraph
    const groupingSupport = masterGraph.groupingSupport

    let visibleItem = foldingView.getViewItem(masterNode)
    const isVisible = visibleItem && graph.contains(visibleItem)
    const isFiltered = !masterGraph.contains(masterNode)
    if (!isVisible && !isFiltered) {
      // find the next parent that is part of the view
      const pathToRoot = groupingSupport.getPathToRoot(masterNode)
      for (const node of pathToRoot) {
        const viewNode = foldingView.getViewItem(node)
        if (graph.contains(viewNode)) {
          visibleItem = viewNode
        }
      }
    }

    return visibleItem
  }
}

/**
 * Add the neighborhood highlight indicator manager to the lookup of the GraphComponent to obtain it when needed
 */
export function registerNeighborHoodIndicatorManager(graphComponent: GraphComponent): void {
  Class.fixType(NeighborhoodIndicatorManager)
  const neighborhoodIndicatorManager = new NeighborhoodIndicatorManager(graphComponent)
  const decorator = graphComponent.lookup(ILookupDecorator.$class) as ILookupDecorator
  decorator.addLookup(
    GraphComponent.$class,
    IContextLookupChainLink.createContextLookupChainLink((item, type) => {
      if (type === NeighborhoodIndicatorManager.$class) {
        return neighborhoodIndicatorManager
      }
      return null
    })
  )
}

export function getNeighborhoodIndicatorManager(
  graphComponent: GraphComponent
): NeighborhoodIndicatorManager {
  const manager = graphComponent.lookup(NeighborhoodIndicatorManager.$class)
  if (!manager) {
    throw new Error('No NeighborhoodIndicatorManager registered on the GraphComponent')
  }
  return manager as NeighborhoodIndicatorManager
}
