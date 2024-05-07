import {
  DefaultLabelStyle,
  EdgesSource,
  GraphBuilder,
  IEdge,
  type IGraph,
  type INode,
  NodesSource
} from 'yfiles'
import {
  ConnectionStyleProvider,
  ConnectionLabelProvider,
  SupplyChainItem,
  SimpleConnectionLabel,
  SupplyChainBaseItem,
  SupplyChainData,
  SupplyChainConnection
} from '../SupplyChain'
import {
  convertToPolylineEdgeStyle,
  NodeRenderInfo,
  ReactComponentHtmlNodeStyle,
  ReactComponentHtmlGroupNodeStyle,
  RenderGroupNodeProps as RenderGroupProps,
  RenderNodeProps as RenderItemProps
} from '@yworks/react-yfiles-core'
import { ComponentType, Dispatch, SetStateAction } from 'react'
import { getNode, SupplyChainModel } from '../SupplyChainModel.ts'
import { colorMapping } from '../styles/color-utils.ts'

export class GraphManager<
  TSupplyChainItem extends SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection
> {
  public nodeData: TSupplyChainItem[] = []
  public groupsData: TSupplyChainItem[] = []
  public connectionsData: TSupplyChainConnection[] = []
  public renderItem?: ComponentType<RenderItemProps<TSupplyChainItem>>
  public renderGroup?: ComponentType<RenderGroupProps<TSupplyChainItem>>
  public connectionStyleProvider?: ConnectionStyleProvider<TSupplyChainItem, TSupplyChainConnection>
  public connectionLabelProvider?: ConnectionLabelProvider<TSupplyChainConnection>
  public incrementalElements: TSupplyChainItem[] = []
  constructor(
    public graphBuilder?: GraphBuilder,
    public nodesSource?: NodesSource<TSupplyChainItem>,
    public groupNodesSource?: NodesSource<TSupplyChainItem>,
    public connectionsSource?: EdgesSource<TSupplyChainConnection>
  ) {}

  private separateGroupItems(data: SupplyChainData<TSupplyChainItem, TSupplyChainConnection>): {
    nodeData: TSupplyChainItem[]
    groupsData: TSupplyChainItem[]
  } {
    const mixedItems = [...data.items]
    const groupsData: TSupplyChainItem[] = []
    for (const item of data.items) {
      const parentId = item.parentId
      if (item.id !== item.parentId) {
        // an item cannot be its own group
        const parentItemIdx = mixedItems.findIndex(i => parentId === i.id)
        if (parentItemIdx !== -1) {
          const [group] = mixedItems.splice(parentItemIdx, 1)

          groupsData.push(group)
        }
      }
    }
    // now, all group nodes have been spliced from the items
    const nodeData = mixedItems

    return { nodeData, groupsData }
  }

  updateGraph(
    data: SupplyChainData<TSupplyChainItem, TSupplyChainConnection>,
    renderItem?: ComponentType<RenderItemProps<TSupplyChainItem>>,
    renderGroup?: ComponentType<RenderGroupProps<TSupplyChainItem>>,
    connectionStyleProvider?: ConnectionStyleProvider<TSupplyChainItem, TSupplyChainConnection>,
    connectionLabelProvider?: ConnectionLabelProvider<TSupplyChainConnection>
  ) {
    const { nodeData, groupsData } = this.separateGroupItems(data)
    const connectionsData = data.connections

    // find the new elements and mark them as incremental
    this.incrementalElements = compareData(this.nodeData, nodeData)

    this.nodeData = nodeData
    this.groupsData = groupsData
    this.connectionsData = connectionsData

    if (
      !this.graphBuilder ||
      !this.nodesSource ||
      !this.groupNodesSource ||
      !this.connectionsSource
    ) {
      return
    }

    if (renderItem) {
      this.renderItem = renderItem
    }
    if (renderGroup) {
      this.renderGroup = renderGroup
    }
    if (connectionStyleProvider) {
      this.connectionStyleProvider = connectionStyleProvider
    }
    if (connectionLabelProvider) {
      this.connectionLabelProvider = connectionLabelProvider
    }
    this.graphBuilder.setData(this.nodesSource, nodeData)
    this.graphBuilder.setData(this.groupNodesSource, groupsData)
    this.graphBuilder.setData(this.connectionsSource, connectionsData)
    this.graphBuilder.updateGraph()
  }
}

/**
 * Creates the SupplyChain graph.
 */
export function initializeGraphManager<
  TSupplyChainItem extends SupplyChainItem,
  TSupplyChainConnection extends SupplyChainConnection
>(
  graph: IGraph,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<TSupplyChainItem>[]>>,
  supplyChainModel: SupplyChainModel
): GraphManager<TSupplyChainItem, TSupplyChainConnection> {
  graph.clear()
  const graphManager = new GraphManager<TSupplyChainItem, TSupplyChainConnection>()
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource<TSupplyChainItem>([], 'id')
  nodesSource.parentIdProvider = dataItem => dataItem.parentId

  const groupsSource = graphBuilder.createGroupNodesSource<TSupplyChainItem>(
    [],
    dataItem => dataItem.id
  )
  groupsSource.parentIdProvider = dataItem => dataItem.parentId

  const edgesSource = graphBuilder.createEdgesSource<TSupplyChainConnection>(
    [],
    dataItem => dataItem.sourceId,
    dataItem => dataItem.targetId
  )

  const edgeCreator = edgesSource.edgeCreator

  edgeCreator.styleProvider = (edge: TSupplyChainConnection) => {
    if (graphManager.connectionStyleProvider) {
      const edgeStyle = graphManager.connectionStyleProvider([
        {
          source: graphManager.nodeData.find(item => item.id === edge.sourceId)!,
          target: graphManager.nodeData.find(item => item.id === edge.targetId)!,
          connection: edge
        }
      ])
      if (edgeStyle) {
        return convertToPolylineEdgeStyle(edgeStyle)
      }
    }
    return null
  }

  const labelBinding = edgeCreator.createLabelBinding()

  labelBinding.textProvider = dataItem =>
    getConnectionLabelText(supplyChainModel, dataItem, graphManager.connectionLabelProvider)
  labelBinding.styleProvider = dataItem =>
    getConnectionLabelStyle(supplyChainModel, dataItem, graphManager.connectionLabelProvider)

  const nodeCreator = nodesSource.nodeCreator

  nodeCreator.styleProvider = () => {
    if (graphManager.renderItem) {
      return new ReactComponentHtmlNodeStyle(
        graphManager.renderItem,
        setNodeInfos,
        (ctx, node) => ({ ...node.tag, __color: colorMapping(node.tag) })
      )
    }
    return null
  }
  nodeCreator.layoutBindings.addBinding(
    'width',
    (item: TSupplyChainItem) => item.width ?? graph.nodeDefaults.size.width
  )
  nodeCreator.layoutBindings.addBinding(
    'height',
    (item: TSupplyChainItem) => item.height ?? graph.nodeDefaults.size.height
  )
  nodeCreator.layoutBindings.addBinding(
    'x',
    (item: TSupplyChainItem) => getNode(item, graph)?.layout.x ?? 0
  )
  nodeCreator.layoutBindings.addBinding(
    'y',
    (item: TSupplyChainItem) => getNode(item, graph)?.layout.y ?? 0
  )

  const groupNodeCreator = groupsSource.nodeCreator
  groupNodeCreator.styleProvider = () => {
    if (graphManager.renderGroup) {
      return new ReactComponentHtmlGroupNodeStyle(
        graphManager.renderGroup,
        setNodeInfos,
        (ctx, node) => ({ ...node.tag, __color: colorMapping(node.tag) })
      )
    }
    return null
  }
  groupNodeCreator.layoutBindings.addBinding(
    'width',
    (item: TSupplyChainItem) => item.width ?? graph.nodeDefaults.size.width
  )
  groupNodeCreator.layoutBindings.addBinding(
    'height',
    (item: TSupplyChainItem) => item.height ?? graph.nodeDefaults.size.height
  )
  groupNodeCreator.layoutBindings.addBinding(
    'x',
    (item: TSupplyChainItem) => getNode(item, graph)?.layout.x ?? 0
  )
  groupNodeCreator.layoutBindings.addBinding(
    'y',
    (item: TSupplyChainItem) => getNode(item, graph)?.layout.y ?? 0
  )

  nodeCreator.addNodeUpdatedListener((_, evt) => {
    nodeCreator.updateLayout(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateStyle(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
  })

  groupNodeCreator.addNodeUpdatedListener((_, evt) => {
    groupNodeCreator.updateLayout(evt.graph, evt.item, evt.dataItem)
    groupNodeCreator.updateStyle(evt.graph, evt.item, evt.dataItem)
    groupNodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
    groupNodeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
  })

  edgeCreator.addEdgeUpdatedListener((_, evt) => {
    edgeCreator.updateStyle(evt.graph, evt.item, evt.dataItem)
    edgeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
    edgeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
  })

  graphManager.graphBuilder = graphBuilder
  graphManager.nodesSource = nodesSource
  graphManager.groupNodesSource = groupsSource
  graphManager.connectionsSource = edgesSource
  return graphManager
}

/**
 * Retrieves the SupplyChain item from an item's tag.
 */
export function getSupplyChainItem<TSupplyChainItem extends SupplyChainBaseItem>(
  item: INode | IEdge
): TSupplyChainItem {
  return item.tag as TSupplyChainItem
}

function compareData<T>(oldData: T[], newData: T[]): T[] {
  const unequalElements: T[] = []
  newData.forEach(obj2 => {
    const matchingObject = oldData.find(obj1 => JSON.stringify(obj1) === JSON.stringify(obj2))
    if (!matchingObject) {
      unequalElements.push(obj2)
    }
  })
  return unequalElements
}

export function convertToDefaultLabelStyle(
  connectionLabel: SimpleConnectionLabel
): DefaultLabelStyle {
  return new DefaultLabelStyle({
    textFill: 'currentColor',
    backgroundFill: '#ffffff',
    shape: connectionLabel.labelShape ?? 'round-rectangle',
    cssClass: `yfiles-react-connection-label ${connectionLabel.className ?? ''}`,
    insets: 5
  })
}

function getConnectionLabelText<TSupplyChainConnection extends SupplyChainConnection>(
  supplyChainModel: SupplyChainModel,
  connection: TSupplyChainConnection,
  connectionLabelProvider?: ConnectionLabelProvider<TSupplyChainConnection>
): string | null {
  if (connectionLabelProvider) {
    return connectionLabelProvider(connection, supplyChainModel)?.text ?? null
  }
  return null
}

function getConnectionLabelStyle<TSupplyChainConnection extends SupplyChainConnection>(
  supplyChainModel: SupplyChainModel,
  connection: TSupplyChainConnection,
  connectionLabelProvider?: ConnectionLabelProvider<TSupplyChainConnection>
): DefaultLabelStyle | null {
  if (connectionLabelProvider) {
    const connectionLabel = connectionLabelProvider(connection, supplyChainModel)
    if (connectionLabel) {
      return convertToDefaultLabelStyle(connectionLabel)
    }
  }
  return null
}
