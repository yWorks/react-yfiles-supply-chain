import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useGraphComponent, withGraphComponentProvider } from '@yworks/react-yfiles-core'
import { SupplyChainModel } from './SupplyChainModel'
import { ContentRectViewportLimiter } from './core/ContentRectViewportLimiter.ts'
import {
  DefaultFolderNodeConverter,
  DefaultGraph,
  FilteredGraphWrapper,
  FoldingManager,
  IEdge,
  INode
} from 'yfiles'
import {
  componentBackgroundColor,
  defaultFolderNodeSize,
  maximumZoom,
  minimumZoom
} from './core/defaults.ts'
import StylingFoldingEdgeConverter from './core/StylingFoldingEdgeConverter.ts'
import { createSupplyChainModel } from './SupplyChainModelImpl.ts'
import { LayoutSupport } from './core/LayoutSupport.ts'

const SupplyChainContext = createContext<SupplyChainModel | null>(null)

export function useSupplyChainContextInternal(): SupplyChainModel | null {
  return useContext(SupplyChainContext)
}

/**
 * A hook that provides access to the {@link SupplyChainModel} which has various functions that can
 * be used to interact with the {@link SupplyChain}.
 * It can only be used inside a {@link SupplyChain} component or a {@link SupplyChainProvider}.
 *
 * @returns the {@link SupplyChainModel} used in this context.
 *
 * ```tsx
 * function SupplyChainWrapper() {
 *   const { fitContent, zoomTo } = useSupplyChainContext()
 *
 *   return (
 *     <>
 *       <SupplyChain data={data} contextMenuItems={item => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => zoomTo([item]) }]
 *           }
 *           return []
 *         }}>
 *       </SupplyChain>
 *       <div style={{position: 'absolute', top: '20px', left: '20px'}}>
 *         <button onClick={() => fitContent()}>Fit Content</button>
 *       </div>
 *     </>
 *   )
 * }
 *
 * function SupplyChainComponent () {
 *   return (
 *     <SupplyChainProvider>
 *       <SupplyChainWrapper></SupplyChainWrapper>
 *     </SupplyChainProvider>
 *   )
 * }
 * ```
 */
export function useSupplyChainContext(): SupplyChainModel {
  const context = useContext(SupplyChainContext)
  if (context === null) {
    throw new Error(
      'This method can only be used inside a SupplyChain component or SupplyChainProvider.'
    )
  }
  return context
}

/**
 * The SupplyChainProvider component is a [context provider]{@link https://react.dev/learn/passing-data-deeply-with-context},
 * granting external access to the supply chain chart beyond the {@link SupplyChain} component itself.
 *
 * This functionality proves particularly valuable when there's a toolbar or sidebar housing elements that require
 * interaction with the supply chain chart. Examples would include buttons for zooming in and out or fitting the graph into the viewport.
 *
 * The snippet below illustrates how to leverage the SupplyChainProvider, enabling a component featuring both a {@link SupplyChain}
 * and a sidebar to utilize the {@link useSupplyChainContext} hook.
 *
 * ```tsx
 * function SupplyChainWrapper() {
 *   const { fitContent, zoomTo } = useSupplyChainContext()
 *
 *   return (
 *     <>
 *       <SupplyChain data={data} contextMenuItems={item => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => zoomTo([item]) }]
 *           }
 *           return []
 *         }}>
 *       </SupplyChain>
 *       <div style={{position: 'absolute', top: '20px', left: '20px'}}>
 *         <button onClick={() => fitContent()}>Fit Content</button>
 *       </div>
 *     </>
 *   )
 * }
 *
 * function SupplyChainComponent () {
 *   return (
 *     <SupplyChainProvider>
 *       <SupplyChainWrapper></SupplyChainWrapper>
 *     </SupplyChainProvider>
 *   )
 * }
 * ```
 */
export const SupplyChainProvider = withGraphComponentProvider(({ children }: PropsWithChildren) => {
  const graphComponent = useGraphComponent()

  if (!graphComponent) {
    return children
  }

  const SupplyChain = useMemo(() => {
    const hiddenItems = new Set<INode | IEdge>()
    const fullGraph = new DefaultGraph()
    const filteredGraph = new FilteredGraphWrapper(
      fullGraph,
      node => !hiddenItems.has(node),
      edge => !hiddenItems.has(edge)
    )

    const foldingManager = new FoldingManager(filteredGraph)
    graphComponent.graph = foldingManager.createFoldingView().graph
    ;(foldingManager.folderNodeConverter as DefaultFolderNodeConverter).folderNodeSize =
      defaultFolderNodeSize
    foldingManager.foldingEdgeConverter = new StylingFoldingEdgeConverter()

    graphComponent.div.style.backgroundColor = componentBackgroundColor

    graphComponent.viewportLimiter = new ContentRectViewportLimiter()
    graphComponent.maximumZoom = maximumZoom
    graphComponent.minimumZoom = minimumZoom

    const layoutSupport = new LayoutSupport(graphComponent)
    return createSupplyChainModel(graphComponent, hiddenItems, layoutSupport)
  }, [])

  return <SupplyChainContext.Provider value={SupplyChain}>{children}</SupplyChainContext.Provider>
})
