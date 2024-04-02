import { UserSupplyChainItem, SupplyChainItem } from '../SupplyChain.tsx'
import { getHighlightClasses } from './template-utils.ts'
import { RenderGroupNodeProps as RenderGroupProps } from '@yworks/react-yfiles-core'
import { useSupplyChainContext } from '../SupplyChainProvider.tsx'
import '../styles/supply-chain-group.css'
import { useMemo } from 'react'

/**
 * A default component that visualizes group and folder nodes in the supply chain. It provides a collapse/expand button
 * and shows the group's `name` or `id` as header. Additionally, the collapsed folder shows the number of children that
 * are hidden within the folder node.
 * The component can be adjusted for each item individually or for all items at once by setting
 * {@link SupplyChainBaseItem.className} or {@link SupplyChainBaseItem.style} in the data.
 *
 * The component is used as the default visualization if no `renderGroup` prop is specified on {@link SupplyChain}.
 * However, it can be integrated in another component, for example, to have different styles for different items.
 *
 * ```tsx
 * function SupplyChainComponent() {
 *     const MySupplyChainGroup = useMemo(
 *       () => (props: RenderGroupProps<SupplyChainItem>) => {
 *         const { dataItem } = props
 *         const { isFolderNode } = props
 *         const supplyChainContext = useSupplyChainContext()
 *
 *         if (dataItem?.name?.includes('Material')) {
 *           return (
 *             <div
 *               style={{
 *                 width: '100%',
 *                 height: '100%',
 *                 overflow: 'hidden',
 *                 backgroundColor: isFolderNode ? 'lightblue' : 'white'
 *               }}
 *             >
 *               {isFolderNode && (
 *                 <button onClick={() => supplyChainContext.toggleExpansionState(dataItem)}>
 *                   Expand {dataItem.name}
 *                 </button>
 *               )}
 *               {!isFolderNode && (
 *                 <div style={{ display: 'flex', justifyItems: 'flex-start', alignItems: 'center' }}>
 *                   <button onClick={() => supplyChainContext.toggleExpansionState(dataItem)}>
 *                     Collapse {dataItem.name}
 *                   </button>
 *                 </div>
 *               )}
 *             </div>
 *           )
 *         } else {
 *           return <RenderSupplyChainGroup {...props}></RenderSupplyChainGroup>
 *         }
 *       },
 *       []
 *     )
 *
 *     return (
 *       <SupplyChain data={data} renderGroup={MySupplyChainGroup}></SupplyChain>
 *     )
 *   }
 * ```
 */
export function RenderSupplyChainGroup<TSupplyChainItem extends SupplyChainItem>({
  dataItem,
  detail,
  hovered,
  focused,
  selected,
  isFolderNode
}: RenderGroupProps<TSupplyChainItem>) {
  const customSupplyChainItem = dataItem as UserSupplyChainItem & { __color?: string }
  const supplyChainContext = useSupplyChainContext()

  const children = useMemo(() => {
    return supplyChainContext.getChildren(dataItem)
  }, [dataItem])

  const name = customSupplyChainItem.name ?? customSupplyChainItem.id

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
        className={`yfiles-react-detail-node yfiles-react-group ${getHighlightClasses(
          selected,
          hovered,
          focused
        )} ${isFolderNode ? 'yfiles-react-group--collapsed' : 'yfiles-react-group--expanded'} ${
          customSupplyChainItem.__color
            ? `yfiles-react-color__${customSupplyChainItem.__color}--transparent`
            : 'yfiles-react-color__white--transparent'
        }`}
      >
        <div
          className={`${customSupplyChainItem.className ?? ''}`.trim()}
          style={customSupplyChainItem.style ?? {}}
        >
          <div
            className="yfiles-react-group__header"
            onClick={() => supplyChainContext.toggleExpansionState(dataItem)}
          >
            <button className="yfiles-react-group__icon-button">
              <i className="yfiles-react-group__icon yfiles-react-group__collapse-icon"></i>
            </button>
            <div className="yfiles-react-group__name">{name}</div>
          </div>

          <div className="yfiles-react-group__content">
            {isFolderNode && (
              <>
                <div>Physical Items: {children.length}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
