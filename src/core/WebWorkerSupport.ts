import {
  FromSketchLayerAssigner,
  GroupLayeringPolicy,
  HierarchicalLayout,
  ILayoutAlgorithm,
  LayoutAnchoringStage,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  RoutingStyleDescriptor,
} from '@yfiles/yfiles'
import {SupplyChainLayoutOptions} from '../SupplyChain.tsx'
import {defaultLayoutOptions} from './defaults.ts'

export function createLayout(
  incremental: boolean,
  layoutOptions: SupplyChainLayoutOptions
): ILayoutAlgorithm {
  const layout = new HierarchicalLayout({
    layoutOrientation: layoutOptions.layoutDirection ?? defaultLayoutOptions.layoutDirection,
    edgeLabelPlacement: 'integrated',
    fromSketchMode: incremental,
    defaultNodeDescriptor: {
      layerAlignment: 0
    },
    defaultEdgeDescriptor: {
      minimumFirstSegmentLength:
        layoutOptions.minimumFirstSegmentLength ?? defaultLayoutOptions.minimumFirstSegmentLength!,
      minimumLastSegmentLength:
        layoutOptions.minimumLastSegmentLength ?? defaultLayoutOptions.minimumLastSegmentLength!,
      routingStyleDescriptor: new RoutingStyleDescriptor({
        routingStyle: layoutOptions.routingStyle ?? defaultLayoutOptions.routingStyle!
      })
    },
    groupLayeringPolicy: GroupLayeringPolicy.RECURSIVE_COMPACT,
    coordinateAssigner: {
      // do not expand group node vertically
      groupCompaction: true
    },
    stopDuration:
      layoutOptions.maximumDuration ??
      defaultLayoutOptions.maximumDuration ??
      Number.POSITIVE_INFINITY
  })

  if (incremental) {
    layout.core.fixedElementsLayerAssigner = new FromSketchLayerAssigner({
      maximumNodeSize: 10
    })
  }
  return new LayoutAnchoringStage({ coreLayout: layout })
}

function applyLayout(
  graph: LayoutGraph,
  incremental: boolean,
  layoutOptions: SupplyChainLayoutOptions
): void {
  const layout = createLayout(incremental, layoutOptions)
  layout.applyLayout(graph)
}

/**
 * Initializes the Web Worker for the layout calculation.
 *
 * Web Workers must be provided by the application using the supply chain component,
 * if worker layout is required. The Worker itself is very bare-bones and the Worker
 * layout feature can be used as follows:
 *
 * ```ts
 * // in LayoutWorker.ts
 * import { initializeWebWorker } from '@yworks/react-yfiles-supply-chain/WebWorkerSupport'
 * initializeWebWorker(self)
 * ```
 *
 * ```tsx
 * // in index.tsx
 * const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
 *   type: 'module'
 * })
 *
 * // ...
 *
 * return <SupplyChain data={data} layoutWorker={layoutWorker}></SupplyChain>
 * ```
 */
export function initializeWebWorker(self: Window) {
  self.addEventListener(
    'message',
    e => {
      if (e.data.license) {
        License.value = e.data.license
        self.postMessage('licensed')
        return
      }

      if (e.data === 'check-is-ready') {
        // signal that the Web Worker thread is ready to execute
        self.postMessage('ready')
        return
      }

      const incremental = e.data.incremental
      const layoutOptions = e.data.layoutOptions as SupplyChainLayoutOptions

      new LayoutExecutorAsyncWorker(graph => applyLayout(graph, incremental, layoutOptions))
        .process(e.data)
        .then(data => {
          self.postMessage(data)
        })
        .catch(errorObj => {
          self.postMessage(errorObj)
        })
    },
    false
  )

  // signal that the Web Worker thread is ready to execute
  self.postMessage('ready')
}
