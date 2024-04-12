import {
  DefaultLabelStyle,
  FixNodeLayoutData,
  type GraphComponent,
  HierarchicLayoutData,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabel,
  ILabelStyle,
  INode,
  LayoutData,
  LayoutExecutor,
  LayoutExecutorAsync,
  Mapper,
  PartitionCellId,
  PartitionGrid,
  PartitionGridData,
  PolylineEdgeStyle,
  Rect
} from 'yfiles'
import {
  GridPositioningFunction,
  SupplyChainItem,
  SupplyChainLayoutOptions
} from '../SupplyChain.tsx'
import { Dispatch, SetStateAction } from 'react'
import { defaultGraphFitInsets, defaultLayoutOptions } from './defaults.ts'
import { registerWebWorker } from '@yworks/react-yfiles-core'
import { createLayout } from './WebWorkerSupport.ts'

export class LayoutSupport<TSupplyChainItem extends SupplyChainItem> {
  private workerPromise: Promise<Worker> | null = null
  set layoutWorker(worker: Worker | undefined) {
    if (worker) {
      this.workerPromise = registerWebWorker(worker)
    } else {
      this.workerPromise = null
    }
  }
  private executorAsync: LayoutExecutorAsync | null = null
  private executor: LayoutExecutor | null = null

  private hiddenEdgeStyle = new PolylineEdgeStyle({ stroke: 'transparent' })
  private hiddenLabelStyle = new DefaultLabelStyle({
    textFill: 'transparent',
    backgroundFill: 'transparent'
  })

  public layoutOptions: SupplyChainLayoutOptions = defaultLayoutOptions
  public gridPositioningFunction?: GridPositioningFunction<TSupplyChainItem>
  public setLayoutRunning?: Dispatch<SetStateAction<boolean>>

  constructor(private readonly graphComponent: GraphComponent) {}

  private createLayoutData(
    graph: IGraph,
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null
  ): LayoutData | null {
    let layoutData: LayoutData | null = null

    if (incremental) {
      layoutData = new HierarchicLayoutData({
        incrementalHints: (item, factory) =>
          item instanceof INode && incrementalNodes.includes(item)
            ? graph.isGroupNode(item)
              ? factory.createIncrementalGroupHint(item)
              : factory.createLayerIncrementallyHint(item)
            : null
      })
    }

    if (
      this.gridPositioningFunction !== undefined &&
      typeof this.gridPositioningFunction !== 'function'
    ) {
      console.warn(`gridPositioningFunction is not a function: ${this.gridPositioningFunction}`)
    } else if (typeof this.gridPositioningFunction === 'function') {
      let maxRow = 0
      let maxColumn = 0
      const gridPositionMap: Map<INode, { row: number; column: number }> = new Map()

      graph.nodes.forEach(node => {
        const gridPosition = this.gridPositioningFunction!(node.tag)
        gridPositionMap.set(node, gridPosition)

        maxRow = Math.max(gridPosition.row, maxRow)
        maxColumn = Math.max(gridPosition.column, maxColumn)
      })

      const grid = new PartitionGrid(maxRow + 1, maxColumn + 1)
      const cellIds = new Mapper<INode, PartitionCellId>()

      graph.nodes.forEach(node => {
        const gridPosition = gridPositionMap.get(node)
        if (gridPosition) {
          cellIds.set(node, grid.createCellId(gridPosition.row, gridPosition.column))
        }
      })

      if (!layoutData) {
        layoutData = new HierarchicLayoutData()
      }

      ;(layoutData as HierarchicLayoutData).partitionGridData = new PartitionGridData({
        grid,
        cellIds
      })
    }

    if (fixedNode) {
      const fixNodeLayoutData = new FixNodeLayoutData()
      fixNodeLayoutData.fixedNodes.item = fixedNode
      layoutData = layoutData!.combineWith(fixNodeLayoutData)
    }

    return layoutData
  }

  async runLayout(
    incremental: boolean = false,
    incrementalNodes: INode[] = [],
    fixedNode: INode | null = null,
    fitViewport = false
  ): Promise<void> {
    this.setLayoutRunning?.(true)

    const edgeStyles: Map<IEdge, IEdgeStyle> = new Map()
    const labelStyles: Map<ILabel, ILabelStyle> = new Map()

    const graph = this.graphComponent.graph

    if (incrementalNodes.length > 0) {
      incrementalNodes
        .map(node => graph.edgesAt(node).toArray())
        .flat()
        .forEach(edge => {
          if (!edgeStyles.has(edge)) {
            edgeStyles.set(edge, edge.style)
            graph.setStyle(edge, this.hiddenEdgeStyle)
            edge.labels.forEach(label => {
              if (!labelStyles.has(label)) {
                labelStyles.set(label, label.style)
                graph.setStyle(label, this.hiddenLabelStyle)
              }
            })
          }
        })
    }

    const executor =
      this.workerPromise !== null
        ? await this.createLayoutExecutorAsync(
            incremental,
            incrementalNodes,
            fixedNode,
            fitViewport
          )
        : await this.createLayoutExecutor(incremental, incrementalNodes, fixedNode, fitViewport)

    try {
      await executor.start()
      this.graphComponent.viewportLimiter.bounds = this.graphComponent.contentRect
    } catch (e) {
      if ((e as Record<string, unknown>).name === 'AlgorithmAbortedError') {
        console.error('Layout calculation was aborted because maximum duration time was exceeded.')
      } else {
        console.error('Something went wrong during the layout calculation')
        console.error(e)
      }
    } finally {
      if (incrementalNodes.length > 0) {
        edgeStyles.forEach((style, edge) => {
          graph.setStyle(edge, style)
        })
        labelStyles.forEach((style, label) => {
          graph.setStyle(label, style)
        })
      }

      this.setLayoutRunning?.(false)
    }
  }

  /**
   * When a layout animation is already running, it might have started
   * with now obsolete node sizes - stop the running animation and restore
   * the latest measured node sizes.
   */
  private async maybeCancel() {
    const syncRunning = this.executor && this.executor.running
    const asyncRunning = this.executorAsync && this.executorAsync.running
    if (syncRunning || asyncRunning) {
      const layouts = new Map<INode, Rect>()
      for (const node of this.graphComponent.graph.nodes) {
        layouts.set(node, node.layout.toRect())
      }
      await this.executor?.stop()
      await this.executorAsync?.cancel()
      for (const node of this.graphComponent.graph.nodes) {
        if (layouts.has(node)) {
          this.graphComponent.graph.setNodeLayout(node, layouts.get(node)!)
        }
      }
    }
  }

  private async createLayoutExecutor(
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null,
    fitViewport: boolean
  ): Promise<LayoutExecutor> {
    await this.maybeCancel()

    this.executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: createLayout(incremental, this.layoutOptions),
      layoutData: this.createLayoutData(
        this.graphComponent.graph,
        incremental,
        incrementalNodes,
        fixedNode
      ),
      duration: '300ms',
      animateViewport: fitViewport,
      updateContentRect: true,
      targetBoundsInsets: defaultGraphFitInsets
    })

    return Promise.resolve(this.executor)
  }

  private async createLayoutExecutorAsync(
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null,
    fitViewport: boolean
  ): Promise<LayoutExecutorAsync> {
    await this.maybeCancel()

    const worker = await this.workerPromise!

    // helper function that performs the actual message passing to the web worker
    const webWorkerMessageHandler = (data: any): Promise<any> => {
      // keep track of the requested layout, to ignore stale layouts
      const thisRequest = data.token
      data.incremental = incremental
      data.layoutOptions = this.layoutOptions
      return new Promise((resolve, reject) => {
        worker.onmessage = e => {
          // don't resolve cancelled requests
          if (e.data && thisRequest === e.data.token) {
            if (e.data.name === 'AlgorithmAbortedError') {
              reject(e.data)
            } else {
              resolve(e.data)
            }
          }
        }

        worker.postMessage(data)
      })
    }

    this.executorAsync = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graphComponent: this.graphComponent,
      layoutData: this.createLayoutData(
        this.graphComponent.graph,
        incremental,
        incrementalNodes,
        fixedNode
      ),
      duration: '300ms',
      animateViewport: fitViewport,
      updateContentRect: true,
      targetBoundsInsets: defaultGraphFitInsets
    })
    return this.executorAsync
  }
}
