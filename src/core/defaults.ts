import { SupplyChainLayoutOptions } from '../SupplyChain.tsx'
import { Arrow, ArrowType, Insets, PolylineEdgeStyle, Size } from '@yfiles/yfiles'

export const componentBackgroundColor = 'rgb(238,238,238)'
export const maximumZoom = 4
export const minimumZoom = 0

export const defaultLayoutOptions: SupplyChainLayoutOptions = {
  layoutDirection: 'left-to-right',
  routingStyle: 'orthogonal',
  minimumLayerDistance: 100,
  minimumFirstSegmentLength: 50,
  minimumLastSegmentLength: 50
}

export const defaultFolderNodeSize = new Size(300, 100)

export const defaultGraphFitInsets = new Insets(100)

export const defaultEdgeColor = 'rgb(170, 170, 170)'

export const defaultEdgeWidth = '2px'

export const defaultEdgeSmoothingLength = 10

export const defaultEdgeStyle = new PolylineEdgeStyle({
  targetArrow: new Arrow({
    type: ArrowType.TRIANGLE,
    widthScale: 1.5,
    lengthScale: 1.5,
    stroke: defaultEdgeColor,
    fill: defaultEdgeColor
  }),
  sourceArrow: new Arrow(ArrowType.NONE),
  stroke: `${defaultEdgeWidth} ${defaultEdgeColor}`,
  smoothingLength: defaultEdgeSmoothingLength
})

export const defaultExportMargins = { top: 5, right: 5, left: 5, bottom: 5 }
