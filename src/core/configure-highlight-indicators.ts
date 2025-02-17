import {
  Arrow,
  EdgeStyleIndicatorRenderer,
  GraphComponent,
  GraphInputMode,
  type IModelItem,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { registerNeighborHoodIndicatorManager } from './NeighborhoodIndicatorManager.ts'

/**
 * Adds or removes a CSS class to highlight the given item.
 */
async function highlightItem(
  graphComponent: GraphComponent,
  item: IModelItem | null,
  highlight: boolean
): Promise<void> {
  const highlightManager = graphComponent.highlightIndicatorManager
  highlightManager.items?.clear()
  if (item) {
    if (highlight) {
      highlightManager.items?.add(item)
    } else {
      highlightManager.items?.remove(item)
    }
  }
}

const HOVER_HIGHLIGHT_COLOR = '#FF6F00'

export function configureIndicatorStyling(
  graphComponent: GraphComponent,
  inputMode: GraphInputMode
) {
  // show the indicators on hover
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', ({ item, oldItem }) => {
    void highlightItem(graphComponent, oldItem, false)
    void highlightItem(graphComponent, item, true)
  })

  // style the selection and hover indicators
  const nodeHighlightingStyle = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: `3px ${HOVER_HIGHLIGHT_COLOR}`,
      fill: 'none'
    }),
    // the padding from the actual node to its highlight visualization
    margins: 4
  })

  const edgeHighlightStyle = new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({
      targetArrow: new Arrow({
        type: 'triangle',
        stroke: `2px ${HOVER_HIGHLIGHT_COLOR}`,
        fill: HOVER_HIGHLIGHT_COLOR
      }),
      stroke: `3px ${HOVER_HIGHLIGHT_COLOR}`
    })
  })

  const decorator = graphComponent.graph.decorator
  decorator.nodes.highlightRenderer.addConstant(nodeHighlightingStyle)
  decorator.edges.highlightRenderer.addConstant(edgeHighlightStyle)

  decorator.nodes.selectionRenderer.addConstant(nodeHighlightingStyle)
  decorator.edges.selectionRenderer.addConstant(edgeHighlightStyle)

  // hide focus indication
  decorator.nodes.focusRenderer.hide()
  decorator.edges.focusRenderer.hide()

  registerNeighborHoodIndicatorManager(graphComponent)
}
