import {
  Arrow,
  GraphComponent,
  GraphFocusIndicatorManager,
  GraphHighlightIndicatorManager,
  GraphInputMode,
  GraphSelectionIndicatorManager,
  type IModelItem,
  IndicatorEdgeStyleDecorator,
  IndicatorNodeStyleDecorator,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  VoidEdgeStyle,
  VoidNodeStyle
} from 'yfiles'
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
  highlightManager.clearHighlights()
  if (item) {
    if (highlight) {
      highlightManager.addHighlight(item)
    } else {
      highlightManager.removeHighlight(item)
    }
  }
}

const HOVER_HIGHLIGHT_COLOR = '#FF6F00'

export function configureIndicatorStyling(
  graphComponent: GraphComponent,
  inputMode: GraphInputMode
) {
  // show the indicators on hover
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((_, { item, oldItem }) => {
    void highlightItem(graphComponent, oldItem, false)
    void highlightItem(graphComponent, item, true)
  })

  // style the selection and hover indicators
  const nodeHighlightingStyle = new IndicatorNodeStyleDecorator({
    wrapped: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: `3px ${HOVER_HIGHLIGHT_COLOR}`,
      fill: 'none'
    }),
    // the padding from the actual node to its highlight visualization
    padding: 4
  })

  const edgeHighlightStyle = new IndicatorEdgeStyleDecorator({
    wrapped: new PolylineEdgeStyle({
      targetArrow: new Arrow({
        type: 'triangle',
        stroke: `2px ${HOVER_HIGHLIGHT_COLOR}`,
        fill: HOVER_HIGHLIGHT_COLOR
      }),
      stroke: `3px ${HOVER_HIGHLIGHT_COLOR}`
    })
  })
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: nodeHighlightingStyle,
    edgeStyle: edgeHighlightStyle
  })
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: nodeHighlightingStyle,
    edgeStyle: edgeHighlightStyle
  })

  // hide focus indication
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE,
    edgeStyle: VoidEdgeStyle.INSTANCE
  })

  registerNeighborHoodIndicatorManager(graphComponent)
}
