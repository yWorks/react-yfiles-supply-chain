import {
  type GraphComponent,
  HeatMapRenderer,
  type IEdge,
  type INode,
  type IRenderTreeElement
} from '@yfiles/yfiles'

/**
 * Creates a heatmap visualization which displays the heat values for all nodes and edges
 * as a color map in the background.
 * @param graphComponent the graph component to which the heatmap is added
 * @param getHeat the heat function which provides the heat values for the graph elements
 */
export function addHeatmap(
  graphComponent: GraphComponent,
  getHeat: (t: INode | IEdge) => number
): IRenderTreeElement {
  return graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    graphComponent.graph,
    new HeatMapRenderer(getHeat, getHeat)
  )
}
