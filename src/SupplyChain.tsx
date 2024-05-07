import './styles/supply-chain-styles.css'
import {
  ComponentType,
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  BridgeCrossingStyle,
  BridgeManager,
  GraphComponent,
  GraphObstacleProvider,
  GraphViewerInputMode,
  ICanvasObject,
  IGraph,
  NodeInsetsProvider,
  Size
} from 'yfiles'
import {
  initializeFocus,
  initializeHover,
  initializeInputMode,
  initializeSelection
} from './core/input'
import {
  checkLicense,
  ContextMenu,
  ContextMenuItemProvider,
  EdgeStyle as ConnectionStyle,
  LicenseError,
  NodeRenderInfo,
  ReactComponentHtmlGroupNodeStyle,
  ReactComponentHtmlNodeStyle,
  ReactNodeRendering,
  RenderContextMenuProps,
  RenderGroupNodeProps as RenderGroupProps,
  RenderNodeProps as RenderItemProps,
  RenderTooltipProps,
  Tooltip,
  useGraphSearch,
  useReactNodeRendering,
  withGraphComponent
} from '@yworks/react-yfiles-core'
import {
  SupplyChainProvider,
  useSupplyChainContext,
  useSupplyChainContextInternal
} from './SupplyChainProvider.tsx'
import { initializeGraphManager } from './core/data-loading.ts'
import { SupplyChainModel, SupplyChainModelInternal } from './SupplyChainModel.ts'
import { RenderSupplyChainItem } from './components/RenderSupplyChainItem.tsx'
import { RenderSupplyChainGroup } from './components/RenderSupplyChainGroup.tsx'
import { colorMapping } from './styles/color-utils.ts'
import { addHeatmap } from './core/heatmap.ts'
import { defaultEdgeStyle, defaultGraphFitInsets, defaultLayoutOptions } from './core/defaults.ts'
import StylingFoldingEdgeConverter from './core/StylingFoldingEdgeConverter.ts'

/**
 * The item's unique id.
 */
export type SupplyChainItemId = string | number

/**
 * The basic data type for the data items visualized by the {@link SupplyChain} component.
 */
export interface SupplyChainBaseItem {
  name?: string
  /**
   * The optional CSS class name that can be accessed in a custom component that renders the item.
   */
  className?: string
  /**
   * The optional CSS style that can be accessed in a custom component that renders the item.
   */
  style?: CSSProperties
}

export interface SupplyChainItem extends SupplyChainBaseItem {
  /**
   * The item's unique id.
   */
  id: SupplyChainItemId
  /**
   * The parent id of this item.
   * This id is used for grouping the graph.
   */
  parentId?: SupplyChainItemId
  /**
   * The optional render width of this item. If the width is not specified, it is determined by measuring the
   * item visualization unless a default size is defined by {@link SupplyChainProps.nodeSize}.
   */
  width?: number
  /**
   * The optional render height of this item. If the height is not specified, it is determined by measuring the
   * item visualization unless a default size is defined by {@link SupplyChainProps.nodeSize}.
   */
  height?: number
}

/**
 * The basic data type for the connections between data items visualized by the {@link SupplyChain} component.
 */
export interface SupplyChainConnection extends SupplyChainBaseItem {
  sourceId: SupplyChainItemId
  targetId: SupplyChainItemId
}

/**
 * The data type available on folding connections.
 *
 * A folding connection is a connection between collapsed grouping items.
 * It contains all connection data between children of the collapsed groups.
 */
export type FoldingConnection<
  TSupplyChainConnection extends SupplyChainConnection = SupplyChainConnection
> = {
  connections: TSupplyChainConnection[]
}

/**
 * A data type that combines custom data props with the {@link SupplyChainItem}. Data needs to fit in
 * this type so the component can handle the structure of the supply chain chart correctly.
 */
export type UserSupplyChainItem<TCustomProps = Record<string, unknown>> = TCustomProps &
  SupplyChainItem

/**
 * A data type that combines custom data props with the {@link SupplyChainConnection}. Data needs to fit in
 * this type so the component can handle the structure of the supply chain chart correctly.
 */
export type UserSupplyChainConnection<TCustomProps = Record<string, unknown>> = TCustomProps &
  SupplyChainConnection

/**
 * A function type that provides connection styles for supply chain links.
 *
 * The connection property is the SupplyChainConnection, the source and target properties
 * represent the start and end items of the connection, respectively.
 * For a single connection, there is only one object in the data array.
 * For folded connections, the array contains all "child" connection data.
 */
export type ConnectionStyleProvider<
  TSupplyChainItem extends SupplyChainBaseItem = SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection = SupplyChainConnection
> = (
  data: { source: TSupplyChainItem; target: TSupplyChainItem; connection: TSupplyChainConnection }[]
) => ConnectionStyle | undefined

/**
 * A callback type invoked when an item has been focused.
 */
export type ItemFocusedListener<TSupplyChainItem extends SupplyChainBaseItem> = (
  item: TSupplyChainItem | null
) => void

/**
 * A callback type invoked when an item has been selected or deselected.
 */
export type ItemSelectedListener<TSupplyChainItem extends SupplyChainBaseItem> = (
  selectedItems: TSupplyChainItem[]
) => void

/**
 * A callback type invoked when the hovered item has changed.
 */
export type ItemHoveredListener<TSupplyChainItem extends SupplyChainBaseItem> = (
  item: TSupplyChainItem | null,
  oldItem?: TSupplyChainItem | null
) => void

/**
 * A function that returns whether the given item matches the search needle.
 */
export type SearchFunction<TSupplyChainItem extends SupplyChainBaseItem, TNeedle = string> = (
  item: TSupplyChainItem,
  needle: TNeedle
) => boolean

/**
 * A function that maps a supply chain item to a numerical "heat" value used in the
 * heatmap visualization.
 * The heatmap feature is automatically used when a heat map function is provided.
 */
export type HeatFunction<
  TSupplyChainItem extends SupplyChainItem = SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection = SupplyChainConnection
> = (
  item: TSupplyChainItem | TSupplyChainConnection | FoldingConnection<TSupplyChainConnection>,
  supplyChainModel: SupplyChainModel
) => number

/**
 * A function that maps a supply chain item to a position in a grid.
 * The grid layout feature is automatically used when a grid positioning function is provided.
 */
export type GridPositioningFunction<TSupplyChainItem extends SupplyChainItem = SupplyChainItem> = (
  item: TSupplyChainItem
) => {
  row: number
  column: number
}

/**
 * A simple connection label description.
 */
export type SimpleConnectionLabel = {
  /**
   * The CSS class name to be used for the label.
   */
  className?: string
  /**
   * The text to be displayed on the label.
   */
  text: string
  /**
   * The basic shape of the label. The default is 'round-rectangle'.
   */
  labelShape?: 'hexagon' | 'pill' | 'rectangle' | 'round-rectangle'
}

/**
 * A function that provides text to display as a label on a connection.
 */
export type ConnectionLabelProvider<TSupplyChainConnection extends SupplyChainConnection> = (
  item: TSupplyChainConnection | FoldingConnection<TSupplyChainConnection>,
  supplyChainModel: SupplyChainModel
) => SimpleConnectionLabel | undefined

/**
 * The supply chain data consisting of {@link SupplyChainItem}s and {@link SupplyChainConnection}s.
 */
export type SupplyChainData<
  TSupplyChainItem extends SupplyChainItem = SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection = SupplyChainConnection
> = {
  items: TSupplyChainItem[]
  connections: TSupplyChainConnection[]
}

export type LayoutDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top'

export type EdgeRoutingStyle = 'orthogonal' | 'curved' | 'octilinear' | 'polyline'

export type SupplyChainLayoutOptions = {
  /**
   * The direction for the flow in the graph.
   */
  layoutDirection?: LayoutDirection
  /**
   * The style edges are routed in.
   */
  routingStyle?: EdgeRoutingStyle
  /**
   * The minimum distance between the layers in the hierarchy.
   */
  minimumLayerDistance?: number
  /**
   * The minimum length for the first segment of an edge.
   */
  minimumFirstSegmentLength?: number
  /**
   * The minimum length for the last segment of an edge.
   */
  minimumLastSegmentLength?: number
  /**
   * Limits the time the layout algorithm can use to the provided number of milliseconds.
   * This is an expert option. The main application is for graphs with many edges, where usually
   * the part of the layout calculations that takes the longest time is the edge routing.
   */
  maximumDuration?: number
}

/**
 * The props for the {@link SupplyChain} component.
 */
export interface SupplyChainProps<
  TSupplyChainItem extends SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection,
  TNeedle
> {
  /**
   * The data items visualized by the supply chain.
   */
  data: SupplyChainData<TSupplyChainItem, TSupplyChainConnection>
  /**
   * The grouping level which should be shown. Level 1 are the top level nodes.
   */
  showLevel?: number
  /**
   * An optional callback that's called when an item is focused.
   *
   * Note that the focused item is not changed if the empty canvas is clicked.
   */
  onItemFocus?: ItemFocusedListener<TSupplyChainItem | TSupplyChainConnection>
  /**
   * An optional callback that's called when an item is selected or deselected.
   */
  onItemSelect?: ItemSelectedListener<TSupplyChainItem | TSupplyChainConnection>
  /**
   * An optional callback that's called when the hovered item has changed.
   */
  onItemHover?: ItemHoveredListener<TSupplyChainItem | TSupplyChainConnection>
  /**
   * A string or a complex object to search for.
   *
   * The default search implementation can only handle strings and searches on the properties of the
   * data item. For more complex search logic, provide an {@link SupplyChain.onSearch} callback.
   */
  searchNeedle?: TNeedle
  /**
   * An optional callback that returns whether the given item matches the search needle.
   *
   * The default search implementation only supports string needles and searches all properties of the data item.
   * Provide this callback to implement custom search logic.
   */
  onSearch?: SearchFunction<TSupplyChainItem | TSupplyChainConnection, TNeedle>
  /**
   * A custom render component used for rendering the given data item.
   */
  renderItem?: ComponentType<RenderItemProps<TSupplyChainItem>>
  /**
   * A custom render component used for rendering groups of the given data item.
   */
  renderGroup?: ComponentType<RenderGroupProps<TSupplyChainItem>>
  /**
   * A function that provides a style configuration for the given connection.
   */
  connectionStyleProvider?: ConnectionStyleProvider<TSupplyChainItem, TSupplyChainConnection>
  /**
   * Specifies the CSS class used for the {@link SupplyChain} component.
   */
  className?: string
  /**
   * Specifies the CSS style used for the {@link SupplyChain} component.
   */
  style?: CSSProperties
  /**
   * Specifies the default item size used when no explicit width and height are provided.
   */
  itemSize?: { width: number; height: number }
  /**
   * An optional component that can be used for rendering a custom tooltip.
   */
  renderTooltip?: ComponentType<RenderTooltipProps<TSupplyChainItem | TSupplyChainConnection>>
  /**
   * An optional function specifying the context menu items for a data item.
   */
  contextMenuItems?: ContextMenuItemProvider<
    TSupplyChainItem | TSupplyChainConnection | FoldingConnection<TSupplyChainConnection>
  >
  /**
   * An optional component that renders a custom context menu.
   */
  renderContextMenu?: ComponentType<RenderContextMenuProps<TSupplyChainItem>>
  /**
   * Maps a supply chain item to a numerical heat value used in the heatmap visualization.
   * The heatmap feature is automatically used when a heat map function is provided.
   */
  heatMapping?: HeatFunction<TSupplyChainItem, TSupplyChainConnection>

  /**
   * Options for configuring the layout style and behavior.
   */
  layoutOptions?: SupplyChainLayoutOptions

  /**
   * Provides a grid position for supply chain items.
   * The grid layout feature is automatically used when a grid positioning function is provided.
   */
  gridPositioning?: GridPositioningFunction<TSupplyChainItem>

  /**
   * State setter used to indicate whether the layout is running.
   */
  setLayoutRunning?: React.Dispatch<React.SetStateAction<boolean>>

  /**
   * Provides a label description for connections.
   */
  connectionLabelProvider?: ConnectionLabelProvider<TSupplyChainConnection>

  /**
   * Optional Web Worker to run the layout calculation.
   * This requires the initialization of a Web Worker, see {@link initializeWebWorker}.
   */
  layoutWorker?: Worker
}

function checkStylesLoaded(root: HTMLElement | null) {
  const dummy = document.createElement('div')
  dummy.id = 'yfiles-react-stylesheet-detection'
  const rootNode = root?.getRootNode() ?? document
  const parent = rootNode === document ? document.body : rootNode
  parent.appendChild(dummy)
  const computedStyle = getComputedStyle(dummy)
  const hasStyle = computedStyle.fontSize === '1px'

  if (!hasStyle) {
    console.warn(
      "Stylesheet not loaded! Please import 'dist/index.css' from the @yworks/react-yfiles-supply-chain package."
    )
  }
  dummy.remove()
}

const licenseErrorCodeSample = `import {SupplyChain, registerLicense} from '@yworks/react-yfiles-supply-chain' 
import '@yworks/react-yfiles-supply-chain/dist/index.css'
import yFilesLicense from './license.json'

function App() {
  registerLicense(yFilesLicense)
            
  const data = {
    items: [
      { name: 'Copper-Ore', id: 1, parentId: 3 },
      { name: 'Copper-Plate', id: 2, parentId: 4 },
      { name: 'Resource', id: 3 },
      { name: 'Material', id: 4 }
    ],
    connections: [{ sourceId: 1, targetId: 2 }]
  }

  return <SupplyChain data={data}></SupplyChain>
}`

/**
 * The SupplyChain component visualizes the given data as a supply chain chart.
 * All data items have to be included in the [data]{@link SupplyChainProps.data}.
 *
 * ```tsx
 * function SupplyChainChart() {
 *   return (
 *     <SupplyChain data={data}> </SupplyChain>
 *   )
 * }
 * ```
 */
export function SupplyChain<
  TSupplyChainItem extends SupplyChainItem = UserSupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection = UserSupplyChainConnection,
  TNeedle = string
>(props: SupplyChainProps<TSupplyChainItem, TSupplyChainConnection, TNeedle> & PropsWithChildren) {
  if (!checkLicense()) {
    return (
      <LicenseError
        componentName={'yFiles React Supply Chain Component'}
        codeSample={licenseErrorCodeSample}
      />
    )
  }

  const isWrapped = useSupplyChainContextInternal()
  if (isWrapped) {
    return <SupplyChainCore {...props}>{props.children}</SupplyChainCore>
  }

  return (
    <SupplyChainProvider>
      <SupplyChainCore {...props}>{props.children}</SupplyChainCore>
    </SupplyChainProvider>
  )
}

const SupplyChainCore = withGraphComponent(
  <
    TSupplyChainItem extends SupplyChainItem,
    TSupplyChainConnection extends SupplyChainConnection,
    TNeedle
  >({
    children,
    renderItem,
    renderGroup,
    connectionStyleProvider,
    onItemHover,
    onSearch,
    onItemFocus,
    onItemSelect,
    data,
    searchNeedle,
    itemSize,
    renderTooltip,
    contextMenuItems,
    renderContextMenu,
    heatMapping,
    gridPositioning,
    setLayoutRunning,
    layoutOptions,
    showLevel,
    connectionLabelProvider,
    layoutWorker
  }: SupplyChainProps<TSupplyChainItem, TSupplyChainConnection, TNeedle> & PropsWithChildren) => {
    const supplyChainModel = useSupplyChainContext() as SupplyChainModelInternal<TSupplyChainItem>

    const graphComponent = supplyChainModel.graphComponent

    useEffect(() => {
      checkStylesLoaded(graphComponent.div)
    }, [])

    useEffect(() => {
      const layoutSupport = supplyChainModel.layoutSupport
      if (layoutSupport) {
        layoutSupport.layoutOptions = layoutOptions ?? defaultLayoutOptions
        layoutSupport.gridPositioningFunction = gridPositioning
        layoutSupport.setLayoutRunning = setLayoutRunning
        layoutSupport.layoutWorker = layoutWorker
      }
    }, [graphComponent, layoutOptions, gridPositioning, setLayoutRunning, layoutWorker])

    useEffect(() => {
      if (supplyChainModel.layoutSupport) {
        supplyChainModel.layoutSupport.gridPositioningFunction = gridPositioning
      }
    }, [gridPositioning, supplyChainModel.layoutSupport])

    const { nodeInfos, setNodeInfos } = useReactNodeRendering<TSupplyChainItem>()

    const { graphManager } = useMemo(() => {
      const masterGraph = graphComponent.graph.foldingView!.manager.masterGraph

      initializeDefaultStyle(graphComponent, masterGraph, setNodeInfos, itemSize)
      initializeBridges(graphComponent)

      graphComponent.graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(node => {
        return graphComponent.graph.isGroupNode(node)
          ? new NodeInsetsProvider([50, 15, 15, 15])
          : null
      })

      // populate the graph with the sample data and set default styles
      const graphManager = initializeGraphManager<TSupplyChainItem, TSupplyChainConnection>(
        masterGraph,
        setNodeInfos,
        supplyChainModel
      )

      // initializes basic interaction with the graph including the properties panel
      initializeInputMode(graphComponent, supplyChainModel)

      return {
        graphManager
      }
    }, [])

    const stylingFoldingEdgeConverter = graphComponent.graph.foldingView!.manager
      .foldingEdgeConverter as StylingFoldingEdgeConverter<TSupplyChainItem, TSupplyChainConnection>

    useEffect(() => {
      stylingFoldingEdgeConverter.connectionStyleProvider = connectionStyleProvider
    }, [connectionStyleProvider])

    useEffect(() => {
      if (connectionLabelProvider) {
        stylingFoldingEdgeConverter.connectionLabelProvider = item =>
          connectionLabelProvider(item, supplyChainModel)
      }
    }, [connectionLabelProvider])

    useEffect(() => {
      initializeDefaultStyle(
        graphComponent,
        graphComponent.graph.foldingView!.manager.masterGraph,
        setNodeInfos,
        itemSize
      )
    }, [data, itemSize, connectionStyleProvider, renderItem])

    useEffect(() => {
      const hoverItemChangedListener = initializeHover(onItemHover, graphComponent)

      return () => {
        // clean up
        hoverItemChangedListener &&
          (
            graphComponent.inputMode as GraphViewerInputMode
          ).itemHoverInputMode.removeHoveredItemChangedListener(hoverItemChangedListener)
      }
    }, [onItemHover])

    useEffect(() => {
      // initialize the focus and selection to display the information of the selected element
      const currentItemChangedListener = initializeFocus(onItemFocus, graphComponent)
      const selectedItemChangedListener = initializeSelection(onItemSelect, graphComponent)

      return () => {
        // clean up the listeners
        currentItemChangedListener &&
          graphComponent.removeCurrentItemChangedListener(currentItemChangedListener)
        selectedItemChangedListener &&
          graphComponent.selection.removeItemSelectionChangedListener(selectedItemChangedListener)
      }
    }, [onItemFocus, onItemSelect])

    useEffect(() => {
      graphManager.updateGraph(
        data,
        renderItem,
        renderGroup,
        connectionStyleProvider,
        connectionLabelProvider
      )
      graphComponent.fitGraphBounds(defaultGraphFitInsets)
    }, [data, itemSize?.width, itemSize?.height, connectionStyleProvider, renderItem, renderGroup])

    const graphSearch = useGraphSearch<TSupplyChainItem, TNeedle>(
      graphComponent,
      searchNeedle,
      onSearch
    )
    // provide search hits on the supplyChainModel
    supplyChainModel.getSearchHits = () => graphSearch.matchingNodes.map(n => n.tag)

    useEffect(() => {
      let heatMapCanvasObject: ICanvasObject | null = null

      if (typeof heatMapping === 'function') {
        heatMapCanvasObject = addHeatmap(graphComponent, t => heatMapping(t.tag, supplyChainModel))
      } else if (heatMapping !== undefined) {
        console.warn(`Heat mapping is not a function: ${heatMapping}`)
      }

      return () => {
        if (heatMapCanvasObject) {
          heatMapCanvasObject.remove()
          heatMapCanvasObject = null
        }
      }
    }, [graphComponent, heatMapping])

    useEffect(() => {
      if (typeof showLevel !== 'undefined') {
        supplyChainModel.showLevel(showLevel)
      }
    }, [showLevel])

    const maxNodeSize = useMemo(() => ({ width: 400, height: Number.POSITIVE_INFINITY }), [])

    // trigger node measuring on data change
    const [nodeData, setNodeData] = useState<TSupplyChainItem[]>([])
    useEffect(() => {
      setNodeData(data.items)
    }, [data])

    return (
      <>
        <ReactNodeRendering
          nodeData={nodeData}
          nodeInfos={nodeInfos}
          nodeSize={itemSize}
          maxSize={maxNodeSize}
          onMeasured={() => {
            if (typeof showLevel === 'undefined') {
              // showLevel already runs a layout, so only layout if not defined
              supplyChainModel.applyLayout(false, [], undefined, true)
            }
          }}
          onRendered={supplyChainModel.onRendered}
        />
        {renderTooltip && <Tooltip renderTooltip={renderTooltip}></Tooltip>}
        {(contextMenuItems || renderContextMenu) && (
          <ContextMenu menuItems={contextMenuItems} renderMenu={renderContextMenu}></ContextMenu>
        )}
        {children}
      </>
    )
  }
)

/**
 * Sets style defaults for nodes and edges.
 */
function initializeDefaultStyle<TSupplyChainItem extends SupplyChainItem>(
  graphComponent: GraphComponent,
  graph: IGraph,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<TSupplyChainItem>[]>>,
  nodeSize?: { width: number; height: number }
): void {
  graph.nodeDefaults.style = new ReactComponentHtmlNodeStyle<TSupplyChainItem>(
    RenderSupplyChainItem,
    setNodeInfos,
    (ctx, node) => ({ ...node.tag, __color: colorMapping(node.tag) })
  )

  graph.groupNodeDefaults.style = new ReactComponentHtmlGroupNodeStyle<TSupplyChainItem>(
    RenderSupplyChainGroup,
    setNodeInfos,
    (ctx, node) => ({ ...node.tag, __color: colorMapping(node.tag) })
  )

  if (nodeSize) {
    graph.nodeDefaults.size = new Size(nodeSize.width, nodeSize.height)
  }

  graph.edgeDefaults.style = defaultEdgeStyle
}

function initializeBridges(graphComponent: GraphComponent) {
  // Configure bridge manager: This visualizes edge crossings in a way that makes
  // it much easier to understand which edge goes where.
  const bridgeManager = new BridgeManager({
    defaultBridgeCrossingStyle: BridgeCrossingStyle.GAP
  })
  bridgeManager.canvasComponent = graphComponent
  bridgeManager.addObstacleProvider(new GraphObstacleProvider())
}
