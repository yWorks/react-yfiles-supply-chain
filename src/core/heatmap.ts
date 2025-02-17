import {
  type GraphComponent,
  HtmlCanvasVisual,
  IEdge,
  INode,
  type IRenderContext,
  type IRenderTreeElement,
  IVisualCreator,
  type Visual
} from '@yfiles/yfiles'

const heatScale = 0.5

/**
 * A visual that renders the heat map highlighting the nodes and edges with
 * a lot of events at the same time.
 */
export class HeatmapBackground extends HtmlCanvasVisual {
  private readonly getHeat: (t: INode | IEdge) => number
  private backBufferCanvas: HTMLCanvasElement | null = null
  private backBufferContext: CanvasRenderingContext2D | null = null

  constructor(getHeat: (t: INode | IEdge) => number) {
    super()
    this.getHeat = getHeat || ((): number => 1)
  }

  /**
   * Renders the heat map on a canvas.
   */
  render(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const { width, height } = ctx.canvas

    let canvas = this.backBufferCanvas
    let backBufferContext: CanvasRenderingContext2D

    if (!canvas || canvas.width !== width || canvas.height !== height) {
      canvas = document.createElement('canvas')
      canvas.setAttribute('width', String(width))
      canvas.setAttribute('height', String(height))
      backBufferContext = canvas.getContext('2d')!
      this.backBufferCanvas = canvas
      this.backBufferContext = backBufferContext
    } else {
      backBufferContext = this.backBufferContext!
      backBufferContext.clearRect(0, 0, width, height)
    }

    const scale = renderContext.zoom * heatScale

    backBufferContext.setTransform(
      renderContext.canvasComponent!.devicePixelRatio,
      0,
      0,
      renderContext.canvasComponent!.devicePixelRatio,
      0,
      0
    )

    let lastFillStyleHeat = -1
    for (const node of (renderContext.canvasComponent as GraphComponent)!.graph.nodes) {
      const topLeft = renderContext.worldToViewCoordinates(node.layout.topLeft)
      const bottomRight = renderContext.worldToViewCoordinates(node.layout.bottomRight)
      const heat = this.getHeat(node)
      if (heat > 0) {
        if (heat !== lastFillStyleHeat) {
          backBufferContext.fillStyle = `rgba(255,255,255, ${heat})`
          lastFillStyleHeat = heat
        }

        backBufferContext.beginPath()
        backBufferContext.rect(
          topLeft.x - 20,
          topLeft.y - 20,
          bottomRight.x - topLeft.x + 40,
          bottomRight.y - topLeft.y + 40
        )
        backBufferContext.fill()
      }
    }
    let lastStrokeStyleHeat = -1
    for (const edge of (renderContext.canvasComponent as GraphComponent).graph.edges) {
      const heat = this.getHeat(edge)
      if (heat > 0) {
        if (heat !== lastStrokeStyleHeat) {
          backBufferContext.strokeStyle = `rgba(255,255,255, ${heat})`
          backBufferContext.lineWidth = heat * 100 * scale
          backBufferContext.lineCap = 'square'
          lastStrokeStyleHeat = heat
        }
        const path = edge.style.renderer.getPathGeometry(edge, edge.style).getPath()!.flatten(1)

        backBufferContext.beginPath()
        const cursor = path.createCursor()
        if (cursor.moveNext()) {
          const point = renderContext.worldToViewCoordinates(cursor.currentEndPoint)
          backBufferContext.moveTo(point.x, point.y)
          while (cursor.moveNext()) {
            const point = renderContext.worldToViewCoordinates(cursor.currentEndPoint)
            backBufferContext.lineTo(point.x, point.y)
          }
          backBufferContext.stroke()
        }
      }
    }

    ctx.filter = 'url(#yfiles-react-heatmap)'
    ctx.drawImage(canvas, 0, 0)
    ctx.restore()
  }
}

let installedDivElement: HTMLDivElement | null = null

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
  if (!graphComponent.htmlElement.parentElement) {
    throw new Error('Cannot add heatmap for unmounted component')
  }
  const heatmapParent = graphComponent.htmlElement.parentElement

  if (!installedDivElement || !heatmapParent.contains(installedDivElement)) {
    installedDivElement = document.createElement('div')
    installedDivElement.setAttribute(
      'style',
      'height: 0px; width: 0px;position:absolute; top:0, left: 0; visibility: hidden'
    )
    installedDivElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="0" height="0">
  <defs>
    <filter id="yfiles-react-heatmap" x="0" y="0" width="100%" height="100%">
      <!-- Blur the image - change blurriness via stdDeviation between 10 and maybe 25 - lower values may perform better -->
      <feGaussianBlur stdDeviation="16" edgeMode="none"/>
      <!-- Take the alpha value -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0" />
      <!-- Map it to a "heat" rainbow colors -->
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0 0 0 0 1 1"></feFuncR>
        <feFuncG type="table" tableValues="0 0 1 1 1 0"></feFuncG>
        <feFuncB type="table" tableValues="0.5 1 0 0 0"></feFuncB>
        <!-- specify maximum opacity for the overlay here -->
        <!-- less opaque: <feFuncA type="table" tableValues="0 0.1 0.4 0.6 0.7"></feFuncA> -->
        <feFuncA type="table" tableValues="0 0.6 0.7 0.8 0.9"></feFuncA>
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
`
    heatmapParent.appendChild(installedDivElement)
  }
  return graphComponent.renderTree.backgroundGroup.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    IVisualCreator.create({
      createVisual(): Visual {
        return new HeatmapBackground(getHeat)
      },
      updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual {
        return oldVisual!
      }
    })
  )
}
